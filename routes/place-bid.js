const Router = require('express').Router();
const db = require('../db');
const authenticate = require('../middleware/authenticate');

Router.post('/:auctionId/bid', authenticate, async (req, res, next) => {
  try {
    const { auctionId } = req.params;
    const { bidAmount } = req.body;
    const bidderId = req.user.id;
    
    if (!auctionId || !bidAmount) {
      return res.status(400).json({ message: 'Auction ID and bid amount are required' });
    }
    
    // Call the stored procedure to place the bid
    const [result] = await db.promise().query(
      'CALL PLACE_BID(?, ?, ?, @status, @message)',
      [auctionId, bidderId, bidAmount]
    );
    
    // Get the output parameters
    const [outputParams] = await db.promise().query('SELECT @status as status, @message as message');
    
    if (outputParams[0].status === 'Success') {
      // Get the updated bid information
      const [bidDetails] = await db.promise().query(`
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
        WHERE b.auction_id = ? AND b.bidder_id = ?
        ORDER BY b.bid_time DESC
        LIMIT 1
      `, [auctionId, bidderId]);

      // Get the current highest bid for the auction using the procedure
      await db.promise().query('CALL GET_CURRENT_PRICE(?, @current_price)', [auctionId]);
      const [[{ o_current_price }]] = await db.promise().query('SELECT @current_price as current_price');

      // Get the minimum next bid amount using the procedure
      await db.promise().query('CALL GET_MIN_BID(?, @min_bid)', [auctionId]);
      const [[{ o_min_bid }]] = await db.promise().query('SELECT @min_bid as minBid');
      console.log(o_current_price);
      res.status(200).json({
        status: 'Success',
        message: outputParams[0].message || 'Bid placed successfully',
        bid: bidDetails[0] || null,
        current_price: Number(o_current_price),
        minBid: Number(o_min_bid)
      });
    } else {
      res.status(400).json({
        status: 'Error',
        message: outputParams[0].message || 'Failed to place bid'
      });
    }
  } catch (error) {
    if (error.sqlState) {
      return res.status(400).json({ 
        status: 'Error', 
        message: error.message.replace('An error occurred while placing the bid: ', '')
      });
    }
    next(error);
  }
});

module.exports = Router;