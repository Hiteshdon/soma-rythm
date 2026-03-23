import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import 'dotenv/config';

const app = express();

// ================================
// CONFIG
// ================================
const PORT = process.env.PORT || 3000;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const FRONTEND_URL = process.env.FRONTEND_URL || '*';

// ================================
// MIDDLEWARE
// ================================
app.use(cors({
    origin: FRONTEND_URL, // restrict later to your domain
    methods: ['POST', 'GET'],
}));
app.use(express.json());

// ================================
// VALIDATION HELPER
// ================================
function validate(data) {
    if (!data.name || !data.email) {
        return 'Name and Email are required';
    }
    return null;
}

// ================================
// FORMAT HELPER
// ================================
function formatFormData(data) {
    return Object.entries(data)
        .filter(([key]) => key !== 'type')
        .map(([key, value]) => `${key.toUpperCase()}: ${value}`)
        .join('\n');
}

// ================================
// EMAIL SETUP
// ================================
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    }
});

// ================================
// ROUTES
// ================================

// Health check
app.get('/', (req, res) => {
    res.send('API running 🚀');
});

// Form endpoint
app.post('/api/form', async (req, res) => {
    try {
        const data = req.body;

        // 🔍 Validation
        if (!data.name || !data.email) {
            return res.status(400).json({
                success: false,
                message: 'Name and Email required'
            });
        }

        // 🎯 Get class type (from frontend)
        const classType = data.type || data.class || 'General';

        // 🎶 Custom subject based on class
        const subject = `🎶 ${classType.toUpperCase()} CLASS ENROLLMENT`;

        // 🧠 Format email body
        const formattedText = Object.entries(data)
            .map(([key, value]) => `${key.toUpperCase()}: ${value}`)
            .join('\n');

        // 📩 Send email
        await transporter.sendMail({
            from: `"SomaRhythm Academy" <${process.env.EMAIL_USER}>`,
            replyTo: data.email,
            to: process.env.EMAIL_USER,
            subject: subject,
            text: formattedText
        });

        console.log(`📩 ${classType} Submission:\n`, formattedText);

        res.json({
            success: true,
            message: `${classType} enrollment received`
        });

    } catch (error) {
        console.error('❌ Error:', error);

        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// ================================
// SERVER START
// ================================
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});