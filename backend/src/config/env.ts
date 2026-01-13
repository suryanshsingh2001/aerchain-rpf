import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  // Server
  PORT: z.string().default("3001"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // Gemini AI
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),

  // Email SMTP
  SMTP_HOST: z.string().default("smtp.gmail.com"),
  SMTP_PORT: z.string().default("587"),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default("RFP System <noreply@rfp.local>"),

  // Webhook
  EMAIL_WEBHOOK_SECRET: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  port: parseInt(parsed.data.PORT, 10),
  nodeEnv: parsed.data.NODE_ENV,
  databaseUrl: parsed.data.DATABASE_URL,
  geminiApiKey: parsed.data.GEMINI_API_KEY,
  smtp: {
    host: parsed.data.SMTP_HOST,
    port: parseInt(parsed.data.SMTP_PORT, 10),
    user: parsed.data.SMTP_USER,
    pass: parsed.data.SMTP_PASS,
    from: parsed.data.SMTP_FROM,
  },
  emailWebhookSecret: parsed.data.EMAIL_WEBHOOK_SECRET,
};

export type Env = typeof env;
