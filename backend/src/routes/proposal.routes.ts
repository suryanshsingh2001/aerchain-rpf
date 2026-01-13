import { Router } from "express";
import {
  getProposalById,
  createProposal,
} from "../controllers/proposal.controller";

const router = Router();

/**
 * @route   GET /api/proposals/:id
 * @desc    Get a single proposal by ID with vendor and RFP details
 */
router.get("/:id", getProposalById);

/**
 * @route   POST /api/proposals
 * @desc    Manually create a proposal (for testing)
 * @body    { rfpId, vendorId, rawContent, rawSubject? }
 */
router.post("/", createProposal);

export default router;
