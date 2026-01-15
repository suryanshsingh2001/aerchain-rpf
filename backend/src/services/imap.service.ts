import Imap from "imap-simple";
import { simpleParser, ParsedMail } from "mailparser";
import { env, prisma } from "../config";
import { geminiService } from "./gemini.service";
import { Rfp } from "@prisma/client";

interface ImapConfig {
  imap: {
    user: string;
    password: string;
    host: string;
    port: number;
    tls: boolean;
    tlsOptions: {
      rejectUnauthorized: boolean;
    };
    authTimeout: number;
  };
}

interface FetchedEmail {
  from: string;
  to: string;
  subject: string;
  body: string;
  html?: string;
  date: Date;
  messageId?: string;
  attachments: Array<{
    filename: string;
    contentType: string;
    size: number;
    content?: Buffer;
  }>;
}

interface ProcessedEmailResult {
  success: boolean;
  emailId?: string;
  proposalId?: string;
  vendorId?: string;
  rfpId?: string;
  error?: string;
  action: "created" | "updated" | "skipped" | "failed";
}

class ImapService {
  private config: ImapConfig | null = null;
  private isPolling: boolean = false;
  private pollingInterval: NodeJS.Timeout | null = null;
  private lastFetchTime: Date | null = null;

  constructor() {
    this.initConfig();
  }

  /**
   * Initialize IMAP configuration from environment
   */
  private initConfig(): void {
    if (!env.imap?.user || !env.imap?.password || !env.imap?.host) {
      console.warn("⚠️ IMAP configuration incomplete. Inbound email polling disabled.");
      return;
    }

    this.config = {
      imap: {
        user: env.imap.user,
        password: env.imap.password,
        host: env.imap.host,
        port: env.imap.port || 993,
        tls: env.imap.tls !== false,
        tlsOptions: {
          rejectUnauthorized: false, // Allow self-signed certs for dev
        },
        authTimeout: 10000,
      },
    };
  }

  /**
   * Check if IMAP is configured
   */
  isConfigured(): boolean {
    return this.config !== null;
  }

  /**
   * Get service status
   */
  getStatus(): {
    configured: boolean;
    polling: boolean;
    lastFetch: Date | null;
    host?: string;
    user?: string;
  } {
    return {
      configured: this.isConfigured(),
      polling: this.isPolling,
      lastFetch: this.lastFetchTime,
      host: this.config?.imap.host,
      user: this.config?.imap.user,
    };
  }

  /**
   * Connect to IMAP server
   */
  private async connect(): Promise<Imap.ImapSimple> {
    if (!this.config) {
      throw new Error("IMAP not configured");
    }

    try {
      const connection = await Imap.connect(this.config);
      return connection;
    } catch (error) {
      console.error("❌ IMAP connection failed:", error);
      throw error;
    }
  }

  /**
   * Get list of known vendor emails from database
   */
  private async getVendorEmails(): Promise<string[]> {
    const vendors = await prisma.vendor.findMany({
      where: { status: "ACTIVE" },
      select: { email: true },
    });
    return vendors.map((v) => v.email.toLowerCase());
  }

  /**
   * Fetch only RFP-related emails from INBOX
   * Filters for: emails with "RFP" in subject OR from known vendors
   */
  async fetchUnreadEmails(): Promise<FetchedEmail[]> {
    if (!this.config) {
      throw new Error("IMAP not configured");
    }

    const connection = await this.connect();
    const emails: FetchedEmail[] = [];

    try {
      await connection.openBox("INBOX");

      // Get known vendor emails for filtering
      const vendorEmails = await this.getVendorEmails();

      // Search for unread emails that contain "RFP" in subject
      // This targets replies to our RFP emails
      const searchCriteria = [
        "UNSEEN",
        ["OR", 
          ["SUBJECT", "RFP"],  // Emails with RFP in subject
          ["SUBJECT", "Re:"]   // Reply emails
        ]
      ];
      
      const fetchOptions = {
        bodies: ["HEADER", "TEXT", ""],
        markSeen: false, // Don't mark as seen yet - only mark relevant ones
        struct: true,
      };

      const messages = await connection.search(searchCriteria, fetchOptions);

      for (const message of messages) {
        try {
          const all = message.parts.find((part) => part.which === "");
          if (!all) continue;

          const parsed: ParsedMail = await simpleParser(all.body);

          const fromAddress = (parsed.from?.value?.[0]?.address || "").toLowerCase();
          const toAddress = parsed.to
            ? Array.isArray(parsed.to)
              ? parsed.to[0]?.value?.[0]?.address || ""
              : parsed.to.value?.[0]?.address || ""
            : "";
          const subject = parsed.subject || "";

          // Only process if:
          // 1. Email is from a known vendor, OR
          // 2. Subject contains RFP pattern (RFP-XXXXXXXX)
          const isFromVendor = vendorEmails.includes(fromAddress);
          const hasRfpPattern = /RFP-[A-Z0-9]{8}/i.test(subject);
          const isRfpRelated = subject.toLowerCase().includes("rfp") || 
                               subject.toLowerCase().includes("proposal") ||
                               subject.toLowerCase().includes("quote");

          if (!isFromVendor && !hasRfpPattern && !isRfpRelated) {
            // Skip non-relevant emails - don't mark as read
            console.log(`⏭️ Skipping non-RFP email: "${subject}" from ${fromAddress}`);
            continue;
          }

          // Mark this specific email as seen since we're processing it
          try {
            await connection.addFlags(message.attributes.uid, ["\\Seen"]);
          } catch (flagError) {
            console.warn("Could not mark email as seen:", flagError);
          }

          const attachments = (parsed.attachments || []).map((att) => ({
            filename: att.filename || "unnamed",
            contentType: att.contentType,
            size: att.size,
            content: att.content,
          }));

          emails.push({
            from: fromAddress,
            to: toAddress,
            subject,
            body: parsed.text || "",
            html: parsed.html || undefined,
            date: parsed.date || new Date(),
            messageId: parsed.messageId,
            attachments,
          });

          console.log(`📧 Found RFP-related email: "${subject}" from ${fromAddress}`);
        } catch (parseError) {
          console.error("Error parsing email:", parseError);
        }
      }

      this.lastFetchTime = new Date();
      console.log(`📧 Fetched ${emails.length} unread emails`);
    } finally {
      connection.end();
    }

    return emails;
  }

