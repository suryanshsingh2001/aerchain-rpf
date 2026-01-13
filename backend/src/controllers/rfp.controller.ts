import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { z } from "zod";
import { prisma } from "../config";
import { geminiService, emailService } from "../services";
import { sendSuccess } from "../utils";
import { NotFoundError, ValidationError } from "../middleware";
import { CreateRfpRequest, SendRfpRequest } from "../types";

// Validation schemas
const createRfpSchema = z.object({
  naturalLanguageInput: z
    .string()
    .min(10, "Input must be at least 10 characters"),
});

const updateRfpSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  items: z
    .array(
      z.object({
        name: z.string(),
        quantity: z.number().positive(),
        specifications: z.string().optional(),
        unit: z.string().optional(),
      })
    )
    .optional(),
  budget: z.number().positive().optional().nullable(),
  currency: z.string().optional(),
  deliveryDays: z.number().positive().optional().nullable(),
  deliveryDeadline: z.string().datetime().optional().nullable(),
  paymentTerms: z.string().optional().nullable(),
  warrantyMonths: z.number().positive().optional().nullable(),
  additionalTerms: z.string().optional().nullable(),
  status: z.enum(["DRAFT", "SENT", "EVALUATING", "CLOSED"]).optional(),
});

const sendRfpSchema = z.object({
  vendorIds: z.array(z.string()).min(1, "At least one vendor is required"),
});

/**
 * Create a new RFP from natural language input
 */
export const createRfp = asyncHandler(async (req: Request, res: Response) => {
  const { naturalLanguageInput } = createRfpSchema.parse(
    req.body
  ) as CreateRfpRequest;

  // Use AI to parse natural language into structured RFP
  const parsedRfp = await geminiService.parseNaturalLanguageToRfp(
    naturalLanguageInput
  );

  // Create RFP in database
  const rfp = await prisma.rfp.create({
    data: {
      originalInput: naturalLanguageInput,
      title: parsedRfp.title,
      description: parsedRfp.description,
      items: parsedRfp.items as object,
      budget: parsedRfp.budget,
      currency: parsedRfp.currency || "USD",
      deliveryDays: parsedRfp.deliveryDays,
      deliveryDeadline: parsedRfp.deliveryDeadline
        ? new Date(parsedRfp.deliveryDeadline)
        : null,
      paymentTerms: parsedRfp.paymentTerms,
      warrantyMonths: parsedRfp.warrantyMonths,
      additionalTerms: parsedRfp.additionalTerms,
      status: "DRAFT",
    },
  });

  sendSuccess(res, rfp, 201);
});

/**
 * Get all RFPs with pagination
 */
export const getRfps = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const [rfps, total] = await Promise.all([
    prisma.rfp.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        rfpVendors: {
          include: { vendor: true },
        },
        _count: {
          select: { proposals: true },
        },
      },
    }),
    prisma.rfp.count(),
  ]);

  sendSuccess(res, rfps, 200, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
});

/**
 * Get a single RFP by ID
 */
export const getRfpById = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const rfp = await prisma.rfp.findUnique({
    where: { id },
    include: {
      rfpVendors: {
        include: { vendor: true },
      },
      proposals: {
        include: { vendor: true },
      },
    },
  });

  if (!rfp) {
    throw new NotFoundError("RFP not found");
  }

  sendSuccess(res, rfp);
});

/**
 * Update an RFP
 */
export const updateRfp = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const data = updateRfpSchema.parse(req.body);

  const existingRfp = await prisma.rfp.findUnique({ where: { id } });
  if (!existingRfp) {
    throw new NotFoundError("RFP not found");
  }

  // Build update data object
  const updateData: Record<string, unknown> = {};

  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.items !== undefined) updateData.items = data.items as object;
  if (data.budget !== undefined) updateData.budget = data.budget;
  if (data.currency !== undefined) updateData.currency = data.currency;
  if (data.deliveryDays !== undefined)
    updateData.deliveryDays = data.deliveryDays;
  if (data.deliveryDeadline !== undefined) {
    updateData.deliveryDeadline = data.deliveryDeadline
      ? new Date(data.deliveryDeadline)
      : null;
  }
  if (data.paymentTerms !== undefined)
    updateData.paymentTerms = data.paymentTerms;
  if (data.warrantyMonths !== undefined)
    updateData.warrantyMonths = data.warrantyMonths;
  if (data.additionalTerms !== undefined)
    updateData.additionalTerms = data.additionalTerms;
  if (data.status !== undefined) updateData.status = data.status;

  const rfp = await prisma.rfp.update({
    where: { id },
    data: updateData,
  });

  sendSuccess(res, rfp);
});

/**
 * Delete an RFP
 */
export const deleteRfp = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const existingRfp = await prisma.rfp.findUnique({ where: { id } });
  if (!existingRfp) {
    throw new NotFoundError("RFP not found");
  }

  await prisma.rfp.delete({ where: { id } });

  sendSuccess(res, { message: "RFP deleted successfully" });
});

/**
 * Send RFP to selected vendors
 */
export const sendRfp = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { vendorIds } = sendRfpSchema.parse(req.body) as SendRfpRequest;

  const rfp = await prisma.rfp.findUnique({ where: { id } });
  if (!rfp) {
    throw new NotFoundError("RFP not found");
  }

  // Verify all vendors exist
  const vendors = await prisma.vendor.findMany({
    where: { id: { in: vendorIds }, status: "ACTIVE" },
  });

  if (vendors.length !== vendorIds.length) {
    throw new ValidationError("One or more vendors not found or inactive");
  }

  // Create RfpVendor relationships
  await prisma.rfpVendor.createMany({
    data: vendorIds.map((vendorId) => ({
      rfpId: id,
      vendorId,
    })),
    skipDuplicates: true,
  });

  // Send emails to vendors
  const emailResults = await emailService.sendRfpToVendors(rfp, vendors);

  // Update RFP status if at least one email was sent
  if (emailResults.sent.length > 0) {
    await prisma.rfp.update({
      where: { id },
      data: { status: "SENT" },
    });
  }

  sendSuccess(res, {
    message: `RFP sent to ${emailResults.sent.length} vendors`,
    sent: emailResults.sent,
    failed: emailResults.failed,
  });
});
