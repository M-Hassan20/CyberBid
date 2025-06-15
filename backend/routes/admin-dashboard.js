const Router = require('express').Router();
const db = require('../db');
const authenticate = require('../middleware/authenticate');
const adminAuth = require('../middleware/adminAuth');


Router.get('/dashboard', authenticate, async (req, res, next) => {
  try {
    const [summaryResult] = await db.promise().query(
      'SELECT * FROM admin_dashboard_summary'
    );
    
    const dashboardSummary = summaryResult[0] || {};
    
    const [recentAuctions] = await db.promise().query(
      `SELECT 
        a.auction_id, a.auction_title, a.auction_status, a.start_datetime, a.end_datetime, 
        i.title AS item_title, u.user_name AS seller_name,
        (SELECT COUNT(*) FROM bids WHERE auction_id = a.auction_id) AS bid_count
      FROM auctions a
      JOIN items i ON a.item_id = i.item_id
      JOIN users u ON i.seller_id = u.user_id
      ORDER BY 
        CASE 
          WHEN a.auction_status = 'active' THEN 1
          WHEN a.auction_status = 'pending_approval' THEN 2
          ELSE 3
        END,
        a.created_at DESC
      LIMIT 5`
    );
    
    const [pendingApprovals] = await db.promise().query(
      'SELECT * FROM admin_pending_approvals LIMIT 5'
    );
    
    const [recentUsers] = await db.promise().query(
      `SELECT user_id, user_name, email, role, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 5`
    );
    
    const [recentTransactions] = await db.promise().query(
      `SELECT 
        t.transaction_id, t.amount, t.transaction_status,
        t.transaction_date, b.user_name AS buyer_name, s.user_name AS seller_name,
        a.auction_title
      FROM transactions t
      JOIN users b ON t.buyer_id = b.user_id
      JOIN users s ON t.seller_id = s.user_id
      LEFT JOIN auctions a ON t.auction_id = a.auction_id
      ORDER BY t.transaction_date DESC
      LIMIT 5`
    );
    
    res.status(200).json({
      success: true,
      data: {
        summary: dashboardSummary,
        recentAuctions,
        pendingApprovals,
        recentUsers,
        recentTransactions
      }
    });
  } catch (error) {
    console.error('Error fetching admin dashboard summary:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch dashboard summary',
      error: error.message
    });
  }
});

// Manage auctions with filters
Router.get('/auctions', authenticate, async (req, res, next) => {
  try {
    const { status, dateStart, dateEnd, limit = 10, offset = 0 } = req.query;
    
    // Call the stored procedure for auction management
    const [auctionResults] = await db.promise().query(
      'CALL ADMIN_AUCTIONS_MANAGEMENT(?, ?, ?, ?, ?)',
      [status || null, dateStart || null, dateEnd || null, parseInt(limit), parseInt(offset)]
    );
    
    const auctionStats = auctionResults[0][0] || {};
    const auctions = auctionResults[1] || [];
    
    res.status(200).json({
      success: true,
      data: {
        stats: auctionStats,
        auctions: auctions,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: auctionStats.total_auctions || 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching admin auctions:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch auction data',
      error: error.message
    });
  }
});

// Get auction approval requests
Router.get('/approval-requests', authenticate, adminAuth, async (req, res, next) => {
  try {
    const [pendingApprovals] = await db.promise().query(
      'SELECT * FROM admin_pending_approvals'
    );
    
    res.status(200).json({
      success: true,
      data: {
        pendingApprovals
      }
    });
  } catch (error) {
    console.error('Error fetching approval requests:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch approval requests',
      error: error.message
    });
  }
});

// Process auction approval
Router.post('/process-approval/:auctionId', authenticate, adminAuth, async (req, res, next) => {
  try {
    const { auctionId } = req.params;
    const { approvalStatus, comments } = req.body;
    const adminId = req.user.id;
    
    // Validate approval status
    if (!['approved', 'rejected', 'revision_requested'].includes(approvalStatus)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid approval status'
      });
    }
    
    const [result] = await db.promise().query(
      'CALL ADMIN_APPROVE_AUCTION(?, ?, ?, ?, @o_status, @o_message)',
      [parseInt(auctionId), adminId, approvalStatus, comments || null]
    );
    console.log(adminId);

    
    // Get output parameters
    const [outputParams] = await db.promise().query('SELECT @o_status AS status, @o_message AS message');
    const { status, message } = outputParams[0];
    
    if (status === 'error') {
      return res.status(400).json({
        success: false,
        message
      });
    }
    
    res.status(200).json({
      success: true,
      message,
      data: { 
        auctionId: parseInt(auctionId),
        approvalStatus,
        processedBy: adminId
      }
    });
  } catch (error) {
    console.error('Error processing approval:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process approval',
      error: error.message
    });
  }
});

