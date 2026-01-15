import express, { Application, Request, Response } from "express";
import cors from "cors";
import { env, prisma } from "./config";
import { errorHandler } from "./middleware";
import { imapService } from "./services";
import routes from "./routes";

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: env.nodeEnv,
  });
});

// API routes
app.use("/api", routes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      message: "Route not found",
      statusCode: 404,
    },
  });
});

// Error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log("✅ Database connected successfully");

    app.listen(env.port, () => {
      console.log(`
🚀 RFP Management System Backend
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Server:      http://localhost:${env.port}
🔧 Environment: ${env.nodeEnv}
📊 Health:      http://localhost:${env.port}/health
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

API Endpoints:
  POST   /api/rfps              - Create RFP from natural language
  GET    /api/rfps              - List all RFPs
  GET    /api/rfps/:id          - Get single RFP
  PUT    /api/rfps/:id          - Update RFP
  DELETE /api/rfps/:id          - Delete RFP
  POST   /api/rfps/:id/send     - Send RFP to vendors
  GET    /api/rfps/:id/proposals - Get proposals for RFP
  POST   /api/rfps/:id/compare  - Compare proposals (AI)
  
  POST   /api/vendors           - Create vendor
  GET    /api/vendors           - List vendors
  GET    /api/vendors/:id       - Get single vendor
  PUT    /api/vendors/:id       - Update vendor
  DELETE /api/vendors/:id       - Delete vendor
  
  GET    /api/proposals/:id     - Get single proposal
  POST   /api/proposals         - Create proposal (test)
  
  POST   /api/emails/webhook    - Inbound email webhook
  GET    /api/emails            - List emails
  
  GET    /api/emails/imap/status       - IMAP service status
  POST   /api/emails/imap/test         - Test IMAP connection
  POST   /api/emails/imap/fetch        - Fetch emails via IMAP
  POST   /api/emails/imap/polling/start - Start IMAP polling
  POST   /api/emails/imap/polling/stop  - Stop IMAP polling
      `);

      // Start IMAP polling if configured
      if (imapService.isConfigured()) {
        console.log("📬 IMAP configured - starting email polling...");
        imapService.startPolling(env.imap.pollingInterval);
      } else {
        console.log("⚠️  IMAP not configured - set IMAP_HOST, IMAP_USER, IMAP_PASS to enable");
      }
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n⏹️  Shutting down gracefully...");
  imapService.stopPolling();
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n⏹️  Shutting down gracefully...");
  imapService.stopPolling();
  await prisma.$disconnect();
  process.exit(0);
});

startServer();

export default app;
