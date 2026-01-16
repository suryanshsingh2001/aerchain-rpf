import { z } from "zod";

/**
 * Schema for RFP item
 */
export const rfpItemSchema = z.object({
  name: z.string(),
  quantity: z.number().positive(),
  specifications: z.string().optional(),
  unit: z.string().optional(),
});

/**
 * Schema for creating an RFP from natural language
 */
export const createRfpSchema = z.object({
  naturalLanguageInput: z
    .string()
    .min(10, "Input must be at least 10 characters"),
});

/**
 * Schema for updating an RFP
 */
export const updateRfpSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  items: z.array(rfpItemSchema).optional(),
  budget: z.number().positive().optional().nullable(),
  currency: z.string().optional(),
  deliveryDays: z.number().positive().optional().nullable(),
  deliveryDeadline: z.string().datetime().optional().nullable(),
  paymentTerms: z.string().optional().nullable(),
  warrantyMonths: z.number().positive().optional().nullable(),
  additionalTerms: z.string().optional().nullable(),
  status: z.enum(["DRAFT", "SENT", "EVALUATING", "CLOSED"]).optional(),
});

/**
 * Schema for sending RFP to vendors
 */
export const sendRfpSchema = z.object({
  vendorIds: z.array(z.string()).min(1, "At least one vendor is required"),
});

// Type exports inferred from schemas
export type CreateRfpInput = z.infer<typeof createRfpSchema>;
export type UpdateRfpInput = z.infer<typeof updateRfpSchema>;
export type SendRfpInput = z.infer<typeof sendRfpSchema>;
export type RfpItemInput = z.infer<typeof rfpItemSchema>;
