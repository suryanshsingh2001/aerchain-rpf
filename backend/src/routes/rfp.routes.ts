import { Router } from "express";
import {
  createRfp,
  getRfps,
  getRfpById,
  updateRfp,
  deleteRfp,
  sendRfp,
} from "../controllers/rfp.controller";
import {
  getProposalsByRfp,
  compareProposals,
} from "../controllers/proposal.controller";

const router = Router();

/**
 * @route   POST /api/rfps
 * @desc    Create a new RFP from natural language input
 * @body    { naturalLanguageInput: string }
 */
router.post("/", createRfp);

/**
 * @route   GET /api/rfps
 * @desc    Get all RFPs with pagination
 * @query   page, limit
 */
router.get("/", getRfps);

/**
 * @route   GET /api/rfps/:id
 * @desc    Get a single RFP by ID with related data
 */
router.get("/:id", getRfpById);

/**
 * @route   PUT /api/rfps/:id
 * @desc    Update an RFP
 */
router.put("/:id", updateRfp);

/**
 * @route   DELETE /api/rfps/:id
 * @desc    Delete an RFP
 */
router.delete("/:id", deleteRfp);

/**
 * @route   POST /api/rfps/:id/send
 * @desc    Send RFP to selected vendors
 * @body    { vendorIds: string[] }
 */
router.post("/:id/send", sendRfp);

/**
 * @route   GET /api/rfps/:rfpId/proposals
 * @desc    Get all proposals for an RFP
 */
router.get("/:rfpId/proposals", getProposalsByRfp);

/**
 * @route   POST /api/rfps/:rfpId/compare
 * @desc    Compare all proposals for an RFP using AI
 */
router.post("/:rfpId/compare", compareProposals);

export default router;
