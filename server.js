
import './tracing.js';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { z } from 'zod';
import 'dotenv/config';
import { Resend } from 'resend';

const app = express();

// ================================
// CONFIG + ENV VALIDATION
// ================================
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || '*';

// 🔥 ENV CHECK (CRITICAL - FIXED)
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI missing");
  process.exit(1);
}

if (!process.env.RESEND_API_KEY) {
  console.error("❌ RESEND_API_KEY missing");
  process.exit(1);
}

console.log("🚀 Starting server...");

// ================================
// MIDDLEWARE
// ================================
app.use(cors({
  origin: FRONTEND_URL === '*' ? true : FRONTEND_URL
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
    const result = await resend.emails.send({
      from: "SomaRhythm Academy <noreply@somarythm.co.in>",
      to: "academysoma318@gmail.com",
      subject: "Test Email FINAL 🚀",
      html: "<h2>Email system working!</h2>"
    });

    console.log("📧 TEST EMAIL RESULT:", result);
    console.log("📧 Headers:", result?.headers);

    res.send("Test email sent (check logs)");

  } catch (err) {
    console.error("❌ TEST EMAIL ERROR:", err);
    res.status(500).send("Email failed");
  }
});

// ================================
// VALIDATION SCHEMA (ZOD)
// ================================
const formSchema = z.object({
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

const Form = mongoose.model('Form', FormSchema);

// ================================
// FORM ROUTE
// ================================

app.post('/api/form', async (req, res) => {

  console.log("📩 Incoming request:", req.body);

  const parsed = formSchema.safeParse(req.body);

  if (!parsed.success) {
    console.error("❌ Validation failed:", parsed.error);
    return res.status(400).json({ error: "Invalid input" });
  }

  const data = parsed.data;
  const classType = data.type || data.class || 'General';

  try {
    const saved = await Form.create(data);
    console.log("💾 Saved to DB:", saved._id);

    try {
      const emailResult = await resend.emails.send({
          from: "SomaRhythm Academy <noreply@somarythm.co.in>",  // ✅ REQUIRED
          to: "academysoma318@gmail.com",
          subject: `Form submission ${Date.now()}`,
          html: `<h2>New form from ${data.name}</h2><p>${data.email}</p>`
        
      });

      console.log("📧 FORM EMAIL FULL:", JSON.stringify(emailResult, null, 2));
      console.log("📧 Headers:", emailResult?.headers);

    } catch (emailErr) {
      console.error("❌ Email failed HARD:", emailErr);
    }

    return res.json({ success: true });

  } catch (error) {
    console.error('❌ FORM ERROR:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}); // ✅ ROUTE CLOSED

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

