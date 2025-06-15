const express = require('express');
const Router = express.Router();
const sendEmail = require('../utils/send-mail');
const validator = require('validator');

Router.post('/submit', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Input validation
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        if (name.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Name must be at least 2 characters long'
            });
        }

        if (message.length < 10) {
            return res.status(400).json({
                success: false,
                message: 'Message must be at least 10 characters long'
            });
        }

        const emailContent = `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject || 'No subject provided'}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
        `;

        try {
            await sendEmail(
                process.env.EMAIL_USER,
                `New Contact Form Submission from ${name}`,
                emailContent,
                true
            );

            const userConfirmationContent = `
                <h2>Thank you for contacting CyberBid!</h2>
                <p>Dear ${name},</p>
                <p>We have received your message and will get back to you as soon as possible.</p>
                <p>Here's a copy of your message:</p>
                <p><strong>Subject:</strong> ${subject || 'No subject provided'}</p>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
                <br>
                <p>Best regards,</p>
                <p>The CyberBid Team</p>
            `;

            await sendEmail(
                email,
                'Thank you for contacting CyberBid',
                userConfirmationContent,
                true
            );

            res.status(200).json({
                success: true,
                message: 'Message sent successfully'
            });
        } catch (emailError) {
            console.error('Email sending error:', emailError);
            res.status(500).json({
                success: false,
                message: 'Failed to send email. Please try again later.'
            });
        }

    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process your request. Please try again later.'
        });
    }
});

module.exports = Router; 