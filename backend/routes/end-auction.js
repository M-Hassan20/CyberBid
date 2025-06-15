const Router = require('express').Router();
const db = require('../db');
const authenticate = require('../middleware/authenticate');


Router.post('/:auctionId', authenticate, async (req, res, next) => {
  try {
    const { auctionId } = req.params;
    const { end_status, payment_method } = req.body;
    const userId = req.user.id;
    
    const [auctions] = await db.promise().query(
      'SELECT a.*, i.seller_id FROM auctions a ' +
      'JOIN items i ON a.item_id = i.item_id ' +
      'WHERE a.auction_id = ?',
      [auctionId]
    );
    
    if (auctions.length === 0) {
      return res.status(404).json({ message: 'Auction not found' });
    }
    
    const auction = auctions[0];
    
    if (auction.seller_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to end this auction' });
    }
    
    if (auction.auction_status !== 'active') {
      return res.status(400).json({ message: 'Only active auctions can be ended' });
    }
    const currentDate = new Date();
    await db.promise().query(
      'CALL END_AUCTION(?, ?, ?, ?)',
      [auctionId, end_status || 'ended', currentDate, payment_method]
    );
    

    const [updatedAuction] = await db.promise().query(
      'SELECT * FROM auctions WHERE auction_id = ?',
      [auctionId]
    );
    
    const [transactions] = await db.promise().query(
      'SELECT * FROM transactions WHERE auction_id = ? ORDER BY transaction_date DESC LIMIT 1',
      [auctionId]
    );
    
    res.json({
      message: 'Auction ended successfully',
      auction: updatedAuction[0],
      transaction: transactions.length > 0 ? transactions[0] : null
    });
  } catch (err) {
    if (err.sqlState) {
      switch (err.sqlState) {
        case '45005':
          return res.status(400).json({ message: 'Auction does not exist or is not active' });
        default:
          next(err);
      }
    } else {
      next(err);
    }
  }
});

Router.get('/:auctionId/status', async (req, res, next) => {
  try {
    const { auctionId } = req.params;
    
    const [auctions] = await db.promise().query(
      'SELECT auction_id, auction_status, end_datetime FROM auctions WHERE auction_id = ?',
      [auctionId]
    );
    
    if (auctions.length === 0) {
      return res.status(404).json({ message: 'Auction not found' });
    }
    
    res.json({
      status: auctions[0].auction_status,
      end_datetime: auctions[0].end_datetime
    });
  } catch (err) {
    next(err);
  }
});

module.exports = Router;