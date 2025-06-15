const Router = require("express").Router();
const db = require("../db.js");
const authenticate = require("../middleware/authenticate.js");
// const decodeImageUrls = require('../middleware/decodeImageUrls.js');
const cloudinary = require("../utils/cloudinary.js");

Router.post("/create", authenticate, async (req, res, next) => {
  try {
    const {
      item_title,
      item_description,
      item_condition,
      item_brand,
      item_model,
      category_name,
      image_urls,
      auction_title,
      auction_description,
      starting_price,
      auction_duration,
      start_datetime,
      auction_status
    } = req.body;

    const seller_id = req.user.id;

    if (req.user.role !== "seller" && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only sellers can create auctions" });
    }

    if (
      !item_title ||
      !starting_price ||
      !auction_duration ||
      !category_name ||
      !image_urls
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (starting_price <= 0) {
      return res
        .status(400)
        .json({ message: "Starting price must be greater than zero" });
    }

    if (auction_duration <= 0 || auction_duration > 168) {

      return res
        .status(400)
        .json({ message: "Auction duration must be between 1 and 168 hours" });
    }

    const imageUrlsJson = [];

    for (const [index, img] of image_urls.entries()) {
      try {
        let imageToUpload = img;
        if (typeof img === "string") {
          imageToUpload = img;
        } else if (img.url) {
          imageToUpload = img.url;
        } else {
          throw new Error(`Invalid image format at index ${index}`);
        }

        const uploadResult = await cloudinary.uploader.upload(img.url, {
          folder: "cyberbid/items",
          public_id: `item_${Date.now()}_${index}`,
          overwrite: true,
          resource_type: "auto",
        });
        imageUrlsJson.push({
          url: uploadResult.secure_url,
          is_featured: img.is_featured || false,
          display_order: img.display_order ?? index,
        });
      } catch (uploadError) {
        console.error(`Error uploading image at index ${index}:`, uploadError);
        return res
          .status(400)
          .json({
            messsage: `Failed to upload image at index ${index + 1}`,
            error: uploadError.message,
          });
      }
    }

    const imageUrlsJsonString = JSON.stringify(
      imageUrlsJson.map((img) => img.url)
    );

    const [result] = await db
      .promise()
      .query(
        "CALL CREATE_AUCTION(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @auction_id)",
        [
          item_title,
          item_description || null,
          seller_id,
          item_condition || "new",
          item_brand || null,
          item_model || null,
          "available",
          category_name,
          imageUrlsJsonString,
          auction_title || item_title,
          auction_description || item_description,
          starting_price,
          auction_duration,
          start_datetime || null,
          "draft",
          auction_status,
        ]
      );

    const [outParams] = await db
      .promise()
      .query("SELECT @auction_id as auction_id");
    const auction_id = outParams[0].auction_id;

    for (const [index, imgData] of imageUrlsJson.entries()) {
      await db.promise().query(
        'UPDATE item_images SET is_featured = ?, display_order = ? WHERE item_id = (SELECT item_id FROM auctions WHERE auction_id = ?) AND url = ?',
        [imgData.is_featured, imgData.display_order, auction_id, imgData.url]
      );
    }

    await db.promise().query(
      'UPDATE item_images SET is_featured = TRUE WHERE item_id = (SELECT item_id FROM auctions WHERE auction_id = ?) AND is_featured = FALSE ORDER BY display_order ASC LIMIT 1',
      [auction_id]
    );
    if (!auction_status) {
      const submitAuctionQuery = `CALL SUBMIT_AUCTION_FOR_APPROVAL(?, ?, @o_status, @o_message)`;
      const [submitResult] = await db
        .promise()
        .query(submitAuctionQuery, [auction_id, seller_id]);
      const [submitOutParams] = await db
        .promise()
        .query("SELECT @o_status as auction_status, @o_message as message");

      res.status(201).json({
        message: "Auction submitted for approval",
        auction_id,
        images_uploaded: imageUrlsJson.length
      });
    }
  } catch (err) {
    if (err.sqlState) {
      switch (err.sqlState) {
        case "45001":
          return res
            .status(400)
            .json({ message: "Required fields cannot be null" });
        case "45002":
          return res.status(400).json({ message: "Category does not exist" });
        case "45003":
          return res.status(400).json({
            message:
              "Item does not exist or you are not authorized to auction it",
          });
        case "45004":
          return res
            .status(400)
            .json({ message: "Item is already being auctioned" });
        case "45011":
          return res
            .status(400)
            .json({ message: "Required item fields cannot be null" });
        case "45012":
          return res
            .status(403)
            .json({ message: "You are not authorized to create an item" });
        case "45013":
          return res
            .status(400)
            .json({ message: "At least one image is required to add an item" });
        default:
          next(err);
      }
    } else {
      next(err);
    }
  }
});

Router.get("/create/categories", async (req, res, next) => {
  try {
    const [categories] = await db
      .promise()
      .query(
        "SELECT category_id, parent_category_id, category_name FROM categories"
      );

    res.json({ categories });
  } catch (error) {
    next(error);
  }
});

Router.get("/create/fetch", authenticate, async (req, res, next) => {
  try {
    const sellerId = req.user.id;
    const status = req.query.status; // e.g., ?status=active

    if (req.user.role !== "seller" && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only sellers can view their auctions" });
    }

    let query = `
      SELECT 
        a.auction_id,
        a.auction_title,
        a.auction_description,
        a.starting_price,
        a.start_datetime,
        a.end_datetime,
        a.auction_status,
        (SELECT ii.url FROM item_images ii 
         WHERE ii.item_id = i.item_id AND ii.is_featured = TRUE 
         ORDER BY ii.display_order ASC LIMIT 1) AS primary_image_url
      FROM auctions a
      JOIN items i ON a.item_id = i.item_id
      WHERE i.seller_id = ?
    `;

    const params = [sellerId];

    if (status) {
      query += " AND a.auction_status = ?";
      params.push(status);
    }

    const [auctions] = await db.promise().query(query, params);

    res.json({ auctions });
  } catch (err) {
    next(err);
  }
});

module.exports = Router;
