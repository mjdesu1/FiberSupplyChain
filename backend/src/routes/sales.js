const express = require('express');
const { Pool } = require('pg');
const router = express.Router();

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'abaca_db',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

// Submit sales report (Farmer)
router.post('/submit-report', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { farmer_id, report_month, transactions, notes } = req.body;
    
    // Calculate totals
    const total_revenue = transactions.reduce((sum, t) => sum + parseFloat(t.totalAmount), 0);
    const total_quantity = transactions.reduce((sum, t) => sum + parseFloat(t.quantity), 0);
    const transaction_count = transactions.length;
    
    // Insert sales report
    const reportResult = await client.query(`
      INSERT INTO sales_reports (farmer_id, report_month, total_revenue, total_quantity, transaction_count, notes, status, submitted_at)
      VALUES ($1, $2, $3, $4, $5, $6, 'pending', NOW())
      RETURNING report_id
    `, [farmer_id, report_month, total_revenue, total_quantity, transaction_count, notes]);
    
    const report_id = reportResult.rows[0].report_id;
    
    // Insert transactions
    for (const transaction of transactions) {
      await client.query(`
        INSERT INTO sales_transactions (report_id, buyer_name, fiber_grade, quantity, price_per_kg, total_amount, sale_date, payment_method)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        report_id,
        transaction.buyerName || 'Not specified',
        'T1', // Default grade since we simplified
        transaction.quantity,
        transaction.pricePerKg,
        transaction.totalAmount,
        transaction.saleDate,
        'cash' // Default payment method
      ]);
    }
    
    await client.query('COMMIT');
    
    res.json({
      success: true,
      message: 'Sales report submitted successfully',
      report_id: report_id
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error submitting sales report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit sales report',
      error: error.message
    });
  } finally {
    client.release();
  }
});

// Get all sales reports (Admin/SuperAdmin)
router.get('/reports', async (req, res) => {
  try {
    const { status, period } = req.query;
    
    let query = `
      SELECT 
        sr.report_id,
        sr.farmer_id,
        f.full_name as farmer_name,
        sr.report_month,
        sr.total_revenue,
        sr.total_quantity,
        sr.transaction_count,
        sr.notes,
        sr.status,
        sr.submitted_at,
        sr.reviewed_at,
        sr.reviewed_by,
        o.full_name as reviewed_by_name
      FROM sales_reports sr
      JOIN farmers f ON sr.farmer_id = f.farmer_id
      LEFT JOIN organization o ON sr.reviewed_by = o.officer_id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;
    
    if (status) {
      paramCount++;
      query += ` AND sr.status = $${paramCount}`;
      params.push(status);
    }
    
    if (period) {
      paramCount++;
      const currentDate = new Date();
      let dateFilter;
      
      switch (period) {
        case 'current_month':
          dateFilter = currentDate.toISOString().slice(0, 7); // YYYY-MM
          break;
        case 'last_month':
          const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
          dateFilter = lastMonth.toISOString().slice(0, 7);
          break;
        default:
          dateFilter = currentDate.toISOString().slice(0, 7);
      }
      
      query += ` AND sr.report_month = $${paramCount}`;
      params.push(dateFilter);
    }
    
    query += ` ORDER BY sr.submitted_at DESC`;
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      reports: result.rows
    });
    
  } catch (error) {
    console.error('Error fetching sales reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sales reports',
      error: error.message
    });
  }
});

// Get sales analytics (Admin/SuperAdmin)
router.get('/analytics', async (req, res) => {
  try {
    const { period } = req.query;
    
    // Get basic analytics
    const analyticsQuery = `
      SELECT 
        COUNT(DISTINCT sr.farmer_id) as total_farmers,
        COALESCE(SUM(sr.total_revenue), 0) as total_revenue,
        COALESCE(SUM(sr.total_quantity), 0) as total_quantity,
        COALESCE(SUM(sr.transaction_count), 0) as total_transactions,
        COALESCE(AVG(sr.total_revenue), 0) as average_revenue_per_farmer
      FROM sales_reports sr
      WHERE sr.status = 'approved'
    `;
    
    const analyticsResult = await pool.query(analyticsQuery);
    const analytics = analyticsResult.rows[0];
    
    // Get top performing farmer
    const topFarmerQuery = `
      SELECT f.full_name
      FROM sales_reports sr
      JOIN farmers f ON sr.farmer_id = f.farmer_id
      WHERE sr.status = 'approved'
      GROUP BY f.farmer_id, f.full_name
      ORDER BY SUM(sr.total_revenue) DESC
      LIMIT 1
    `;
    
    const topFarmerResult = await pool.query(topFarmerQuery);
    const topFarmer = topFarmerResult.rows[0]?.full_name || 'No data';
    
    res.json({
      success: true,
      analytics: {
        totalFarmers: parseInt(analytics.total_farmers) || 0,
        totalRevenue: parseFloat(analytics.total_revenue) || 0,
        totalQuantity: parseFloat(analytics.total_quantity) || 0,
        totalTransactions: parseInt(analytics.total_transactions) || 0,
        averageRevenuePerFarmer: parseFloat(analytics.average_revenue_per_farmer) || 0,
        topPerformingFarmer: topFarmer,
        mostPopularGrade: 'T1', // Default since we simplified
        monthlyGrowth: 0 // Can be calculated later
      }
    });
    
  } catch (error) {
    console.error('Error fetching sales analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sales analytics',
      error: error.message
    });
  }
});

// Get farmer performance data (Admin/SuperAdmin)
router.get('/farmers-performance', async (req, res) => {
  try {
    const query = `
      SELECT 
        f.farmer_id,
        f.full_name as farmer_name,
        COUNT(DISTINCT sr.report_id) as total_reports,
        COALESCE(SUM(sr.total_revenue), 0) as total_revenue,
        COALESCE(SUM(sr.total_quantity), 0) as total_quantity,
        COALESCE(SUM(sr.transaction_count), 0) as total_transactions,
        COALESCE(AVG(st.price_per_kg), 0) as average_price,
        MAX(sr.submitted_at) as last_report_date,
        'T1' as top_grade
      FROM farmers f
      LEFT JOIN sales_reports sr ON f.farmer_id = sr.farmer_id AND sr.status = 'approved'
      LEFT JOIN sales_transactions st ON sr.report_id = st.report_id
      GROUP BY f.farmer_id, f.full_name
      HAVING COUNT(DISTINCT sr.report_id) > 0
      ORDER BY total_revenue DESC
    `;
    
    const result = await pool.query(query);
    
    res.json({
      success: true,
      farmers: result.rows
    });
    
  } catch (error) {
    console.error('Error fetching farmer performance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch farmer performance',
      error: error.message
    });
  }
});

// Approve/Reject sales report (Admin/SuperAdmin)
router.put('/reports/:reportId/status', async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status, reviewed_by, rejection_reason } = req.body;
    
    const query = `
      UPDATE sales_reports 
      SET status = $1, reviewed_by = $2, reviewed_at = NOW(), rejection_reason = $3
      WHERE report_id = $4
      RETURNING *
    `;
    
    const result = await pool.query(query, [status, reviewed_by, rejection_reason || null, reportId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Sales report not found'
      });
    }
    
    res.json({
      success: true,
      message: `Sales report ${status} successfully`,
      report: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error updating report status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update report status',
      error: error.message
    });
  }
});

module.exports = router;
