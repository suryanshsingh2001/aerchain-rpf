import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { prisma } from "../config";
import { geminiService, imapService } from "../services";
import { sendSuccess } from "../utils";
import { BadRequestError } from "../middleware";
import { InboundEmailPayload } from "../types";
import { Rfp } from "@prisma/client";
import { inboundEmailSchema } from "../schemas";

/**
 * Handle inbound email webhook
 * This endpoint receives vendor responses via email webhook
 */
export const handleInboundEmail = asyncHandler(
  async (req: Request, res: Response) => {
    const emailData = inboundEmailSchema.parse(req.body) as InboundEmailPayload;

    // Try to identify the vendor by email
    const vendor = await prisma.vendor.findUnique({
      where: { email: emailData.from },
    });

    if (!vendor) {
      // Log the email even if we can't identify the vendor
      await prisma.email.create({
        data: {
          type: "INBOUND",
          fromAddress: emailData.from,
          toAddress: emailData.to,
          subject: emailData.subject,
          body: emailData.body,
          rawPayload: emailData.rawPayload as object,
          status: "RECEIVED",
        },
      });

      throw new BadRequestError(
        "Unknown vendor email. Email logged for manual review."
      );
    }

    // Try to identify the RFP from subject (looking for RFP-XXXXXXXX pattern)
    const rfpIdMatch = emailData.subject.match(/RFP-([A-Z0-9]{8})/i);
    let rfp: Rfp | null = null;

    if (rfpIdMatch) {
      // Find RFP by the last 8 characters of the ID
      const allRfps = await prisma.rfp.findMany({
        where: { status: "SENT" },
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
      await prisma.email.create({
        data: {
          type: "INBOUND",
          vendorId: vendor.id,
          fromAddress: emailData.from,
          toAddress: emailData.to,
          subject: emailData.subject,
          body: emailData.body,
          rawPayload: emailData.rawPayload as object,
          status: "RECEIVED",
        },
      });

      throw new BadRequestError(
        "Could not identify RFP for this response. Email logged for manual association."
      );
    }

    // Log the email
    await prisma.email.create({
      data: {
        type: "INBOUND",
        rfpId: rfp.id,
        vendorId: vendor.id,
        fromAddress: emailData.from,
        toAddress: emailData.to,
        subject: emailData.subject,
        body: emailData.body,
        rawPayload: emailData.rawPayload as object,
        status: "RECEIVED",
      },
    });

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
        emailData.body,
        rfp
      );

      const updatedProposal = await prisma.proposal.update({
        where: { id: existingProposal.id },
        data: {
          rawContent: emailData.body,
          rawSubject: emailData.subject,
          parsedData: parsedData as object,
          totalPrice: parsedData.totalPrice,
          currency: parsedData.currency || "USD",
          deliveryDays: parsedData.deliveryDays,
          warrantyMonths: parsedData.warrantyMonths,
          paymentTerms: parsedData.paymentTerms,
          status: "PARSED",
        },
        include: { vendor: true },
      });

      sendSuccess(res, {
        message: "Proposal updated from vendor response",
        proposal: updatedProposal,
      });
      return;
    }

    // Parse vendor response using AI
    const parsedData = await geminiService.parseVendorResponse(
      emailData.body,
      rfp
    );

    // Create new proposal
    const proposal = await prisma.proposal.create({
      data: {
        rfpId: rfp.id,
        vendorId: vendor.id,
        rawContent: emailData.body,
        rawSubject: emailData.subject,
        parsedData: parsedData as object,
        totalPrice: parsedData.totalPrice,
        currency: parsedData.currency || "USD",
        deliveryDays: parsedData.deliveryDays,
        warrantyMonths: parsedData.warrantyMonths,
        paymentTerms: parsedData.paymentTerms,
        status: "PARSED",
      },
      include: { vendor: true },
    });

    sendSuccess(
      res,
      {
        message: "Proposal received and parsed successfully",
        proposal,
      },
      201
    );
  }
);

/**
 * Get all emails (for debugging/admin purposes)
 */
export const getEmails = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;
  const type = req.query.type as "INBOUND" | "OUTBOUND" | undefined;

  const where: Record<string, unknown> = {};
  if (type) {
    where.type = type;
  }

  const [emails, total] = await Promise.all([
    prisma.email.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        rfp: { select: { id: true, title: true } },
        vendor: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.email.count({ where }),
  ]);

  sendSuccess(res, emails, 200, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
});

/**
 * Get IMAP service status
 */
export const getImapStatus = asyncHandler(
  async (_req: Request, res: Response) => {
    const status = imapService.getStatus();
    sendSuccess(res, status);
  }
);

/**
 * Test IMAP connection
 */
export const testImapConnection = asyncHandler(
  async (_req: Request, res: Response) => {
    const result = await imapService.testConnection();
    sendSuccess(res, result);
  }
);

/**
 * Manually fetch and process emails via IMAP
 */
export const fetchEmails = asyncHandler(
  async (_req: Request, res: Response) => {
    if (!imapService.isConfigured()) {
      throw new BadRequestError(
        "IMAP not configured. Please set IMAP_HOST, IMAP_USER, and IMAP_PASS environment variables."
      );
    }

    const result = await imapService.fetchAndProcessEmails();

    const summary = {
      fetched: result.fetched,
      created: result.processed.filter((r) => r.action === "created").length,
      updated: result.processed.filter((r) => r.action === "updated").length,
      skipped: result.processed.filter((r) => r.action === "skipped").length,
      failed: result.processed.filter((r) => r.action === "failed").length,
      details: result.processed,
    };

    sendSuccess(res, summary);
  }
);

/**
 * Start IMAP polling
 */
export const startImapPolling = asyncHandler(
  async (req: Request, res: Response) => {
    const intervalMinutes = parseInt(req.query.interval as string) || 2;

    if (!imapService.isConfigured()) {
      throw new BadRequestError(
        "IMAP not configured. Please set IMAP_HOST, IMAP_USER, and IMAP_PASS environment variables."
      );
    }

    imapService.startPolling(intervalMinutes);
    sendSuccess(res, {
      message: `Email polling started with ${intervalMinutes} minute interval`,
      status: imapService.getStatus(),
    });
  }
);

/**
 * Stop IMAP polling
 */
export const stopImapPolling = asyncHandler(
  async (_req: Request, res: Response) => {
    imapService.stopPolling();
    sendSuccess(res, {
      message: "Email polling stopped",
      status: imapService.getStatus(),
    });
  }
);
