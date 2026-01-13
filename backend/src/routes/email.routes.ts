import { Router } from "express";
import { handleInboundEmail, getEmails } from "../controllers/email.controller";

const router = Router();

/**
 * @route   POST /api/emails/webhook
 * @desc    Inbound email webhook - receives vendor responses
 * @body    { from, to, subject, body, rawPayload? }
 */
router.post("/webhook", handleInboundEmail);

/**
 * @route   GET /api/emails
 * @desc    Get all emails (for debugging/admin)
 * @query   page, limit, type (INBOUND/OUTBOUND)
 */
router.get("/", getEmails);

export default router;
