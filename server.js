import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import 'dotenv/config';
import { Resend } from 'resend';

const app = express();

// ================================
// CONFIG
// ================================
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || '*';

// ================================
// START LOG
// ================================
console.log("🚀 Starting server...");

// ================================
// MIDDLEWARE
// ================================
app.use(cors({
    origin: FRONTEND_URL
}));
app.use(express.json());

// ================================
// DATABASE CONNECTION
// ================================
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('🗄️ MongoDB connected'))
    .catch(err => {
        console.error('❌ DB error:', err);
    });

// ================================
// EMAIL SETUP (RESEND)
// ================================
const resend = new Resend(process.env.RESEND_API_KEY);

// ================================
// ROUTES
// ================================

// Health check
app.get('/', (req, res) => {
    res.send('API running 🚀');
});

// 🔥 TEST EMAIL ROUTE (KEEP THIS FOR DEBUG)
app.get('/test-email', async (req, res) => {
    try {
        const result = await resend.emails.send({
            from: `SomaRhythm Academy <${process.env.EMAIL_FROM}>`,
            to: process.env.EMAIL_TO,
            subject: "Test Email ✅",
            html: "<p>If you see this, email is working!</p>"
        });

        console.log("📧 TEST EMAIL RESULT:", result);

        res.send("Test email sent");
    } catch (err) {
        console.error("❌ Test email error:", err);
        res.status(500).send("Email failed");
    }
});

// ================================
// DATABASE SCHEMA
// ================================
const FormSchema = new mongoose.Schema({
    type: String,
    name: String,
    email: String,
    phone: String,
    class: String,
    data: Object,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Form = mongoose.model('Form', FormSchema);

// ================================
// FORM SUBMISSION ROUTE
// ================================
app.post('/api/form', async (req, res) => {
    try {
        const data = req.body;

        if (!data.name || !data.email) {
            return res.status(400).json({
                success: false,
                message: 'Name and Email required'
            });
        }

        const classType = data.type || data.class || 'General';

        // ✅ SAVE TO DB
        await Form.create({
            type: classType,
            name: data.name,
            email: data.email,
            phone: data.phone,
            class: data.class,
            data: data
        });

        // 📩 SEND EMAIL
        const result = await resend.emails.send({
            from: `SomaRhythm Academy <${process.env.EMAIL_FROM}>`,
            to: process.env.EMAIL_TO,
            reply_to: data.email,
            subject: `🎶 ${classType.toUpperCase()} CLASS ENROLLMENT`,
            html: `
                <h2>New ${classType} Enrollment</h2>
                ${Object.entries(data)
                    .map(([k, v]) => `<p><strong>${k}:</strong> ${v}</p>`)
                    .join('')}
            `
        });

        console.log("📧 EMAIL RESULT:", result);
        console.log(`📩 Saved + Sent (${classType})`);

        res.json({ success: true });

    } catch (error) {
        console.error('❌ Error:', error);

        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// ================================
// START SERVER (CRITICAL FIX)
// ================================
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

























/*import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import 'dotenv/config';
import { Resend } from 'resend';
const app = express();

// ================================
// CONFIG
// ================================
const PORT = process.env.PORT || 3000;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const FRONTEND_URL = process.env.FRONTEND_URL || '*';

// ================================
// DATABASE CONNECTION
// ================================
/*mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('🗄️ MongoDB connected'))
    .catch(err => console.error('❌ DB error:', err));*/
/*mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('🗄️ MongoDB connected'))
    .catch(err => {
        console.error('❌ DB error:', err);
        process.exit(1); // force crash visibly
    });
// ================================
// MIDDLEWARE
// ================================
app.use(cors());
app.use(express.json());
console.log("🚀 Starting server...");
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
const resend = new Resend(process.env.RESEND_API_KEY);


/* const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    }
});*/

// ================================
// ROUTES
// ================================

// Health check
/*
app.get('/', (req, res) => {
    res.send('API running 🚀');


// ================================
// DATABASE SCHEMA
// ================================

const FormSchema = new mongoose.Schema({
    type: String,
    name: String,
    email: String,
    phone: String,
    class: String,
    data: Object,  
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Form = mongoose.model('Form', FormSchema);
// Form endpoint
app.post('/api/form', async (req, res) => {
    try {
        const data = req.body;

        if (!data.name || !data.email) {
            return res.status(400).json({
                success: false,
                message: 'Name and Email required'
            });
        }

        const classType = data.type || data.class || 'General';

        // ✅ SAVE TO DB
        await Form.create({
            type: classType,
            name: data.name,
            email: data.email,
            phone: data.phone,
            class: data.class,
            data: data
        });
        

        // 📩 EMAIL
        const formattedText = Object.entries(data)
            .map(([k, v]) => `${k.toUpperCase()}: ${v}`)
            .join('\n');

        /*await transporter.sendMail({
            from: `"SomaRhythm Academy" <${process.env.EMAIL_USER}>`,
            replyTo: data.email,
            to: process.env.EMAIL_USER,
            subject: `🎶 ${classType.toUpperCase()} CLASS ENROLLMENT`,
            text: formattedText
        });*/

     /*   await resend.emails.send({
    from: `SomaRhythm Academy <${process.env.EMAIL_FROM}>`,
    to: process.env.EMAIL_TO,
    reply_to: data.email,
    subject: `🎶 ${classType.toUpperCase()} CLASS ENROLLMENT`,
    html: `
        <h3>New ${classType} Enrollment</h3>
        ${Object.entries(data)
            .map(([k, v]) => `<p><strong>${k}:</strong> ${v}</p>`)
            .join('')}
    `,
});

        console.log(`📩 Saved + Sent (${classType})`);

        res.json({ success: true });

    } catch (error) {
        console.error('❌ Error:', error);

        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});
/*app.post('/api/form', async (req, res) => {
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
});*/



/*await Form.create({
    type: classType,
    name: data.name,
    email: data.email,
    phone: data.phone,
    class: data.class,
    data: data
});*/
// ================================
// SERVER START
// ================================

/*const result = await resend.emails.send({
    from: `SomaRhythm Academy <${process.env.EMAIL_FROM}>`,
    to: process.env.EMAIL_TO,
    reply_to: data.email,
    subject: `🎶 ${classType.toUpperCase()} CLASS ENROLLMENT`,
    html: `...`
});

console.log("📧 RESEND RESULT:", result);
console.log("📡 About to start server...");

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

*/