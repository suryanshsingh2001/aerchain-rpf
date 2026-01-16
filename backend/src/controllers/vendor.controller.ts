import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { prisma } from "../config";
import { sendSuccess } from "../utils";
import { NotFoundError } from "../middleware";
import { CreateVendorRequest, UpdateVendorRequest } from "../types";
import { createVendorSchema, updateVendorSchema } from "../schemas";

/**
 * Create a new vendor
 */
export const createVendor = asyncHandler(
  async (req: Request, res: Response) => {
    const data = createVendorSchema.parse(req.body) as CreateVendorRequest;

    // Check if email already exists
    const existingVendor = await prisma.vendor.findUnique({
      where: { email: data.email },
    });

    if (existingVendor) {
      throw new NotFoundError("Vendor with this email already exists");
    }

    const vendor = await prisma.vendor.create({
      data: {
        name: data.name,
        email: data.email,
        contactPerson: data.contactPerson,
        phone: data.phone,
        address: data.address,
        categories: (data.categories || []) as string[],
      },
    });

    sendSuccess(res, vendor, 201);
  }
);

/**
 * Get all vendors with optional filtering
 */
export const getVendors = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const search = req.query.search as string | undefined;
  const status = req.query.status as "ACTIVE" | "INACTIVE" | undefined;

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { contactPerson: { contains: search, mode: "insensitive" } },
    ];
  }

  if (status) {
    where.status = status;
  }

  const [vendors, total] = await Promise.all([
    prisma.vendor.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: "asc" },
    }),
    prisma.vendor.count({ where }),
  ]);

  sendSuccess(res, vendors, 200, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
});

/**
 * Get a single vendor by ID
 */
export const getVendorById = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;

    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        rfpVendors: {
          include: { rfp: true },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        proposals: {
          include: { rfp: true },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!vendor) {
      throw new NotFoundError("Vendor not found");
    }

    sendSuccess(res, vendor);
  }
);

/**
 * Update a vendor
 */
export const updateVendor = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const data = updateVendorSchema.parse(req.body) as UpdateVendorRequest;

    const existingVendor = await prisma.vendor.findUnique({ where: { id } });
    if (!existingVendor) {
      throw new NotFoundError("Vendor not found");
    }

    // Check if email is being changed to an existing email
    if (data.email && data.email !== existingVendor.email) {
      const emailExists = await prisma.vendor.findUnique({
        where: { email: data.email },
      });
      if (emailExists) {
        throw new NotFoundError("Vendor with this email already exists");
      }
    }

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.contactPerson !== undefined)
      updateData.contactPerson = data.contactPerson;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.categories !== undefined)
      updateData.categories = data.categories as string[];
    if (data.status !== undefined) updateData.status = data.status;

    const vendor = await prisma.vendor.update({
      where: { id },
      data: updateData,
    });

    sendSuccess(res, vendor);
  }
);

/**
 * Delete a vendor
 */
export const deleteVendor = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;

    const existingVendor = await prisma.vendor.findUnique({ where: { id } });
    if (!existingVendor) {
      throw new NotFoundError("Vendor not found");
    }

    await prisma.vendor.delete({ where: { id } });

    sendSuccess(res, { message: "Vendor deleted successfully" });
  }
);
