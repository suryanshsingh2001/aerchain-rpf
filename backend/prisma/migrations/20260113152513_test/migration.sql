-- CreateEnum
CREATE TYPE "RfpStatus" AS ENUM ('DRAFT', 'SENT', 'EVALUATING', 'CLOSED');

-- CreateEnum
CREATE TYPE "VendorStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "RfpVendorEmailStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('RECEIVED', 'PARSED', 'EVALUATED');

-- CreateEnum
CREATE TYPE "EmailType" AS ENUM ('OUTBOUND', 'INBOUND');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'RECEIVED');

-- CreateTable
CREATE TABLE "rfps" (
    "id" TEXT NOT NULL,
    "originalInput" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "items" JSONB NOT NULL DEFAULT '[]',
    "budget" DECIMAL(15,2),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "deliveryDeadline" TIMESTAMP(3),
    "deliveryDays" INTEGER,
    "paymentTerms" TEXT,
    "warrantyMonths" INTEGER,
    "additionalTerms" TEXT,
    "status" "RfpStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rfps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contactPerson" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "categories" JSONB NOT NULL DEFAULT '[]',
    "status" "VendorStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rfp_vendors" (
    "id" TEXT NOT NULL,
    "rfpId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3),
    "emailStatus" "RfpVendorEmailStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rfp_vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposals" (
    "id" TEXT NOT NULL,
    "rfpId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "rawContent" TEXT NOT NULL,
    "rawSubject" TEXT,
    "parsedData" JSONB,
    "totalPrice" DECIMAL(15,2),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "deliveryDays" INTEGER,
    "warrantyMonths" INTEGER,
    "paymentTerms" TEXT,
    "aiScore" INTEGER,
    "aiSummary" TEXT,
    "aiStrengths" JSONB,
    "aiWeaknesses" JSONB,
    "status" "ProposalStatus" NOT NULL DEFAULT 'RECEIVED',
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emails" (
    "id" TEXT NOT NULL,
    "type" "EmailType" NOT NULL,
    "rfpId" TEXT,
    "vendorId" TEXT,
    "fromAddress" TEXT NOT NULL,
    "toAddress" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "rawPayload" JSONB,
    "status" "EmailStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vendors_email_key" ON "vendors"("email");

-- CreateIndex
CREATE UNIQUE INDEX "rfp_vendors_rfpId_vendorId_key" ON "rfp_vendors"("rfpId", "vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "proposals_rfpId_vendorId_key" ON "proposals"("rfpId", "vendorId");

-- AddForeignKey
ALTER TABLE "rfp_vendors" ADD CONSTRAINT "rfp_vendors_rfpId_fkey" FOREIGN KEY ("rfpId") REFERENCES "rfps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rfp_vendors" ADD CONSTRAINT "rfp_vendors_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_rfpId_fkey" FOREIGN KEY ("rfpId") REFERENCES "rfps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emails" ADD CONSTRAINT "emails_rfpId_fkey" FOREIGN KEY ("rfpId") REFERENCES "rfps"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emails" ADD CONSTRAINT "emails_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
