const db = require("../db");
const Router = require("express").Router();
const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");
Router.post("/", async (req, res, next) => {
  let conn;
  try {
    console.log("Logged");
    const { user_name, email, password, role } = req.body;
    if (!user_name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (
      password.length < 8 ||
      !/\d/.test(password) ||
      !/[!@#$%^&*]/.test(password)
    ) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and contain a number and special character",
      });
    }

    const allowedUserTypes = ["seller", "buyer"];
    if (!allowedUserTypes.includes(role)) {
      return res.status(400).json({ message: "Invalid user type" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const [existingUser] = await db
      .promise()
      .query(
        `SELECT user_name, email FROM users WHERE user_name = ? OR email = ? LIMIT 1`,
        [user_name, email]
      );

    if (existingUser.length > 0) {
      if (existingUser[0].user_name === user_name) {
        return res.status(409).json({ message: "user_name already exists" });
      }
      if (existingUser[0].email === email) {
        return res.status(409).json({ message: "Email already exists" });
      }
    }

    // Get a transaction connection
    conn = await db.promise().getConnection();
    await conn.beginTransaction();

    await conn.query(`CALL create_account(?, ?, ?, ?)`, [
      user_name,
      email,
      hashedPassword,
      role,
    ]);

    const [userIdResult] = await conn.query(`SELECT LAST_INSERT_ID() AS user_id`);
    const userId = userIdResult[0].user_id;

    const accessToken = jwt.sign(
      { user_id: userId, email: email, role: role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
      { user_id: userId },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );

    const expiryInSeconds =
      parseInt(process.env.REFRESH_TOKEN_EXPIRY) * 24 * 60 * 60;
    const expiryDate = new Date(Date.now() + expiryInSeconds * 1000)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    await conn.query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)`,
      [userId, refreshToken, expiryDate]
    );

    await conn.commit();
    conn.release();

    res.status(201).json({
      message: "Account created successfully",
      token: accessToken,
      refreshToken: refreshToken,
    });
  } catch (error) {
    if (conn) {
      await conn.rollback();
      conn.release();
    }
    next(error);
  }
});

module.exports = Router;