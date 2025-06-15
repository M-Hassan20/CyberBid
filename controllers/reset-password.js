const Router = require("express").Router();
const db = require("../db");
const bcrypt = require("bcrypt");

Router.post("/:token", async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;
  
    const [resetRequest] = await db.promise().query(
      "SELECT * FROM password_resets WHERE reset_token = ? AND is_used = FALSE",
      [token]
    );
  
    if (!resetRequest.length) {
      return res.status(400).json({ msg: "Invalid or already used token" });
    }
  
    const now = new Date();
    if (new Date(resetRequest[0].reset_token_expiry) < now) {
      return res.status(400).json({ msg: "Token expired" });
    }
  
    const hashedPassword = bcrypt.hash(newPassword, 10);
    await db.promise().query("UPDATE users SET password_hash = ? WHERE email = ?", [hashedPassword, resetRequest[0].user_email]);
  
    await db.query("UPDATE password_resets SET is_used = TRUE WHERE reset_token = ?", [token]);
  
    res.json({ msg: "Password reset successful" });
  });

  module.exports = Router;