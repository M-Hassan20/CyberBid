const Router = require('express').Router();
const db = require('../db');
const authenticate = require('../middleware/authenticate');


Router.get('/dashboard', authenticate, async (req, res, next) => {
  try {
    const sellerId = req.user.id;
    
    const [summaryResult] = await db.promise().query(
      'CALL SELLER_DASHBOARD_SUMMARY(?)',
      [sellerId]
    );
    
    const dashboardSummary = summaryResult[0][0] || {};
    
    const activeAuctions = summaryResult[1] || [];
    
    const recentBids = summaryResult[2] || [];
    
    const pendingAuctions = summaryResult[3] || [];
    
    const draftAuctions = summaryResult[4] || [];
    
    const upcomingAuctions = summaryResult[5] || [];
    
    const endedAuctions = summaryResult[6] || [];
    
    res.status(200).json({
      success: true,
      data: {
        summary: dashboardSummary,
        activeAuctions,
        recentBids,
        pendingAuctions,
        draftAuctions,
        upcomingAuctions,
        endedAuctions
      }
    });
  } catch (error) {
    console.error('Error fetching seller dashboard:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
});

module.exports = Router;