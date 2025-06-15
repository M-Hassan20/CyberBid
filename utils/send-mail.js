const nodemailer = require('nodemailer');
const env = require('dotenv').config();

async function sendEmail(to, subject, content, isHtml = false) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
    });

    const mailOptions = {
        from: `"CyberBid Admin" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: subject,
    };


    if (isHtml) {
        mailOptions.html = content;
    } else {
        mailOptions.text = content;
    }

    await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;