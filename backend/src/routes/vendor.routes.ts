import { Router } from "express";
import {
  createVendor,
  getVendors,
  getVendorById,
  updateVendor,
  deleteVendor,
} from "../controllers/vendor.controller";

const router = Router();

/**
 * @route   POST /api/vendors
 * @desc    Create a new vendor
 * @body    { name, email, contactPerson?, phone?, address?, categories? }
 */
router.post("/", createVendor);

/**
 * @route   GET /api/vendors
 * @desc    Get all vendors with pagination and search
 * @query   page, limit, search, status
 */
router.get("/", getVendors);

/**
 * @route   GET /api/vendors/:id
 * @desc    Get a single vendor by ID with related RFPs and proposals
 */
router.get("/:id", getVendorById);

/**
 * @route   PUT /api/vendors/:id
 * @desc    Update a vendor
 */
router.put("/:id", updateVendor);

/**
 * @route   DELETE /api/vendors/:id
 * @desc    Delete a vendor
 */
router.delete("/:id", deleteVendor);

export default router;
