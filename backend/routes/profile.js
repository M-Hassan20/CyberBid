const express = require("express");
const Router = express.Router();
const db = require("../db");
const authenticate = require("../middleware/authenticate");
const error_logger = require("../middleware/error_logger");
Router.get("/profile", authenticate, async (req, res, next) => {
  const { id, email } = req.user;

  try {
    const userQuery = `SELECT * FROM view_profile WHERE user_id = ?`;
    const [user] = await db.promise().query(userQuery, [id]);
    if (user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const userData = user[0];
    if (userData.role === "buyer") {
      const biddingData = {
        total_bids: userData.total_bids_placed,
        auctions_won: userData.auctions_won,
        total_spent: userData.total_spent,
      };
      res.status(200).json({
        user_name: userData.user_name,
        email: userData.email,
        role: userData.role,
        phone: userData.phone,
        created_at: userData.created_at,
        biddingData: biddingData,
      });
    } else if (userData.role === "seller") {
      const sellingData = {
        total_items_listed: userData.total_items_listed,
        items_sold: userData.items_sold,
        total_auctions_created: userData.total_auctions_created,
        total_earned: userData.total_earned,
      };
      res.status(200).json({
        user_name: userData.user_name,
        email: userData.email,
        role: userData.role,
        phone: userData.phone,
        created_at: userData.created_at,
        sellingData: sellingData,
      });
    }
  } catch (error) {
    next(error);
  }
});

Router.put("/update-profile", authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { user_name, phone } = req.body;

    const updateQuery = `UPDATE users SET user_name = ?, phone = ? WHERE user_id = ?`;
    await db.promise().query(updateQuery, [user_name, phone, userId]);

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error details:", err.response?.data || err.message);
    setError(
      `Failed to load profile data. Error: ${err.response?.status} ${
        err.response?.data?.message || err.message
      }`
    );
    setLoading(false);
    next(error);
  }
});

module.exports = Router;
