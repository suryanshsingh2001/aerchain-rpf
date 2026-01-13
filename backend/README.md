# AI-Powered RFP Management System - Backend

An Express.js backend for managing Requests for Proposal (RFPs) with AI-powered natural language processing, vendor management, and proposal comparison.

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **AI**: Google Gemini API (gemini-1.5-flash)
- **Email**: Nodemailer with SMTP
- **Validation**: Zod

## Features

- 🤖 **AI-Powered RFP Creation**: Convert natural language to structured RFPs
- 📧 **Email Integration**: Send RFPs to vendors via email
- 📥 **Inbound Email Processing**: Receive and parse vendor responses automatically
- 📊 **AI Comparison**: Compare proposals and get AI-powered recommendations
- 🏢 **Vendor Management**: Full CRUD for vendor master data

## Prerequisites

- Node.js 18.0.0 or higher
- PostgreSQL database
- Google Gemini API key
- SMTP credentials (optional, for email sending)

## Project Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and configure:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
# Server
PORT=3001
NODE_ENV=development

# Database - PostgreSQL connection string
DATABASE_URL="postgresql://username:password@localhost:5432/rfp_db?schema=public"

# Google Gemini AI - Get from https://aistudio.google.com/
GEMINI_API_KEY="your-gemini-api-key"

# Email SMTP (optional - for sending RFPs)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="RFP System <your-email@gmail.com>"

# Inbound Email Webhook Secret (for production security)
EMAIL_WEBHOOK_SECRET="your-secret-key"
```

### 3. Set Up Database

Generate Prisma client and run migrations:

```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate
```

### 4. Run Development Server

```bash
npm run dev
```

Server will start at http://localhost:3001

## API Documentation

### Health Check

```
GET /health
```

Response:

```json
{
  "status": "ok",
  "timestamp": "2024-01-13T15:00:00.000Z",
  "environment": "development"
}
```

---

### RFP Endpoints

#### Create RFP (with AI parsing)

```
POST /api/rfps
Content-Type: application/json

{
  "naturalLanguageInput": "I need to procure laptops and monitors for our new office. Budget is $50,000 total. Need delivery within 30 days. We need 20 laptops with 16GB RAM and 15 monitors 27-inch. Payment terms should be net 30, and we need at least 1 year warranty."
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "clr1234567890",
    "originalInput": "...",
    "title": "Office IT Equipment Procurement",
    "description": "Procurement of laptops and monitors for new office",
    "items": [
      { "name": "Laptop", "quantity": 20, "specifications": "16GB RAM" },
      { "name": "Monitor", "quantity": 15, "specifications": "27-inch" }
    ],
    "budget": 50000,
    "currency": "USD",
    "deliveryDays": 30,
    "paymentTerms": "Net 30",
    "warrantyMonths": 12,
    "status": "DRAFT",
    "createdAt": "2024-01-13T15:00:00.000Z"
  }
}
```

#### List RFPs

```
GET /api/rfps?page=1&limit=10
```

#### Get Single RFP

```
GET /api/rfps/:id
```

#### Update RFP

```
PUT /api/rfps/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "budget": 55000,
  "status": "DRAFT"
}
```

#### Delete RFP

```
DELETE /api/rfps/:id
```

#### Send RFP to Vendors

```
POST /api/rfps/:id/send
Content-Type: application/json

{
  "vendorIds": ["vendor-id-1", "vendor-id-2"]
}
```

Response:

```json
{
  "success": true,
  "data": {
    "message": "RFP sent to 2 vendors",
    "sent": ["vendor-id-1", "vendor-id-2"],
    "failed": []
  }
}
```

#### Get Proposals for RFP

```
GET /api/rfps/:rfpId/proposals
```

#### Compare Proposals (AI-powered)

```
POST /api/rfps/:rfpId/compare
```

Response:

```json
{
  "success": true,
  "data": {
    "rfpId": "rfp-id",
    "proposals": [
      {
        "proposalId": "proposal-1",
        "vendorId": "vendor-1",
        "vendorName": "Tech Solutions Inc",
        "score": 85,
        "summary": "Competitive pricing with good warranty terms",
        "strengths": ["Best price", "Fast delivery"],
        "weaknesses": ["Slightly below required warranty"]
      }
    ],
    "recommendation": {
      "vendorId": "vendor-1",
      "vendorName": "Tech Solutions Inc",
      "reasoning": "Best overall value with competitive pricing and reliable delivery timeline."
    },
    "summary": "3 proposals received. Tech Solutions Inc offers the best value."
  }
}
```

---

### Vendor Endpoints

#### Create Vendor

```
POST /api/vendors
Content-Type: application/json

