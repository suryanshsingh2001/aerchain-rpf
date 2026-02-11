# AI-Powered RFP Management System

> A comprehensive single-user web application that streamlines the Request for Proposal (RFP) workflow with AI-powered natural language processing, automated vendor communication, and intelligent proposal evaluation.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-green.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.2-purple.svg)](https://www.prisma.io/)
[![Gemini](https://img.shields.io/badge/Gemini-2.5_Flash-orange.svg)](https://ai.google.dev/)


<div>
    <a href="https://www.loom.com/share/2b9071cd3df140499f8d7d96be493d14">
    </a>
    <a href="https://www.loom.com/share/2b9071cd3df140499f8d7d96be493d14">
      <img style="max-width:300px;" src="https://cdn.loom.com/sessions/thumbnails/2b9071cd3df140499f8d7d96be493d14-59a2d05ef6226465-full-play.gif#t=0.1">
    </a>
  </div>Î
## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Project Setup](#-project-setup)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Data Models](#-data-models)
- [AI Integration](#-ai-integration)
- [Decisions & Assumptions](#️-decisions--assumptions)
- [Limitations & Trade-offs](#-limitations--trade-offs)
- [AI Tools Usage](#-ai-tools-usage)
- [Additional Notes](#-additional-notes)
- [About Me](#about-me)
---

## 🎯 Overview

This application helps procurement managers streamline their RFP workflow by:

1. **Creating RFPs from natural language** - Describe what you need to procure in plain English
2. **Managing vendors** - Maintain a vendor database with contact information and categories
3. **Sending RFPs via email** - Automatically generate and send professional RFP emails to selected vendors
4. **Receiving & parsing vendor responses** - IMAP polling automatically captures vendor emails and uses AI to extract structured data
5. **Comparing proposals with AI** - Get intelligent scoring, strengths/weaknesses analysis, and vendor recommendations

---

## ✨ Features

### Core Functionality

| Feature                           | Description                                                                                                                |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Natural Language RFP Creation** | Input procurement needs in plain English; AI extracts items, quantities, budget, delivery terms, and warranty requirements |
| **Vendor Management**             | Full CRUD operations with search, filtering by status, and category tagging                                                |
| **Email Integration**             | SMTP for sending professional HTML RFP emails; IMAP polling for receiving vendor responses                                 |
| **AI Proposal Parsing**           | Automatically extracts pricing, delivery terms, warranties, and conditions from messy vendor emails                        |
| **Intelligent Comparison**        | Multi-criteria scoring (price, delivery, warranty, completeness) with detailed reasoning                                   |
| **Recommendation Engine**         | AI-powered vendor recommendation with explanation of why the vendor was chosen                                             |

### AI-Powered Capabilities

- **RFP Structuring**: Converts natural language like _"I need 20 laptops with 16GB RAM and 15 monitors 27-inch, budget $50k, delivery in 30 days"_ into a structured JSON schema
- **Response Extraction**: Parses unstructured vendor emails to extract line-item pricing, totals, and terms
- **Proposal Scoring**: Scores proposals 0-100 based on weighted criteria (price 30%, delivery 25%, warranty 20%, completeness 15%, terms 10%)
- **Comparison Summary**: Generates detailed strengths/weaknesses analysis and actionable recommendations

---

## 🚀 Project Setup

### 1. Prerequisites

| Requirement               | Version | Notes                                                           |
| ------------------------- | ------- | --------------------------------------------------------------- |
| **Node.js**               | v18+    | Verified on v20                                                 |
| **PostgreSQL**            | 14+     | Docker container provided, or use local installation            |
| **Google Gemini API Key** | -       | Get from [Google AI Studio](https://aistudio.google.com/apikey) |
| **Email Account**         | -       | Gmail recommended (with App Password for SMTP/IMAP)             |

### 2. Clone the Repository

```bash
git clone https://github.com/suryanshsingh2001/aerchain-rpf.git
cd aerchain-rpf
```

### 3. Backend Setup

```bash
cd backend

# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Server
PORT=3001
NODE_ENV=development

# Database (use Docker or your own PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/rfp_db?schema=public"

# Google Gemini AI (Required)
GEMINI_API_KEY="your-gemini-api-key"

# Email SMTP - Sending (Required for email features)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="RFP System <your-email@gmail.com>"

# Email IMAP - Receiving (Required for inbound email)
IMAP_HOST="imap.gmail.com"
IMAP_PORT=993
IMAP_USER="your-email@gmail.com"
IMAP_PASS="your-app-password"
IMAP_TLS=true
IMAP_POLLING_INTERVAL=2  # minutes
```

```bash
# 3. Start PostgreSQL with Docker (optional)
docker-compose up -d

# 4. Setup database (migrations + seed data)
npm run setup

# 5. Start the development server
npm run dev
```

The backend will be running at `http://localhost:3001`

### 4. Frontend Setup

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Configure environment variables
cp env.example .env.local
```

Edit `.env.local` if needed (defaults work for local development):

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

```bash
# 3. Start the development server
npm run dev
```

The frontend will be running at `http://localhost:3000`

### 5. Seed Data

The setup script automatically seeds the database with:

- **5 sample vendors** (4 active, 1 inactive) with different specializations
- **2 sample RFPs** with items, budgets, and terms
- **Sample proposals** linked to vendors and RFPs

To reseed manually:

```bash
cd backend
npm run seed
```

### 6. Configuring Email

#### Option A: Gmail (IMAP Polling)

To enable email sending/receiving with Gmail:

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate an App Password**: Google Account → Security → 2-Step Verification → App passwords
3. Use the 16-character App Password (without spaces) for both `SMTP_PASS` and `IMAP_PASS`
4. **Enable IMAP** in Gmail: Settings → See all settings → Forwarding and POP/IMAP → Enable IMAP

#### Option B: Webhook (Resend, SendGrid, etc.)

For production deployments, you can use webhook-based inbound email services:

1. **Configure your email service** (Resend, SendGrid, Mailgun, etc.) to forward inbound emails to your webhook URL
2. **Set your webhook endpoint**: `POST https://your-domain.com/api/emails/webhook`
3. **Configure webhook secret** in `.env`:
   ```env
   EMAIL_WEBHOOK_SECRET="your-webhook-secret"
   ```
4. **Webhook payload format**:
   ```json
   {
     "from": "vendor@example.com",
     "to": "rfp-system@yourdomain.com",
     "subject": "RE: RFP-12345",
     "body": "Email content...",
     "rawPayload": {}
   }
   ```

> **Note**: Webhook approach is recommended for production as it provides real-time processing without polling delays.

---

## 🛠 Tech Stack

| Layer        | Technology               | Purpose                                |
| ------------ | ------------------------ | -------------------------------------- |
| **Frontend** | Next.js 16 (App Router)  | React framework with server components |
|              | React 19                 | UI library with latest features        |
|              | TailwindCSS v4           | Utility-first styling                  |
|              | Shadcn UI                | Accessible, customizable components    |
|              | React Hook Form + Zod    | Form handling and validation           |
|              | Recharts                 | Data visualization                     |
| **Backend**  | Express.js 4.21          | REST API framework                     |
|              | TypeScript 5.7           | Type safety and DX                     |
|              | Prisma ORM 6.2           | Database access and migrations         |
|              | Zod                      | Runtime schema validation              |
| **Database** | PostgreSQL               | Relational database                    |
| **AI**       | Google Gemini 2.5 Flash  | NLP, parsing, and comparison           |
| **Email**    | Nodemailer               | SMTP email sending                     |
|              | imap-simple + mailparser | IMAP email receiving                   |
|              | Webhook Support          | Inbound email via Resend/SendGrid      |
| **DevOps**   | Docker Compose           | Database containerization              |

---

## 📂 Project Structure

### Backend (`/backend`)

```
backend/
├── src/
│   ├── config/              # Configuration
│   │   ├── database.ts      # Prisma client singleton
│   │   ├── env.ts           # Environment validation (Zod)
│   │   └── index.ts         # Config exports
│   ├── controllers/         # Request handlers
│   │   ├── rfp.controller.ts       # RFP CRUD + send
│   │   ├── vendor.controller.ts    # Vendor CRUD
│   │   ├── proposal.controller.ts  # Proposal comparison
│   │   └── email.controller.ts     # IMAP status/control
│   ├── services/            # Business logic
│   │   ├── gemini.service.ts       # AI integration
│   │   ├── email.service.ts        # SMTP sending
│   │   └── imap.service.ts         # IMAP polling
│   ├── routes/              # API route definitions
│   ├── schemas/             # Zod validation schemas
│   ├── middleware/          # Error handling
│   ├── types/               # TypeScript interfaces
│   └── utils/               # Response helpers
│   └── index.ts             # Server entry point
├── prisma/
│   ├── schema.prisma        # Database schema
│   ├── seed.ts              # Seed data script
│   └── migrations/          # Database migrations
└── docker-compose.yml       # PostgreSQL container
```

### Frontend (`/frontend`)

```
frontend/
├── app/                     # Next.js App Router
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Dashboard home
│   ├── rfps/                # RFP pages
│   │   ├── page.tsx         # List all RFPs
│   │   ├── create/          # Create new RFP
│   │   └── [id]/            # RFP detail/compare
│   └── vendors/             # Vendor pages
│       ├── page.tsx         # List all vendors
│       ├── create/          # Create new vendor
│       └── [id]/            # Vendor detail
├── components/
│   ├── ui/                  # Shadcn UI components
│   └── layout/              # Header, sidebar, etc.
├── features/                # Feature-specific components
│   ├── rfps/                # RFP components
│   ├── vendors/             # Vendor components
│   ├── proposals/           # Proposal components
│   └── dashboard/           # Dashboard widgets
├── lib/
│   ├── api.ts               # API client
│   ├── types.ts             # TypeScript types
│   └── utils.ts             # Utility functions
└── hooks/                   # Custom React hooks
```

---

## 📖 API Documentation

### Overview

This section documents the RESTful API endpoints for managing RFPs, vendors, proposals, and email integration.
Postman collection is available in the `backend/postman_collection.json` folder.

### Base URL

```
http://localhost:3001/api
```

### Response Format

All endpoints return responses in this format:

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

Error responses:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

---

### RFP Endpoints

#### Create RFP from Natural Language

```http
POST /api/rfps
Content-Type: application/json

{
  "naturalLanguageInput": "I need to procure laptops and monitors for our new office. Budget is $50,000 total. Need delivery within 30 days. We need 20 laptops with 16GB RAM and 15 monitors 27-inch. Payment terms should be net 30, and we need at least 1 year warranty."
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "clxyz123...",
    "originalInput": "I need to procure laptops...",
    "title": "Office IT Equipment Procurement",
    "description": "Procurement of laptops and monitors for new office",
    "items": [
      {
        "name": "Laptop",
        "quantity": 20,
        "specifications": "16GB RAM, 512GB SSD",
        "unit": "units"
      },
      {
        "name": "Monitor",
        "quantity": 15,
        "specifications": "27-inch, 4K resolution",
        "unit": "units"
      }
    ],
    "budget": 50000,
    "currency": "USD",
    "deliveryDays": 30,
    "paymentTerms": "Net 30",
    "warrantyMonths": 12,
    "status": "DRAFT",
    "createdAt": "2026-01-16T10:00:00.000Z"
  }
}
```

#### List All RFPs

```http
GET /api/rfps?page=1&limit=10
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "clxyz123...",
      "title": "Office IT Equipment",
      "status": "SENT",
      "budget": 50000,
      "rfpVendors": [{ "vendor": { "name": "Tech Solutions Inc" } }],
      "_count": { "proposals": 2 }
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 5, "totalPages": 1 }
}
```

#### Get RFP by ID

```http
GET /api/rfps/:id
```

**Response (200 OK):** Returns full RFP with related vendors and proposals.

#### Update RFP

```http
PUT /api/rfps/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "budget": 60000,
  "status": "DRAFT"
}
```

#### Delete RFP

```http
DELETE /api/rfps/:id
```

#### Send RFP to Vendors

```http
POST /api/rfps/:id/send
Content-Type: application/json

{
  "vendorIds": ["vendor-id-1", "vendor-id-2"]
}
```

**Response (200 OK):**

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

#### Compare Proposals for RFP

```http
POST /api/rfps/:rfpId/compare
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "rfpId": "clxyz123...",
    "proposals": [
      {
        "proposalId": "prop-1",
        "vendorName": "Tech Solutions Inc",
        "score": 85,
        "summary": "Strong proposal with competitive pricing",
        "strengths": ["Best price", "Meets delivery timeline"],
        "weaknesses": ["Shorter warranty"]
      }
    ],
    "recommendation": {
      "vendorId": "vendor-1",
      "vendorName": "Tech Solutions Inc",
      "reasoning": "Best overall value with competitive pricing and reliable delivery."
    },
    "summary": "3 proposals compared. Tech Solutions Inc recommended for best value."
  }
}
```

---

### Vendor Endpoints

#### Create Vendor

```http
POST /api/vendors
Content-Type: application/json

{
  "name": "Tech Solutions Inc",
  "email": "sales@techsolutions.com",
  "contactPerson": "John Smith",
  "phone": "+1-555-0101",
  "address": "123 Tech Street, Silicon Valley, CA",
  "categories": ["IT Hardware", "Software", "Networking"]
}
```

#### List Vendors

```http
GET /api/vendors?page=1&limit=10&search=tech&status=ACTIVE
```

#### Get Vendor by ID

```http
GET /api/vendors/:id
```

**Response:** Includes recent RFPs sent to vendor and received proposals.

#### Update Vendor

```http
PUT /api/vendors/:id
Content-Type: application/json

{
  "phone": "+1-555-0102",
  "status": "INACTIVE"
}
```

#### Delete Vendor

```http
DELETE /api/vendors/:id
```

---

### Proposal Endpoints

#### Get Proposal by ID

```http
GET /api/proposals/:id
```

**Response:** Full proposal with parsed data, AI scores, and related RFP/vendor info.

#### Create Proposal (Manual/Testing)

```http
POST /api/proposals
Content-Type: application/json

{
  "rfpId": "rfp-id",
  "vendorId": "vendor-id",
  "rawContent": "Dear Sir, we are pleased to quote...",
  "rawSubject": "RE: RFP-12345"
}
```

#### Get Proposals for RFP

```http
GET /api/rfps/:rfpId/proposals
```

---

### Email/IMAP Endpoints

#### Get IMAP Status

```http
GET /api/emails/imap/status
```

**Response:**

```json
{
  "success": true,
  "data": {
    "configured": true,
    "polling": true,
    "lastFetch": "2026-01-16T09:00:00.000Z",
    "host": "imap.gmail.com"
  }
}
```

#### Test IMAP Connection

```http
POST /api/emails/imap/test
```

#### Manually Fetch Emails

```http
POST /api/emails/imap/fetch
```

#### Start IMAP Polling

```http
POST /api/emails/imap/polling/start?interval=2
```

#### Stop IMAP Polling

```http
POST /api/emails/imap/polling/stop
```

#### Inbound Email Webhook

```http
POST /api/emails/webhook
Content-Type: application/json
X-Webhook-Secret: your-webhook-secret

{
  "from": "vendor@example.com",
  "to": "rfp@yourdomain.com",
  "subject": "RE: RFP-ABC123",
  "body": "Dear Sir, we are pleased to submit our proposal...",
  "rawPayload": {}
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "message": "Email processed successfully",
    "proposalId": "prop-xyz...",
    "vendorId": "vendor-123",
    "rfpId": "rfp-abc"
  }
}
```

> Used by services like Resend, SendGrid, or Mailgun for real-time inbound email processing.

#### List All Emails

```http
GET /api/emails?page=1&limit=10&type=INBOUND
```

---

## 🗃 Data Models

### Entity Relationship

```
┌─────────┐      ┌───────────┐      ┌──────────┐
│   RFP   │──┬───│ RfpVendor │───┬──│  Vendor  │
└─────────┘  │   └───────────┘   │  └──────────┘
     │       │                   │       │
     │       └───────────────────┘       │
     │                                   │
     └─────────┬─────────────────────────┘
               │
         ┌──────────┐
         │ Proposal │
         └──────────┘
               │
         ┌─────────┐
         │  Email  │
         └─────────┘
```

### RFP Schema

| Field            | Type    | Description                                         |
| ---------------- | ------- | --------------------------------------------------- |
| `id`             | string  | CUID primary key                                    |
| `originalInput`  | string  | Natural language input                              |
| `title`          | string  | AI-extracted title                                  |
| `description`    | string  | AI-extracted description                            |
| `items`          | JSON    | Array of `{ name, quantity, specifications, unit }` |
| `budget`         | decimal | Budget amount                                       |
| `currency`       | string  | Currency code (default: USD)                        |
| `deliveryDays`   | int     | Required delivery days                              |
| `paymentTerms`   | string  | e.g., "Net 30"                                      |
| `warrantyMonths` | int     | Required warranty months                            |
| `status`         | enum    | `DRAFT`, `SENT`, `EVALUATING`, `CLOSED`             |

### Vendor Schema

| Field           | Type   | Description               |
| --------------- | ------ | ------------------------- |
| `id`            | string | CUID primary key          |
| `name`          | string | Company name              |
| `email`         | string | Contact email (unique)    |
| `contactPerson` | string | Primary contact name      |
| `phone`         | string | Phone number              |
| `address`       | string | Business address          |
| `categories`    | JSON   | Array of category strings |
| `status`        | enum   | `ACTIVE`, `INACTIVE`      |

### Proposal Schema

| Field            | Type    | Description                       |
| ---------------- | ------- | --------------------------------- |
| `id`             | string  | CUID primary key                  |
| `rfpId`          | string  | Foreign key to RFP                |
| `vendorId`       | string  | Foreign key to Vendor             |
| `rawContent`     | string  | Original email body               |
| `parsedData`     | JSON    | AI-extracted structured data      |
| `totalPrice`     | decimal | Extracted total price             |
| `deliveryDays`   | int     | Offered delivery days             |
| `warrantyMonths` | int     | Offered warranty months           |
| `paymentTerms`   | string  | Offered payment terms             |
| `aiScore`        | int     | AI score (0-100)                  |
| `aiSummary`      | string  | AI-generated summary              |
| `aiStrengths`    | JSON    | Array of strengths                |
| `aiWeaknesses`   | JSON    | Array of weaknesses               |
| `status`         | enum    | `RECEIVED`, `PARSED`, `EVALUATED` |

---

## 🤖 AI Integration

### Overview

The system uses **Google Gemini 2.5 Flash** for three core AI capabilities:

### 1. Natural Language to Structured RFP

**Input:** User's natural language procurement request  
**Output:** Structured JSON with extracted fields

```typescript
// Example prompt structure (simplified)
const prompt = `Parse the following procurement request into structured RFP:
Input: "${userInput}"

Extract: title, description, items[], budget, currency, deliveryDays, 
paymentTerms, warrantyMonths, additionalTerms

Return ONLY valid JSON.`;
```

### 2. Vendor Response Parsing

**Input:** Vendor email content + Original RFP context  
**Output:** Structured proposal data with matched items

```typescript
// Example: Matches vendor's quoted items to RFP items
{
  "items": [
    { "name": "Laptop", "quotedPrice": 1200, "quantity": 20 }
  ],
  "totalPrice": 42000,
  "deliveryDays": 25,
  "warrantyMonths": 24
}
```

### 3. Proposal Comparison & Recommendation

**Input:** All proposals for an RFP  
**Output:** Scores, analysis, and recommendation

**Scoring Criteria:**

- **Price Competitiveness (30%)** - How well does price fit budget?
- **Delivery Timeline (25%)** - Meets required deadline?
- **Warranty Coverage (20%)** - Meets or exceeds requirements?
- **Completeness (15%)** - All items quoted?
- **Terms & Conditions (10%)** - Favorable payment terms?

---

## 🎯 Decisions & Assumptions

### Key Design Decisions

| Decision                     | Rationale                                                                                                                |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Dual Email Ingestion**     | Support both IMAP polling (easy local dev) and webhooks (production-ready with Resend/SendGrid)                          |
| **IMAP Polling vs Webhooks** | Chose IMAP polling for easier setup with standard email providers (Gmail, Outlook) without requiring public webhook URLs |
| **Gemini 2.5 Flash**         | Excellent JSON extraction capabilities, fast response times, and cost-effective for structured data tasks                |
| **Prisma ORM**               | Type-safe database access with excellent migration support and developer experience                                      |
| **Single-user focus**        | Per requirements - no authentication complexity, simpler state management                                                |
| **Synchronous AI calls**     | Simpler architecture for MVP; async queue noted as production improvement                                                |

### Assumptions

1. **Email Format**: Vendor responses are primarily text-based emails; PDF attachment parsing is out of scope
2. **Single Currency**: Comparisons assume all proposals use the same currency (USD default)
3. **Honest Vendors**: No adversarial input validation for vendor responses
4. **Gmail Compatibility**: Primary testing done with Gmail; other providers may need config adjustments
5. **Local Development**: Designed for local/single-machine deployment
6. **Data Preservation for Re-processing**: We store both `originalInput` (raw natural language) and the AI-extracted structured data for RFPs, and `rawContent` alongside `parsedData` for proposals. This allows re-processing with AI if models improve, prompts are refined, or extraction needs to be re-run without losing source data

---

## ⚠️ Limitations & Trade-offs

### 1. Email Handling Options

- **IMAP Polling**: Polls at configurable intervals (default: 2 minutes)
  - _Limitation_: Not real-time; delay between vendor reply and system processing
  - _Mitigation_: Adjustable polling interval; manual fetch endpoint available
- **Webhook Support**: Real-time processing via services like Resend, SendGrid, Mailgun
  - _Advantage_: Instant processing, no polling delay
  - _Requirement_: Public URL for webhook endpoint

### 2. Synchronous AI Processing

- **Design**: AI calls block the HTTP request
- **Limitation**: Long operations may timeout; no background job queue
- **Production Fix**: Add Redis + BullMQ for async job processing

### 3. Email Reliability

- **Design**: Direct SMTP calls without message queue
- **Limitation**: Failed emails are logged but not automatically retried
- **Production Fix**: Add message queue (SQS, RabbitMQ) for reliable delivery

### 4. Attachment Handling

- **Current**: Email attachments are detected but not parsed
- **Limitation**: PDF quotes/proposals not automatically extracted
- **Future**: Add PDF parsing with document AI

### 5. Multi-currency Support

- **Current**: All prices assumed in single currency (USD)
- **Limitation**: No automatic currency conversion for comparison
- **Future**: Add exchange rate API integration

---

## 🔧 AI Tools Usage

### Tools Used During Development

| Tool                   | Purpose                                                    |
| ---------------------- | ---------------------------------------------------------- |
| **GitHub Copilot**     | Code completion, boilerplate generation, typing assistance |
| **Claude (Anthropic)** | Architecture decisions, prompt engineering, documentation  |
| **Google AI Studio**   | Testing Gemini prompts, optimizing JSON extraction         |

### How AI Assisted

1. **Boilerplate Generation**

   - Initial Express + TypeScript setup
   - Prisma schema design
   - React component scaffolding

2. **Prompt Engineering**

   - Crafted system prompts for reliable JSON extraction
   - Iteratively improved prompts for messy email parsing
   - Designed scoring criteria and weightings

3. **Debugging & Problem Solving**

   - Resolved Prisma type incompatibilities
   - Fixed IMAP connection handling
   - Docker networking configuration

4. **Documentation**
   - API documentation structure
   - README organization
   - Code comments and JSDoc

### Key Learnings

- **Generative Extraction > Regex**: Asking an LLM to convert unstructured text to JSON is far more robust than regex for vendor emails
- **Explicit JSON Instructions**: Adding "Return ONLY valid JSON, no markdown" dramatically improved parsing reliability
- **Context Matters**: Including original RFP details in the parsing prompt significantly improved item matching accuracy

---

## 📝 Additional Notes

### Known Issues

- IMAP connection may timeout with some corporate email servers
- Very long RFP inputs (>4000 chars) may hit token limits

### What's Next (If More Time)

- [ ] PDF attachment parsing with Document AI
- [ ] Background job queue for AI operations
- [ ] Email delivery tracking (opens, bounces)
- [ ] Multi-currency support with exchange rates
- [ ] Batch operations for vendor management
- [ ] Export comparison reports to PDF

---


## About Me

I am Suryansh Singh, a passionate full-stack developer with a keen interest in AI-powered applications. I love building tools that solve real-world problems and enhance productivity. Feel free to connect with me on [LinkedIn](https://www.linkedin.com/in/suryanshsingh2001/) or check out my other projects on [GitHub](https://github.com/suryanshsingh2001).
