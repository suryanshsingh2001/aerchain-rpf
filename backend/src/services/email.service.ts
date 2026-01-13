import nodemailer, { Transporter } from "nodemailer";
import { env, prisma } from "../config";
import { Rfp, Vendor } from "@prisma/client";

class EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth:
        env.smtp.user && env.smtp.pass
          ? {
              user: env.smtp.user,
              pass: env.smtp.pass,
            }
          : undefined,
    });
  }

  /**
   * Format RFP as professional email content
   */
  private formatRfpEmail(
    rfp: Rfp,
    vendor: Vendor
  ): { subject: string; html: string; text: string } {
    const items = rfp.items as {
      name: string;
      quantity: number;
      specifications?: string;
      unit?: string;
    }[];

    const itemsTable = items
      .map(
        (item) =>
          `<tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.name}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.quantity} ${
            item.unit || "units"
          }</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${
          item.specifications || "N/A"
        }</td>
      </tr>`
      )
      .join("");

    const itemsText = items
      .map(
        (item) =>
          `- ${item.name}: ${item.quantity} ${item.unit || "units"} (${
            item.specifications || "No specifications"
          })`
      )
      .join("\n");

    const subject = `Request for Proposal: ${rfp.title} [RFP-${rfp.id
      .slice(-8)
      .toUpperCase()}]`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9fafb; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #e5e7eb; padding: 12px; text-align: left; border: 1px solid #ddd; }
    .footer { padding: 20px; font-size: 12px; color: #666; }
    .highlight { background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Request for Proposal</h1>
      <p>RFP ID: RFP-${rfp.id.slice(-8).toUpperCase()}</p>
    </div>
    <div class="content">
      <p>Dear ${vendor.contactPerson || vendor.name},</p>
      
      <p>We are pleased to invite you to submit a proposal for the following:</p>
      
      <h2>${rfp.title}</h2>
      ${rfp.description ? `<p>${rfp.description}</p>` : ""}
      
      <h3>Required Items</h3>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Quantity</th>
            <th>Specifications</th>
          </tr>
        </thead>
        <tbody>
          ${itemsTable}
        </tbody>
      </table>
      
      <div class="highlight">
        <h3>Requirements</h3>
        <ul>
          ${
            rfp.budget
              ? `<li><strong>Budget:</strong> ${rfp.budget} ${rfp.currency}</li>`
              : ""
          }
          ${
            rfp.deliveryDays
              ? `<li><strong>Delivery Timeline:</strong> ${rfp.deliveryDays} days</li>`
              : ""
          }
          ${
            rfp.deliveryDeadline
              ? `<li><strong>Delivery Deadline:</strong> ${new Date(
                  rfp.deliveryDeadline
                ).toLocaleDateString()}</li>`
              : ""
          }
          ${
            rfp.paymentTerms
              ? `<li><strong>Payment Terms:</strong> ${rfp.paymentTerms}</li>`
              : ""
          }
          ${
            rfp.warrantyMonths
              ? `<li><strong>Warranty Required:</strong> ${rfp.warrantyMonths} months</li>`
              : ""
          }
        </ul>
      </div>
      
      ${
        rfp.additionalTerms
          ? `
      <h3>Additional Requirements</h3>
      <p>${rfp.additionalTerms}</p>
      `
          : ""
      }
      
      <h3>How to Respond</h3>
      <p>Please reply to this email with your proposal including:</p>
      <ul>
        <li>Itemized pricing for all requested items</li>
        <li>Your proposed delivery timeline</li>
        <li>Warranty terms</li>
        <li>Payment terms</li>
        <li>Any terms and conditions</li>
      </ul>
      
      <p>We look forward to receiving your proposal.</p>
      
      <p>Best regards,<br>Procurement Team</p>
    </div>
    <div class="footer">
      <p>This is an automated RFP from our procurement system. Please include the RFP ID (RFP-${rfp.id
        .slice(-8)
        .toUpperCase()}) in your response.</p>
    </div>
  </div>
</body>
</html>`;

    const text = `
REQUEST FOR PROPOSAL
====================
RFP ID: RFP-${rfp.id.slice(-8).toUpperCase()}

Dear ${vendor.contactPerson || vendor.name},

We are pleased to invite you to submit a proposal for the following:

${rfp.title}
${rfp.description || ""}

REQUIRED ITEMS:
${itemsText}

REQUIREMENTS:
${rfp.budget ? `- Budget: ${rfp.budget} ${rfp.currency}` : ""}
${rfp.deliveryDays ? `- Delivery Timeline: ${rfp.deliveryDays} days` : ""}
${rfp.paymentTerms ? `- Payment Terms: ${rfp.paymentTerms}` : ""}
${rfp.warrantyMonths ? `- Warranty Required: ${rfp.warrantyMonths} months` : ""}

${rfp.additionalTerms ? `ADDITIONAL REQUIREMENTS:\n${rfp.additionalTerms}` : ""}

HOW TO RESPOND:
Please reply to this email with your proposal including:
- Itemized pricing for all requested items
- Your proposed delivery timeline
- Warranty terms
- Payment terms
- Any terms and conditions

We look forward to receiving your proposal.

Best regards,
Procurement Team

---
Please include the RFP ID (RFP-${rfp.id
      .slice(-8)
      .toUpperCase()}) in your response.
`;

    return { subject, html, text };
  }

  /**
   * Send RFP to a vendor
   */
  async sendRfpToVendor(
    rfp: Rfp,
    vendor: Vendor
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const { subject, html, text } = this.formatRfpEmail(rfp, vendor);

    try {
      const info = await this.transporter.sendMail({
        from: env.smtp.from,
        to: vendor.email,
        subject,
        text,
        html,
      });

      // Log the email in database
      await prisma.email.create({
        data: {
          type: "OUTBOUND",
          rfpId: rfp.id,
          vendorId: vendor.id,
          fromAddress: env.smtp.from,
          toAddress: vendor.email,
          subject,
          body: text,
          status: "SENT",
          sentAt: new Date(),
        },
      });

      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("Error sending email:", error);

      // Log failed email
      await prisma.email.create({
        data: {
          type: "OUTBOUND",
          rfpId: rfp.id,
          vendorId: vendor.id,
          fromAddress: env.smtp.from,
          toAddress: vendor.email,
          subject,
          body: text,
          status: "FAILED",
          errorMessage:
            error instanceof Error ? error.message : "Unknown error",
        },
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to send email",
      };
    }
  }

  /**
   * Send RFP to multiple vendors
   */
  async sendRfpToVendors(
    rfp: Rfp,
    vendors: Vendor[]
  ): Promise<{
    sent: string[];
    failed: { vendorId: string; error: string }[];
  }> {
    const results = {
      sent: [] as string[],
      failed: [] as { vendorId: string; error: string }[],
    };

    for (const vendor of vendors) {
      const result = await this.sendRfpToVendor(rfp, vendor);

      if (result.success) {
        results.sent.push(vendor.id);

        // Update RfpVendor status
        await prisma.rfpVendor.updateMany({
          where: { rfpId: rfp.id, vendorId: vendor.id },
          data: { emailStatus: "SENT", sentAt: new Date() },
        });
      } else {
        results.failed.push({
          vendorId: vendor.id,
          error: result.error || "Unknown error",
        });

        await prisma.rfpVendor.updateMany({
          where: { rfpId: rfp.id, vendorId: vendor.id },
          data: { emailStatus: "FAILED" },
        });
      }
    }

    return results;
  }

  /**
   * Verify SMTP connection
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error("SMTP connection verification failed:", error);
      return false;
    }
  }
}

export const emailService = new EmailService();