  /**
   * Process a single email - identify vendor, RFP, and create/update proposal
   */
  async processEmail(email: FetchedEmail): Promise<ProcessedEmailResult> {
    try {
      // Try to identify the vendor by email
      const vendor = await prisma.vendor.findUnique({
        where: { email: email.from.toLowerCase() },
      });

      if (!vendor) {
        // Log the email for manual review
        await prisma.email.create({
          data: {
            type: "INBOUND",
            fromAddress: email.from,
            toAddress: email.to,
            subject: email.subject,
            body: email.body,
            rawPayload: {
              html: email.html,
              attachments: email.attachments.map((a) => ({
                filename: a.filename,
                contentType: a.contentType,
                size: a.size,
              })),
              date: email.date.toISOString(),
              messageId: email.messageId,
            } as object,
            status: "RECEIVED",
          },
        });

        return {
          success: false,
          error: `Unknown vendor email: ${email.from}`,
          action: "skipped",
        };
      }

      // Try to identify the RFP from subject (looking for RFP-XXXXXXXX pattern)
      const rfpIdMatch = email.subject.match(/RFP-([A-Z0-9]{8})/i);
      let rfp: Rfp | null = null;

      if (rfpIdMatch) {
        // Find RFP by the last 8 characters of the ID
        const allRfps = await prisma.rfp.findMany({
          where: { status: { in: ["SENT", "EVALUATING"] } },
        });
        rfp =
          allRfps.find(
            (r) => r.id.slice(-8).toUpperCase() === rfpIdMatch[1].toUpperCase()
          ) || null;
      }

      // If not found by subject, try to find the most recent RFP sent to this vendor
      if (!rfp) {
        const rfpVendor = await prisma.rfpVendor.findFirst({
          where: {
            vendorId: vendor.id,
            emailStatus: "SENT",
          },
          include: { rfp: true },
          orderBy: { sentAt: "desc" },
        });

        if (rfpVendor) {
          rfp = rfpVendor.rfp;
        }
      }

      if (!rfp) {
        // Log the email for manual association
        const savedEmail = await prisma.email.create({
          data: {
            type: "INBOUND",
            vendorId: vendor.id,
            fromAddress: email.from,
            toAddress: email.to,
            subject: email.subject,
            body: email.body,
            rawPayload: {
              html: email.html,
              attachments: email.attachments.map((a) => ({
                filename: a.filename,
                contentType: a.contentType,
                size: a.size,
              })),
              date: email.date.toISOString(),
              messageId: email.messageId,
            } as object,
            status: "RECEIVED",
          },
        });

        return {
          success: false,
          emailId: savedEmail.id,
          vendorId: vendor.id,
          error: "Could not identify RFP for this response",
          action: "skipped",
        };
      }

      // Log the email
      const savedEmail = await prisma.email.create({
        data: {
          type: "INBOUND",
          rfpId: rfp.id,
          vendorId: vendor.id,
          fromAddress: email.from,
          toAddress: email.to,
          subject: email.subject,
          body: email.body,
          rawPayload: {
            html: email.html,
            attachments: email.attachments.map((a) => ({
              filename: a.filename,
              contentType: a.contentType,
              size: a.size,
            })),
            date: email.date.toISOString(),
            messageId: email.messageId,
          } as object,
          status: "RECEIVED",
        },
      });

      // Combine email body with attachment text for parsing
      // (In a real system, you'd parse PDFs/docs here)
      const contentForParsing = email.body;

      // Check if proposal already exists
      const existingProposal = await prisma.proposal.findUnique({
        where: {
          rfpId_vendorId: {
            rfpId: rfp.id,
            vendorId: vendor.id,
          },
        },
      });

      if (existingProposal) {
        // Update existing proposal with new content
        const parsedData = await geminiService.parseVendorResponse(
          contentForParsing,
          rfp
        );

        const updatedProposal = await prisma.proposal.update({
          where: { id: existingProposal.id },
          data: {
            rawContent: email.body,
            rawSubject: email.subject,
            parsedData: parsedData as object,
            totalPrice: parsedData.totalPrice,
            currency: parsedData.currency || "USD",
            deliveryDays: parsedData.deliveryDays,
            warrantyMonths: parsedData.warrantyMonths,
            paymentTerms: parsedData.paymentTerms,
            status: "PARSED",
          },
        });

        console.log(`📝 Updated proposal ${updatedProposal.id} from ${vendor.name}`);

        return {
          success: true,
          emailId: savedEmail.id,
          proposalId: updatedProposal.id,
          vendorId: vendor.id,
          rfpId: rfp.id,
          action: "updated",
        };
      }

      // Parse vendor response using AI
      const parsedData = await geminiService.parseVendorResponse(
        contentForParsing,
        rfp
      );

      // Create new proposal
      const proposal = await prisma.proposal.create({
        data: {
          rfpId: rfp.id,
          vendorId: vendor.id,
          rawContent: email.body,
          rawSubject: email.subject,
          parsedData: parsedData as object,
          totalPrice: parsedData.totalPrice,
          currency: parsedData.currency || "USD",
          deliveryDays: parsedData.deliveryDays,
          warrantyMonths: parsedData.warrantyMonths,
          paymentTerms: parsedData.paymentTerms,
          status: "PARSED",
        },
      });

      console.log(`✅ Created proposal ${proposal.id} from ${vendor.name}`);

      return {
        success: true,
        emailId: savedEmail.id,
        proposalId: proposal.id,
        vendorId: vendor.id,
        rfpId: rfp.id,
        action: "created",
      };
    } catch (error) {
      console.error("Error processing email:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        action: "failed",
      };
    }
  }

