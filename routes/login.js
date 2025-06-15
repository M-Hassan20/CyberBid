const jwt = require("jsonwebtoken");
const Router = require("express").Router();
const db = require("../db");
const env = require("dotenv").config();
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const login_limiter = require("../middleware/login_limiter.js");

Router.post("/", login_limiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const loginQuery = `CALL LOGIN(?)`;
    const [results] = await db.promise().query(loginQuery, [email]);
    if (!results[0] || results[0].length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = results[0][0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const refreshToken = jwt.sign(
      { user_id: user.user_id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
    const expiryInSeconds =
      parseInt(process.env.REFRESH_TOKEN_EXPIRY) * 24 * 60 * 60;
    const expiryDate = new Date(Date.now() + expiryInSeconds * 1000)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
    const refreshTokenQuery = `INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)`;
    await db
      .promise()
      .query(refreshTokenQuery, [user.user_id, refreshToken, expiryDate]);

    const accessToken = jwt.sign(
      { user_id: user.user_id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );
    res.json({ message: "Login successful", token: accessToken, refreshToken: refreshToken, user: {id: user.user_id, email: user.email, role: user.role, user_name: user.user_name} });
  } catch (error) {
    next(error);
  }
});

module.exports = Router;
