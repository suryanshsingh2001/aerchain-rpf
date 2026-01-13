import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { prisma } from "../config";
import { geminiService } from "../services";
import { sendSuccess } from "../utils";
import { NotFoundError } from "../middleware";

/**
 * Get all proposals for an RFP
 */
export const getProposalsByRfp = asyncHandler(
  async (req: Request, res: Response) => {
    const rfpId = req.params.rfpId as string;

    const rfp = await prisma.rfp.findUnique({ where: { id: rfpId } });
    if (!rfp) {
      throw new NotFoundError("RFP not found");
    }

    const proposals = await prisma.proposal.findMany({
      where: { rfpId },
      include: { vendor: true },
      orderBy: { aiScore: "desc" },
    });

    sendSuccess(res, proposals);
  }
);

/**
 * Get a single proposal by ID
 */
export const getProposalById = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;

    const proposal = await prisma.proposal.findUnique({
      where: { id },
      include: {
        vendor: true,
        rfp: true,
      },
    });

    if (!proposal) {
      throw new NotFoundError("Proposal not found");
    }

    sendSuccess(res, proposal);
  }
);

/**
 * Compare all proposals for an RFP using AI
 */
export const compareProposals = asyncHandler(
  async (req: Request, res: Response) => {
    const rfpId = req.params.rfpId as string;

    const rfp = await prisma.rfp.findUnique({ where: { id: rfpId } });
    if (!rfp) {
      throw new NotFoundError("RFP not found");
    }

    const proposals = await prisma.proposal.findMany({
      where: { rfpId },
      include: { vendor: true },
    });

    if (proposals.length === 0) {
      throw new NotFoundError("No proposals found for this RFP");
    }

    if (proposals.length === 1) {
      // Single proposal - just score it
      const proposal = proposals[0];
      const score = await geminiService.scoreProposal(rfp, proposal);

      await prisma.proposal.update({
        where: { id: proposal.id },
        data: {
          aiScore: score.score,
          aiSummary: score.summary,
          aiStrengths: score.strengths as string[],
          aiWeaknesses: score.weaknesses as string[],
          status: "EVALUATED",
        },
      });

      sendSuccess(res, {
        rfpId,
        proposals: [
          {
            proposalId: proposal.id,
            vendorId: proposal.vendorId,
            vendorName: proposal.vendor.name,
            score: score.score,
            summary: score.summary,
            strengths: score.strengths,
            weaknesses: score.weaknesses,
          },
        ],
        recommendation: {
          vendorId: proposal.vendorId,
          vendorName: proposal.vendor.name,
          reasoning: "Only one proposal received.",
        },
        summary: `Single proposal from ${proposal.vendor.name} with a score of ${score.score}/100.`,
      });
      return;
    }

    // Multiple proposals - compare them
    const comparison = await geminiService.compareProposals(rfp, proposals);

    // Update each proposal with its score
    for (const proposalComparison of comparison.proposals) {
      await prisma.proposal.update({
        where: { id: proposalComparison.proposalId },
        data: {
          aiScore: proposalComparison.score,
          aiSummary: proposalComparison.summary,
          aiStrengths: proposalComparison.strengths as string[],
          aiWeaknesses: proposalComparison.weaknesses as string[],
          status: "EVALUATED",
        },
      });
    }

    // Update RFP status to evaluating
    await prisma.rfp.update({
      where: { id: rfpId },
      data: { status: "EVALUATING" },
    });

    sendSuccess(res, comparison);
  }
);

/**
 * Manually create a proposal (for testing purposes)
 */
export const createProposal = asyncHandler(
  async (req: Request, res: Response) => {
    const { rfpId, vendorId, rawContent, rawSubject } = req.body;

    const rfp = await prisma.rfp.findUnique({ where: { id: rfpId } });
    if (!rfp) {
      throw new NotFoundError("RFP not found");
    }

    const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
    if (!vendor) {
      throw new NotFoundError("Vendor not found");
    }

    // Parse the proposal content using AI
    const parsedData = await geminiService.parseVendorResponse(rawContent, rfp);

    // Create the proposal
    const proposal = await prisma.proposal.create({
      data: {
        rfpId,
        vendorId,
        rawContent,
        rawSubject,
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

    sendSuccess(res, proposal, 201);
  }
);
