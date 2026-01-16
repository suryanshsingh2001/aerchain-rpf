import { z } from "zod";

/**
 * Schema for inbound email webhook payload
 */
export const inboundEmailSchema = z.object({
  from: z.string().email(),
  to: z.string().email(),
  subject: z.string(),
  body: z.string(),
  rawPayload: z.any().optional(),
});

// Type exports inferred from schemas
export type InboundEmailInput = z.infer<typeof inboundEmailSchema>;