  /**
   * Fetch and process all unread emails
   */
  async fetchAndProcessEmails(): Promise<{
    fetched: number;
    processed: ProcessedEmailResult[];
  }> {
    const emails = await this.fetchUnreadEmails();
    const results: ProcessedEmailResult[] = [];

    for (const email of emails) {
      const result = await this.processEmail(email);
      results.push(result);
    }

    const created = results.filter((r) => r.action === "created").length;
    const updated = results.filter((r) => r.action === "updated").length;
    const skipped = results.filter((r) => r.action === "skipped").length;
    const failed = results.filter((r) => r.action === "failed").length;

    console.log(
      `📊 Email processing complete: ${created} created, ${updated} updated, ${skipped} skipped, ${failed} failed`
    );

    return {
      fetched: emails.length,
      processed: results,
    };
  }

  /**
   * Start polling for new emails at specified interval
   */
  startPolling(intervalMinutes: number = 2): void {
    if (!this.isConfigured()) {
      console.warn("⚠️ Cannot start polling: IMAP not configured");
      return;
    }

    if (this.isPolling) {
      console.log("ℹ️ Already polling for emails");
      return;
    }

    this.isPolling = true;
    const intervalMs = intervalMinutes * 60 * 1000;

    console.log(`📬 Starting email polling every ${intervalMinutes} minutes`);

    // Initial fetch
    this.fetchAndProcessEmails().catch(console.error);

    // Set up interval
    this.pollingInterval = setInterval(() => {
      this.fetchAndProcessEmails().catch(console.error);
    }, intervalMs);
  }

  /**
   * Stop polling for emails
   */
  stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.isPolling = false;
    console.log("⏹️ Email polling stopped");
  }

  /**
   * Test IMAP connection
   */
  async testConnection(): Promise<{
    success: boolean;
    message: string;
    details?: {
      host: string;
      user: string;
      mailboxes?: string[];
    };
  }> {
    if (!this.config) {
      return {
        success: false,
        message: "IMAP not configured. Please set IMAP_HOST, IMAP_USER, and IMAP_PASS environment variables.",
      };
    }

    try {
      const connection = await this.connect();
      const boxes = await connection.getBoxes();
      const mailboxes = Object.keys(boxes);
      connection.end();

      return {
        success: true,
        message: "IMAP connection successful",
        details: {
          host: this.config.imap.host,
          user: this.config.imap.user,
          mailboxes,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `IMAP connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }
}

export const imapService = new ImapService();
