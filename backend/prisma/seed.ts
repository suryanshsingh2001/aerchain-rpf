import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  // Clear existing data
  console.log("Clearing existing data...");
  await prisma.email.deleteMany();
  await prisma.proposal.deleteMany();
  await prisma.rfpVendor.deleteMany();
  await prisma.rfp.deleteMany();
  await prisma.vendor.deleteMany();

  // Create vendors
  console.log("Creating vendors...");
  const vendors = await Promise.all([
    prisma.vendor.create({
      data: {
        name: "Tech Solutions Inc",
        email: "sales@techsolutions.com",
        contactPerson: "John Smith",
        phone: "+1-555-0101",
        address: "123 Tech Street, Silicon Valley, CA 94000",
        categories: ["IT Hardware", "Software", "Networking"],
        status: "ACTIVE",
      },
    }),
    prisma.vendor.create({
      data: {
        name: "Office Supplies Pro",
        email: "quotes@officesupplies.com",
        contactPerson: "Jane Doe",
        phone: "+1-555-0102",
        address: "456 Business Ave, New York, NY 10001",
        categories: ["Office Supplies", "Furniture", "IT Hardware"],
        status: "ACTIVE",
      },
    }),
    prisma.vendor.create({
      data: {
        name: "Digital Equipment Corp",
        email: "rfp@digitalequip.com",
        contactPerson: "Mike Johnson",
        phone: "+1-555-0103",
        address: "789 Electronics Blvd, Austin, TX 78701",
        categories: ["IT Hardware", "Monitors", "Peripherals"],
        status: "ACTIVE",
      },
    }),
    prisma.vendor.create({
      data: {
        name: "Global IT Partners",
        email: "procurement@globalit.com",
        contactPerson: "Sarah Williams",
        phone: "+1-555-0104",
        address: "321 Enterprise Way, Seattle, WA 98101",
        categories: ["IT Hardware", "Cloud Services", "Software"],
        status: "ACTIVE",
      },
    }),
    prisma.vendor.create({
      data: {
        name: "Inactive Supplier Ltd",
        email: "info@inactive.com",
        contactPerson: "Old Contact",
        phone: "+1-555-0199",
        address: "999 Closed Road, Nowhere, XX 00000",
        categories: ["Misc"],
        status: "INACTIVE",
      },
    }),
  ]);

  console.log(`  ✓ Created ${vendors.length} vendors`);

  // Create sample RFPs
  console.log("Creating RFPs...");
  const rfp1 = await prisma.rfp.create({
    data: {
      originalInput:
        "I need to procure laptops and monitors for our new office. Budget is $50,000 total. Need delivery within 30 days. We need 20 laptops with 16GB RAM and 15 monitors 27-inch. Payment terms should be net 30, and we need at least 1 year warranty.",
      title: "Office IT Equipment Procurement",
      description:
        "Procurement of laptops and monitors for new office expansion",
      items: [
        {
          name: "Laptop",
          quantity: 20,
          specifications: "16GB RAM, 512GB SSD, Intel i7",
          unit: "units",
        },
        {
          name: "Monitor",
          quantity: 15,
          specifications: "27-inch, 4K resolution",
          unit: "units",
        },
      ],
      budget: 50000,
      currency: "USD",
      deliveryDays: 30,
      paymentTerms: "Net 30",
      warrantyMonths: 12,
      status: "DRAFT",
    },
  });

  const rfp2 = await prisma.rfp.create({
    data: {
      originalInput:
        "We need office furniture for 50 employees. Budget $30,000. Desks, chairs, and storage cabinets. Delivery in 2 weeks. Net 15 payment.",
      title: "Office Furniture for New Employees",
      description: "Complete office furniture setup for 50 new employees",
      items: [
        {
          name: "Standing Desk",
          quantity: 50,
          specifications: "Adjustable height, 60x30 inch",
          unit: "units",
        },
        {
          name: "Ergonomic Chair",
          quantity: 50,
          specifications: "Mesh back, lumbar support",
          unit: "units",
        },
        {
          name: "Storage Cabinet",
          quantity: 25,
          specifications: "4-drawer, lockable",
          unit: "units",
        },
      ],
      budget: 30000,
      currency: "USD",
      deliveryDays: 14,
      paymentTerms: "Net 15",
      warrantyMonths: 24,
      status: "SENT",
    },
  });

  // Link RFP2 to vendors (as if it was sent)
  await prisma.rfpVendor.createMany({
    data: [
      {
        rfpId: rfp2.id,
        vendorId: vendors[1].id,
        emailStatus: "SENT",
        sentAt: new Date(),
      },
      {
        rfpId: rfp2.id,
        vendorId: vendors[2].id,
        emailStatus: "SENT",
        sentAt: new Date(),
      },
    ],
  });

  // Create sample proposals for RFP2
  console.log("Creating sample proposals...");
  await prisma.proposal.create({
    data: {
      rfpId: rfp2.id,
      vendorId: vendors[1].id,
      rawContent: `Thank you for the RFP. We are pleased to submit our proposal:

Standing Desks (50 units): $350 each = $17,500
Ergonomic Chairs (50 units): $200 each = $10,000
Storage Cabinets (25 units): $150 each = $3,750

Total: $31,250

Delivery: 10 business days
Warranty: 3 years on all items
Payment Terms: Net 15 accepted

We look forward to your response.`,
      rawSubject: "RE: RFP - Office Furniture Proposal",
      parsedData: {
        items: [
          {
            name: "Standing Desk",
            quotedPrice: 350,
            quantity: 50,
            notes: "Adjustable height",
          },
          {
            name: "Ergonomic Chair",
            quotedPrice: 200,
            quantity: 50,
            notes: "Premium mesh",
          },
          {
            name: "Storage Cabinet",
            quotedPrice: 150,
            quantity: 25,
            notes: "Steel construction",
          },
        ],
        terms: "FOB Destination",
        conditions: "Subject to stock availability",
      },
      totalPrice: 31250,
      currency: "USD",
      deliveryDays: 10,
      warrantyMonths: 36,
      paymentTerms: "Net 15",
      status: "PARSED",
    },
  });

  await prisma.proposal.create({
    data: {
      rfpId: rfp2.id,
      vendorId: vendors[2].id,
      rawContent: `We appreciate the opportunity to quote:

- 50x Standing Desks @ $320 = $16,000
- 50x Ergonomic Chairs @ $180 = $9,000  
- 25x Storage Cabinets @ $120 = $3,000

Grand Total: $28,000

Shipping: Free, 12 business days
Warranty: 2 years
Payment: Net 15`,
      rawSubject: "Proposal for Office Furniture RFP",
      parsedData: {
        items: [
          {
            name: "Standing Desk",
            quotedPrice: 320,
            quantity: 50,
            notes: "Basic model",
          },
          {
            name: "Ergonomic Chair",
            quotedPrice: 180,
            quantity: 50,
            notes: "Standard",
          },
          {
            name: "Storage Cabinet",
            quotedPrice: 120,
            quantity: 25,
            notes: "Basic",
          },
        ],
        terms: "Free shipping",
        conditions: "Standard terms apply",
      },
      totalPrice: 28000,
      currency: "USD",
      deliveryDays: 12,
      warrantyMonths: 24,
      paymentTerms: "Net 15",
      status: "PARSED",
    },
  });

  console.log(`  ✓ Created 2 RFPs`);
  console.log(`  ✓ Created 2 sample proposals`);

  console.log("\n✅ Database seeded successfully!\n");
  console.log("Summary:");
  console.log(`  - ${vendors.length} vendors (4 active, 1 inactive)`);
  console.log(`  - 2 RFPs (1 draft, 1 sent)`);
  console.log(`  - 2 proposals for comparison demo`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