// Get user management data
Router.get('/users', authenticate, adminAuth, async (req, res, next) => {
  try {
    const { search, role, sortBy = 'created_at', sortOrder = 'DESC', limit = 10, offset = 0 } = req.query;
    
    // Build query with search and filters
    let query = 'SELECT * FROM admin_user_management';
    const queryParams = [];
    
    const whereConditions = [];
    if (search) {
      whereConditions.push('(user_name LIKE ? OR email LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`);
    }
    
    if (role) {
      whereConditions.push('role = ?');
      queryParams.push(role);
    }
    
    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }
    
    // Add sorting and pagination
    query += ` ORDER BY ${sortBy} ${sortOrder === 'ASC' ? 'ASC' : 'DESC'}`;
    query += ' LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), parseInt(offset));
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM admin_user_management';
    if (whereConditions.length > 0) {
      countQuery += ' WHERE ' + whereConditions.join(' AND ');
    }
    
    // Execute queries
    const [users] = await db.promise().query(query, queryParams);
    const [countResult] = await db.promise().query(
      countQuery, 
      queryParams.slice(0, queryParams.length - 2) // Remove limit and offset
    );
    
    const total = countResult[0].total;
    
    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user management data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch user data',
      error: error.message
    });
  }
});

// Category management endpoints
Router.post('/categories', authenticate, adminAuth, async (req, res, next) => {
  try {
    const { categoryName, parentCategoryId } = req.body;
    
    // Call stored procedure to add category
    const [result] = await db.promise().query(
      'CALL ADMIN_ADD_CATEGORY(?, ?, @o_new_category_id)',
      [categoryName, parentCategoryId || null]
    );
    
    // Get the new category ID
    const [outputParams] = await db.promise().query('SELECT @o_new_category_id AS newCategoryId');
    const { newCategoryId } = outputParams[0];
    
    res.status(201).json({
      success: true,
      message: 'Category added successfully',
      data: { 
        categoryId: newCategoryId,
        categoryName,
        parentCategoryId: parentCategoryId || null
      }
    });
  } catch (error) {
    console.error('Error adding category:', error);
    res.status(500).json({ 
      success: false, 
      message: error.sqlMessage || 'Failed to add category',
      error: error.message
    });
  }
});

Router.put('/categories/:categoryId', authenticate, adminAuth, async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const { newName, newParentId } = req.body;
    
    await db.promise().query(
      'CALL ADMIN_UPDATE_CATEGORY(?, ?, ?)',
      [parseInt(categoryId), newName || null, newParentId || null]
    );
    
    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: { 
        categoryId: parseInt(categoryId),
        categoryName: newName,
        parentCategoryId: newParentId
      }
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ 
      success: false, 
      message: error.sqlMessage || 'Failed to update category',
      error: error.message
    });
  }
});

Router.delete('/categories/:categoryId', authenticate, adminAuth, async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const { reassignChildren } = req.query;
    
    await db.promise().query(
      'CALL ADMIN_DELETE_CATEGORY(?, ?)',
      [parseInt(categoryId), reassignChildren === 'true']
    );
    
    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ 
      success: false, 
      message: error.sqlMessage || 'Failed to delete category',
      error: error.message
    });
  }
});

Router.get('/categories', authenticate, adminAuth, async (req, res, next) => {
  try {
    const [categories] = await db.promise().query(
      `SELECT 
        c.category_id, c.category_name, c.parent_category_id,
        p.category_name as parent_category_name,
        (SELECT COUNT(*) FROM categories WHERE parent_category_id = c.category_id) as child_count,
        (SELECT COUNT(*) FROM items WHERE category_id = c.category_id) as item_count
      FROM categories c
      LEFT JOIN categories p ON c.parent_category_id = p.category_id
      ORDER BY c.parent_category_id IS NULL DESC, c.parent_category_id, c.category_name`
    );
    
    res.status(200).json({
      success: true,
      data: {
        categories
      }
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
});

module.exports = Router;