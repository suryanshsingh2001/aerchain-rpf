import { Router } from "express";
import {
  handleInboundEmail,
  getEmails,
  getImapStatus,
  testImapConnection,
  fetchEmails,
  startImapPolling,
  stopImapPolling,
} from "../controllers/email.controller";

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

// ============================================
// IMAP Routes for Inbound Email Handling
// ============================================

/**
 * @route   GET /api/emails/imap/status
 * @desc    Get IMAP service status
 */
router.get("/imap/status", getImapStatus);

/**
 * @route   POST /api/emails/imap/test
 * @desc    Test IMAP connection
 */
router.post("/imap/test", testImapConnection);

/**
 * @route   POST /api/emails/imap/fetch
 * @desc    Manually fetch and process emails via IMAP
 */
router.post("/imap/fetch", fetchEmails);

/**
 * @route   POST /api/emails/imap/polling/start
 * @desc    Start IMAP polling for incoming emails
 * @query   interval - polling interval in minutes (default: 2)
 */
router.post("/imap/polling/start", startImapPolling);

/**
 * @route   POST /api/emails/imap/polling/stop
 * @desc    Stop IMAP polling
 */
router.post("/imap/polling/stop", stopImapPolling);

export default router;
