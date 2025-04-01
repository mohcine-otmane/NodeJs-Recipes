require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');
const Bull = require('bull');
const cors = require('cors');
const { body, validationResult } = require('express-validator');

const app = express();
const port = process.env.PORT || 3000;

console.log('Starting server with SMTP settings:', {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER
});

const emailQueue = new Bull('email-queue', process.env.REDIS_URL);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.error('SMTP connection error:', error);
    } else {
        console.log('SMTP server is ready to send emails');
        console.log('Using Gmail account:', process.env.SMTP_USER);
    }
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

const validateEmail = [
    body('to').isEmail(),
    body('subject').notEmpty(),
    body('template').notEmpty(),
    body('data').isObject()
];

app.post('/api/send-email', validateEmail, async (req, res) => {
    console.log('Received email request:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error('Validation errors:', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

    const { to, subject, template, data } = req.body;

    try {
        console.log('Processing template:', template);
        const templatePath = path.join(__dirname, 'templates', `${template}.hbs`);
        const templateContent = await fs.readFile(templatePath, 'utf-8');
        const compiledTemplate = handlebars.compile(templateContent);
        const html = compiledTemplate(data);

        console.log('Adding job to queue');
        const job = await emailQueue.add({
            to,
            subject,
            html
        });
        console.log('Job added to queue:', job.id);

        res.json({ message: 'Email queued successfully', jobId: job.id });
    } catch (error) {
        console.error('Error processing email:', error);
        res.status(500).json({ error: error.message || 'Failed to queue email' });
    }
});

emailQueue.process(async (job) => {
    console.log('Processing email job:', job.id);
    const { to, subject, html } = job.data;

    try {
        console.log('Attempting to send email to:', to);
        const info = await transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject,
            html
        });
        console.log('Email sent successfully:', info.messageId);
    } catch (error) {
        console.error('Error sending email:', error);
        console.error('Error details:', {
            code: error.code,
            command: error.command,
            response: error.response,
            responseCode: error.responseCode
        });
        throw error;
    }
});

emailQueue.on('error', (error) => {
    console.error('Queue error:', error);
});

emailQueue.on('failed', (job, error) => {
    console.error('Job failed:', job.id, error);
    console.error('Error details:', {
        code: error.code,
        command: error.command,
        response: error.response,
        responseCode: error.responseCode
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 