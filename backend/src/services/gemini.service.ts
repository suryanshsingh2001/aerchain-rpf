import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { env } from "../config";
import {
  ParsedRfpData,
  ParsedProposalData,
  ComparisonResult,
  ProposalComparison,
} from "../types";
import { Rfp, Proposal, Vendor } from "@prisma/client";

class GeminiService {
  private model: GenerativeModel;

  constructor() {
    const genAI = new GoogleGenerativeAI(env.geminiApiKey);
    this.model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  }

  /**
   * Parse natural language input into structured RFP data
   */
  async parseNaturalLanguageToRfp(input: string): Promise<ParsedRfpData> {
    const prompt = `You are an expert procurement analyst. Parse the following natural language procurement request into a structured RFP (Request for Proposal).

IMPORTANT: Return ONLY valid JSON, no markdown formatting, no code blocks, just raw JSON.

Input: "${input}"

Extract and return a JSON object with these fields:
{
  "title": "a concise title for this RFP",
  "description": "a brief description of what's being procured",
  "items": [
    {
      "name": "item name",
      "quantity": number,
      "specifications": "any specs mentioned",
      "unit": "unit of measurement if applicable"
    }
  ],
  "budget": number or null if not specified,
  "currency": "USD" or other currency if mentioned,
  "deliveryDays": number of days for delivery if mentioned, null otherwise,
  "paymentTerms": "e.g., Net 30" or null if not specified,
  "warrantyMonths": number of months warranty required, null if not specified,
  "additionalTerms": "any other requirements or terms mentioned"
}

Be thorough in extracting all items and specifications. If something is not mentioned, use null.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      // Clean up the response - remove markdown code blocks if present
      const cleanedResponse = response
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      const parsed = JSON.parse(cleanedResponse) as ParsedRfpData;
      return parsed;
    } catch (error) {
      console.error("Error parsing RFP:", error);
      throw new Error("Failed to parse natural language input into RFP");
    }
  }

  /**
   * Parse vendor email response into structured proposal data
   */
  async parseVendorResponse(
    emailContent: string,
    rfp: Rfp
  ): Promise<ParsedProposalData> {
    const rfpItems = rfp.items as { name: string; quantity: number }[];
    const itemsList = rfpItems
      .map((item) => `- ${item.name} (qty: ${item.quantity})`)
      .join("\n");

    const prompt = `You are an expert procurement analyst. Parse the following vendor response email into structured proposal data.

IMPORTANT: Return ONLY valid JSON, no markdown formatting, no code blocks, just raw JSON.

Original RFP requested:
Title: ${rfp.title}
Items:
${itemsList}
Budget: ${rfp.budget || "Not specified"}
Required Delivery: ${
      rfp.deliveryDays ? `${rfp.deliveryDays} days` : "Not specified"
    }
Warranty Required: ${
      rfp.warrantyMonths ? `${rfp.warrantyMonths} months` : "Not specified"
    }

Vendor Response Email:
"${emailContent}"

Extract and return a JSON object with these fields:
{
  "items": [
    {
      "name": "item name matching RFP item",
      "quotedPrice": number (price for this item),
      "quantity": number,
      "notes": "any notes about this item"
    }
  ],
  "totalPrice": number (total quoted price),
  "currency": "USD" or currency mentioned,
  "deliveryDays": number of days vendor can deliver,
  "warrantyMonths": number of months warranty offered,
  "paymentTerms": "payment terms if mentioned",
  "terms": "any additional terms",
  "conditions": "any conditions or caveats"
}

Match items to the original RFP items as closely as possible. Calculate totalPrice if not explicitly stated.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      const cleanedResponse = response
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      const parsed = JSON.parse(cleanedResponse) as ParsedProposalData;
      return parsed;
    } catch (error) {
      console.error("Error parsing vendor response:", error);
      throw new Error("Failed to parse vendor response");
    }
  }

  /**
   * Compare proposals and generate recommendations
   */
  async compareProposals(
    rfp: Rfp,
    proposals: (Proposal & { vendor: Vendor })[]
  ): Promise<ComparisonResult> {
    if (proposals.length === 0) {
      throw new Error("No proposals to compare");
    }

    const proposalSummaries = proposals
      .map((p, idx) => {
        const parsedData = p.parsedData as ParsedProposalData | null;
        return `
Proposal ${idx + 1} - ${p.vendor.name}:
- Total Price: ${p.totalPrice || parsedData?.totalPrice || "Not specified"} ${
          p.currency
        }
- Delivery: ${
          p.deliveryDays || parsedData?.deliveryDays || "Not specified"
        } days
- Warranty: ${
          p.warrantyMonths || parsedData?.warrantyMonths || "Not specified"
        } months
- Payment Terms: ${
          p.paymentTerms || parsedData?.paymentTerms || "Not specified"
        }
- Items: ${JSON.stringify(parsedData?.items || [])}
      `;
      })
      .join("\n");

    const prompt = `You are an expert procurement analyst. Compare the following vendor proposals for an RFP and provide a detailed evaluation.

IMPORTANT: Return ONLY valid JSON, no markdown formatting, no code blocks, just raw JSON.

RFP Details:
Title: ${rfp.title}
Description: ${rfp.description || "N/A"}
Budget: ${rfp.budget || "Not specified"} ${rfp.currency}
Required Delivery: ${
      rfp.deliveryDays ? `${rfp.deliveryDays} days` : "Not specified"
    }
Required Warranty: ${
      rfp.warrantyMonths ? `${rfp.warrantyMonths} months` : "Not specified"
    }
Payment Terms: ${rfp.paymentTerms || "Not specified"}

Proposals:
${proposalSummaries}

Evaluate each proposal and return a JSON object:
{
  "proposals": [
    {
      "proposalId": "proposal ID",
      "vendorId": "vendor ID",
      "vendorName": "vendor name",
      "score": number from 0-100,
      "summary": "brief summary of this proposal",
      "strengths": ["strength 1", "strength 2"],
      "weaknesses": ["weakness 1", "weakness 2"]
    }
  ],
  "recommendation": {
    "vendorId": "recommended vendor ID",
    "vendorName": "recommended vendor name",
    "reasoning": "detailed explanation of why this vendor is recommended"
  },
  "summary": "overall comparison summary"
}

Scoring criteria:
- Price competitiveness (30%): How well does the price fit the budget?
- Delivery timeline (25%): Does it meet the required deadline?
- Warranty coverage (20%): Does it meet or exceed warranty requirements?
- Completeness (15%): Are all items quoted? Any missing items?
- Terms (10%): Are payment terms and conditions favorable?

Vendor IDs and Proposal IDs to use:
${proposals
  .map(
    (p) =>
      `- Vendor: ${p.vendor.name}, VendorID: ${p.vendorId}, ProposalID: ${p.id}`
  )
  .join("\n")}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      const cleanedResponse = response
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      const parsed = JSON.parse(cleanedResponse) as ComparisonResult;
      parsed.rfpId = rfp.id;

      return parsed;
    } catch (error) {
      console.error("Error comparing proposals:", error);
      throw new Error("Failed to compare proposals");
    }
  }

  /**
   * Score a single proposal
   */
  async scoreProposal(
    rfp: Rfp,
    proposal: Proposal
  ): Promise<{
    score: number;
    summary: string;
    strengths: string[];
    weaknesses: string[];
  }> {
    const parsedData = proposal.parsedData as ParsedProposalData | null;

    const prompt = `You are an expert procurement analyst. Score the following vendor proposal against the RFP requirements.

IMPORTANT: Return ONLY valid JSON, no markdown formatting, no code blocks, just raw JSON.

RFP Details:
Title: ${rfp.title}
Budget: ${rfp.budget || "Not specified"} ${rfp.currency}
Required Delivery: ${
      rfp.deliveryDays ? `${rfp.deliveryDays} days` : "Not specified"
    }
Required Warranty: ${
      rfp.warrantyMonths ? `${rfp.warrantyMonths} months` : "Not specified"
    }
Items Required: ${JSON.stringify(rfp.items)}

Proposal:
- Total Price: ${
      proposal.totalPrice || parsedData?.totalPrice || "Not specified"
    }
- Delivery: ${
      proposal.deliveryDays || parsedData?.deliveryDays || "Not specified"
    } days
- Warranty: ${
      proposal.warrantyMonths || parsedData?.warrantyMonths || "Not specified"
    } months
- Items Quoted: ${JSON.stringify(parsedData?.items || [])}

Return:
{
  "score": number from 0-100,
  "summary": "brief evaluation summary",
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"]
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      const cleanedResponse = response
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error("Error scoring proposal:", error);
      throw new Error("Failed to score proposal");
    }
  }
}

export const geminiService = new GeminiService();
