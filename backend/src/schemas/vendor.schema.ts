import { z } from "zod";

/**
 * Schema for creating a vendor
 */
export const createVendorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  categories: z.array(z.string()).optional(),
});

/**
 * Schema for updating a vendor
 */
export const updateVendorSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  contactPerson: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  categories: z.array(z.string()).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

// Type exports inferred from schemas
export type CreateVendorInput = z.infer<typeof createVendorSchema>;
export type UpdateVendorInput = z.infer<typeof updateVendorSchema>;
