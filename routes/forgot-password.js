const express = require("express");
const db = require("../db");
const sendEmail = require("../utils/send-mail");
const Router = express.Router();
const env = require("dotenv").config();
const crypto = require("crypto");

Router.post("/", async (req, res) => {
  const { email } = req.body;

  const [user] = await db
    .promise()
    .query("SELECT * FROM users WHERE email = ?", [email]);
  if (!user.length) return res.status(404).json({ msg: "User not found" });

  const token = crypto.randomBytes(64).toString("hex");
  const expiry = new Date(Date.now() + 3600000);

  await db
    .promise()
    .query(
      "INSERT INTO password_resets (user_email, reset_token, reset_token_expiry) VALUES (?, ?, ?)",
      [email, token, expiry]
    );

  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Reset Your Password</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #f8f9fa;
      padding: 20px;
      text-align: center;
      border-bottom: 1px solid #dee2e6;
    }
    .content {
      padding: 20px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #0d6efd;
      text-decoration: none;
      color: #ffffff;
      border-radius: 4px;
      font-weight: bold;
      margin: 20px 0;
    }
      .button:hover {
      background-color: #0056b3;
    }
      .button a {
      color: #ffffff;
      }
    .footer {
      margin-top: 30px;
      text-align: center;
      font-size: 12px;
      color: #6c757d;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Password Reset Request</h1>
    </div>
    <div class="content">
      <p>Hello,</p>
      <p>We received a request to reset your password. If you didn't make this request, you can ignore this email.</p>
      <p>To reset your password, please click the button below:</p>
      <div style="text-align: center;">
        <a href="${resetLink}" class="button">Reset Password</a>
      </div>
      <p>Or copy and paste this link into your browser:</p>
      <p>${resetLink}</p>
      <p>This link will expire in 1 hour for security reasons.</p>
      <p>Thank you,<br>CyberBid Team</p>
    </div>
    <div class="footer">
      <p>This is an automated email. Please do not reply to this message.</p>
    </div>
  </div>
</body>
</html>
`;

  await sendEmail(email, "Reset Password Request", emailHtml, true);

  res.json({ msg: "Reset link sent" });
});

module.exports = Router;
