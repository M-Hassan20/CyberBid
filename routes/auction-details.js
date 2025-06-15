const Router = require('express').Router();
const db = require('../db');
const authenticate = require('../middleware/authenticate');
const decodeImageUrls = require('../middleware/decodeImageUrls')

Router.get('/', authenticate, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const category = req.query.category;
    const search = req.query.search;
    
    let query = `
      SELECT 
        a.*, ii.url, 
        COALESCE(
          (SELECT MAX(bid_amount) 
           FROM bids 
           WHERE auction_id = a.auction_id 
           AND bid_status = 'active'
          ),
          a.starting_price
        ) as current_price,
        (SELECT COUNT(*) FROM bids WHERE auction_id = a.auction_id) as bid_count
        FROM show_auctions a JOIN item_images ii ON a.item_id = ii.item_id
        WHERE 1=1
        `;
    
    const params = [];
    
    if (category) {
      query += ' AND category_name = ?';
      params.push(category);
    }
    
    if (search) {
      query += ' AND (auction_title LIKE ? OR title LIKE ? OR item_description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    query += ' ORDER BY end_datetime ASC LIMIT ? OFFSET ?';
    params.push(limit, offset);
  
    
    const [auctions] = await db.promise().query(query, params);
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM show_auctions WHERE 1=1';
    const countParams = [];
    
    if (category) {
      countQuery += ' AND category_name = ?';
      countParams.push(category);
    }
    
    if (search) {
      countQuery += ' AND (auction_title LIKE ? OR title LIKE ? OR item_description LIKE ?)';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }
    
    const [countResult] = await db.promise().query(countQuery, countParams);
    const totalCount = countResult[0].total;
    
    res.json({
      auctions_details: auctions,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

Router.get('/:auctionId', authenticate, async (req, res, next) => {
  try {
    const { auctionId } = req.params;
    
    if (!auctionId) {
      return res.status(400).json({ message: 'Auction ID is required' });
    }
    
    const [auctionDetails] = await db.promise().query(`
      SELECT 
        a.*,
        COALESCE(
          (SELECT MAX(bid_amount) 
           FROM bids 
           WHERE auction_id = a.auction_id 
           AND bid_status = 'active'
          ),
          a.starting_price
        ) as current_price,
        (SELECT COUNT(*) FROM bids WHERE auction_id = a.auction_id) as bid_count
      FROM show_auction_details a
      WHERE a.auction_id = ?
    `, [auctionId]);
    
    if (auctionDetails.length === 0) {
      return res.status(404).json({ message: 'Auction not found' });
    }
    
    const [bidHistory] = await db.promise().query(`
      SELECT 
        b.bid_id,
        b.bidder_id,
        u.user_name as bidder_name,
        b.bid_amount,
        b.bid_time,
        b.bid_status,
        b.is_auto_bid
      FROM bids b
      JOIN users u ON b.bidder_id = u.user_id
      WHERE b.auction_id = ?
      ORDER BY b.bid_amount DESC
    `, [auctionId]);
    
    res.json({
      auction: auctionDetails[0],
      bids: bidHistory
    });
  } catch (error) {
    next(error);
  }
});

Router.get('/:auctionId/bids', authenticate, async (req, res, next) => {
  try {
    const { auctionId } = req.params;
    
    const [auctionOwnership] = await db.promise().query(
      'SELECT i.seller_id FROM items i ' +
      'JOIN auctions a ON i.item_id = a.item_id ' +
      'WHERE a.auction_id = ?',
      [auctionId]
    );
    
    if (auctionOwnership.length === 0) {
      return res.status(404).json({ message: 'Auction not found' });
    }
    
    const isSeller = auctionOwnership[0].seller_id === req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    if (!isSeller && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view this page' });
    }
    
    const [bids] = await db.promise().query(
      `SELECT * FROM show_bids_details WHERE auction_id = ?`, [auctionId]
    );

    
    
    res.json({ bids });
  } catch (error) {
    next(error);
  }
});

module.exports = Router;