{
  "name": "Tech Solutions Inc",
  "email": "sales@techsolutions.com",
  "contactPerson": "John Smith",
  "phone": "+1-555-0100",
  "address": "123 Tech Street, Silicon Valley, CA",
  "categories": ["IT Hardware", "Software"]
}
```

#### List Vendors

```
GET /api/vendors?page=1&limit=10&search=tech&status=ACTIVE
```

#### Get Single Vendor

```
GET /api/vendors/:id
```

#### Update Vendor

```
PUT /api/vendors/:id
Content-Type: application/json

{
  "contactPerson": "Jane Doe",
  "status": "INACTIVE"
}
```

#### Delete Vendor

```
DELETE /api/vendors/:id
```

---

### Proposal Endpoints

#### Get Single Proposal

```
GET /api/proposals/:id
```

#### Create Proposal (for testing)

```
POST /api/proposals
Content-Type: application/json

{
  "rfpId": "rfp-id",
  "vendorId": "vendor-id",
  "rawContent": "Thank you for your RFP. We are pleased to offer: Laptops (20 units): $800 each = $16,000. Monitors (15 units): $400 each = $6,000. Total: $22,000. Delivery: 25 days. Warranty: 2 years. Payment: Net 30 accepted.",
  "rawSubject": "RE: RFP-ABC12345 - Our Proposal"
}
```

---

### Email Endpoints

#### Inbound Email Webhook

```
POST /api/emails/webhook
Content-Type: application/json

{
  "from": "vendor@example.com",
  "to": "rfp@yourcompany.com",
  "subject": "RE: RFP-ABC12345 - Our Proposal",
  "body": "Thank you for your RFP. We are pleased to quote..."
}
```

#### List Emails

```
GET /api/emails?page=1&limit=20&type=INBOUND
```

---

## Database Schema

### RFP

- Stores structured RFP data parsed from natural language
- Status: DRAFT → SENT → EVALUATING → CLOSED
- Includes items, budget, delivery terms, warranty requirements

### Vendor

- Master data for vendors (name, email, contact info)
- Status: ACTIVE / INACTIVE
- Categories for vendor specializations

### Proposal

- Vendor responses linked to RFP
- AI-parsed structured data (items, pricing, terms)
- AI-generated scores and recommendations

### Email

- Tracks all inbound/outbound emails
- Links to RFP and vendor for traceability

---

## Inbound Email Configuration

For production, integrate with an email service that supports webhooks:

### Option 1: SendGrid Inbound Parse

1. Configure a domain for inbound email
2. Set up the Parse Webhook to `POST /api/emails/webhook`
3. SendGrid will forward emails to your endpoint

### Option 2: Mailgun Routes

1. Create an inbound route in Mailgun
2. Set the action to forward to your webhook URL

### Option 3: AWS SES

1. Set up SES to receive email on a domain
2. Use Lambda to forward to your API

---

## Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run start        # Start production server
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio (database GUI)
npm run test         # Run tests
npm run lint         # Run ESLint
```

---

## Design Decisions

1. **AI Integration**: Gemini is used for three core functions:

   - Converting natural language to structured RFP
   - Parsing vendor email responses into structured proposals
   - Comparing and scoring proposals with recommendations

2. **Email Approach**: Webhook-based for immediate processing. Alternative polling approach can be added if needed.

3. **Scoring System**: 0-100 scale with weighted criteria:

   - Price competitiveness (30%)
   - Delivery timeline (25%)
   - Warranty coverage (20%)
   - Response completeness (15%)
   - Terms favorability (10%)

4. **Data Model**: Both raw input and AI-parsed structured data are stored for audit trail and potential re-parsing.

---

## Error Response Format

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "statusCode": 400,
    "details": {}
  }
}
```

---

## License

MIT
