import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import { Resend } from 'resend';
import { z } from 'zod';
import './tracing.js';

const app = express();

// ================================
// CONFIG + ENV VALIDATION
// ================================
const PORT = Number(process.env.PORT) || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || '*';
// Use RESEND_FROM_OVERRIDE when EMAIL_FROM domain is not yet verified in Resend.
// Set RESEND_FROM_OVERRIDE=onboarding@resend.dev in .env as a temporary workaround.
const EMAIL_FROM = process.env.RESEND_FROM_OVERRIDE || process.env.EMAIL_FROM;
const EMAIL_TO = process.env.EMAIL_TO;

function isAllowedLocalOrigin(origin) {
  try {
    const { protocol, hostname } = new URL(origin);

    if (!['http:', 'https:'].includes(protocol)) {
      return false;
    }

    if (['localhost', '127.0.0.1'].includes(hostname)) {
      return true;
    }

    return /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(hostname);
  } catch {
    return false;
  }
}

const allowedOrigins = new Set(
  [
    FRONTEND_URL,
    'http://localhost:5500',
    'http://127.0.0.1:5500'
  ].filter((origin) => origin && origin !== '*')
);
//const FRONTEND_URL = 'https://somarythm.co.in'|| '*';  
const requiredEnvVars = ['MONGO_URI', 'RESEND_API_KEY', 'EMAIL_FROM', 'EMAIL_TO'];
const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingEnvVars.length > 0) {
  console.error(`❌ Missing required env vars: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

console.log("🚀 Starting server...");

// ================================
// MIDDLEWARE
// ================================
app.use(cors({
  origin(origin, callback) {
    if (FRONTEND_URL === '*' || !origin || allowedOrigins.has(origin) || isAllowedLocalOrigin(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  }
}));
app.use(express.json());

// ================================
// DATABASE (FAIL-FAST)
// ================================
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('🗄️ MongoDB connected');
  } catch (err) {
    console.error('❌ DB connection failed:', err);
    process.exit(1);
  }
}

// ================================
// RESEND SETUP
// ================================
const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function sendNotificationEmail({ subject, html, replyTo }) {
  const { data, error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: EMAIL_TO,
    subject,
    html,
    ...(replyTo ? { replyTo } : {})
  });

  if (error) {
    // Log the full Resend error so the root cause is always visible in server output
    console.error('❌ Resend error:', JSON.stringify(error, null, 2));
    const message = error.message || error.name || 'Email delivery failed';
    const hint = error.statusCode === 403
      ? ' (Resend account is still in testing mode or the sender domain is not verified. Verify the sending domain at https://resend.com/domains, or during development send only to the Resend account owner test inbox.)'
      : '';
    throw new Error(message + hint);
  }

  return data;
}

// ================================
// ROUTES
// ================================

// Health check
app.get('/', (req, res) => {
  res.send('API running 🚀');
});

// 🔥 TEST EMAIL ROUTE
app.get('/test-email', async (req, res) => {
  try {
    const result = await sendNotificationEmail({
      subject: "Test Email FINAL 🚀",
      html: "<h2>Email system working!</h2>"
    });

    console.log("📧 TEST EMAIL RESULT:", result);

    res.json({ success: true, id: result?.id ?? null });

  } catch (err) {
    console.error("❌ TEST EMAIL ERROR:", err);
    res.status(502).json({ success: false, error: "Email failed" });
  }
});

// ================================
// VALIDATION SCHEMA (ZOD)
// ================================
const formschema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().optional(),
  type: z.string().optional(),
  class: z.string().optional(),
});

// ================================
// DATABASE SCHEMA
// ================================
const FormSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  message: String,
  type: String,
  class: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});
const Form = mongoose.model("Form", FormSchema);


// ================================
// FORM ROUTE
// ================================

app.post('/api/form', async (req, res) => {


  console.log("🚨 ROUTE HIT");
  console.log("📩 Incoming request:", req.body);

  const parsed = formschema.safeParse(req.body);
  if (!parsed.success) {
    console.error("❌ Validation failed:", parsed.error);
    return res.status(400).json({ error: "Invalid input" });
  }

  const data = parsed.data;

  try {
    const saved = await Form.create(data);
    console.log("💾 Saved to DB:", saved._id);

    // EMAIL SEND BLOCK
    try {
      console.log("🚨 EMAIL BLOCK REACHED");
      const emailResult = await sendNotificationEmail({
        subject: `New ${escapeHtml(data.type || 'contact')} form submission`,
        replyTo: data.email,
        html: `
          <h2>New form submission</h2>
          <p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
          <p><strong>Phone:</strong> ${escapeHtml(data.phone || 'Not provided')}</p>
          <p><strong>Type:</strong> ${escapeHtml(data.type || 'contact')}</p>
          <p><strong>Message:</strong> ${escapeHtml(data.message || 'Not provided')}</p>
        `
      });

      console.log("📧 FORM EMAIL FULL:", JSON.stringify(emailResult, null, 2));
      return res.json({ success: true, savedId: saved._id, emailId: emailResult?.id ?? null });

    } catch (emailErr) {
      console.error("❌ Email failed HARD:", emailErr);
      return res.status(502).json({ success: false, error: "Form saved but email delivery failed" });
    }

  } catch (error) {
    console.error("❌ FORM ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ ROUTE CLOSED

// ================================
// START SERVER
// ================================
async function startServer() {
  await connectDB();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

startServer();
