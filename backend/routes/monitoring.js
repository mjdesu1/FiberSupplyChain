const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

/**
 * Monitoring Routes
 * Purpose: Handle field monitoring and updates for crop growth, production, and farmer activity
 */

// =====================================================
// GET /api/monitoring - Get all monitoring records
// =====================================================
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      farmerId, 
      dateFrom, 
      dateTo, 
      farmCondition, 
      growthStage,
      monitoredBy,
      limit = 100,
      offset = 0
    } = req.query;

    let query = `
      SELECT 
        monitoring_id,
        date_of_visit,
        monitored_by,
        monitored_by_role,
        farmer_id,
        farmer_name,
        association_name,
        farm_location,
        farm_condition,
        growth_stage,
        issues_observed,
        other_issues,
        actions_taken,
        recommendations,
        next_monitoring_date,
        weather_condition,
        estimated_yield,
        remarks,
        photo_urls,
        created_at,
        updated_at
      FROM monitoring_records
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    // Apply filters
    if (farmerId) {
      query += ` AND farmer_id = $${paramCount}`;
      params.push(farmerId);
      paramCount++;
    }

    if (dateFrom) {
      query += ` AND date_of_visit >= $${paramCount}`;
      params.push(dateFrom);
      paramCount++;
    }

    if (dateTo) {
      query += ` AND date_of_visit <= $${paramCount}`;
      params.push(dateTo);
      paramCount++;
    }

    if (farmCondition) {
      query += ` AND farm_condition = $${paramCount}`;
      params.push(farmCondition);
      paramCount++;
    }

    if (growthStage) {
      query += ` AND growth_stage = $${paramCount}`;
      params.push(growthStage);
      paramCount++;
    }

    if (monitoredBy) {
      query += ` AND monitored_by ILIKE $${paramCount}`;
      params.push(`%${monitoredBy}%`);
      paramCount++;
    }

    // If user is a farmer, only show their records
    if (req.user.role === 'farmer') {
      query += ` AND farmer_id = $${paramCount}`;
      params.push(req.user.id);
      paramCount++;
    }

    query += ` ORDER BY date_of_visit DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching monitoring records:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch monitoring records',
      error: error.message
    });
  }
});

// =====================================================
// GET /api/monitoring/stats - Get monitoring statistics
// =====================================================
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM monitoring_statistics');
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching monitoring statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
});

// =====================================================
// GET /api/monitoring/farmer/:farmerId - Get farmer's monitoring records
// =====================================================
router.get('/farmer/:farmerId', authenticateToken, async (req, res) => {
  try {
    const { farmerId } = req.params;

    // Check if user has permission to view this farmer's records
    if (req.user.role === 'farmer' && req.user.id !== farmerId) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own monitoring records'
      });
    }

    const result = await pool.query(
      'SELECT * FROM get_farmer_monitoring_records($1)',
      [farmerId]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching farmer monitoring records:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch farmer monitoring records',
      error: error.message
    });
  }
});

// =====================================================
// GET /api/monitoring/:id - Get single monitoring record
// =====================================================
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM monitoring_records WHERE monitoring_id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Monitoring record not found'
      });
    }

    // Check if farmer can only view their own records
    if (req.user.role === 'farmer' && result.rows[0].farmer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own monitoring records'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching monitoring record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch monitoring record',
      error: error.message
    });
  }
});

// =====================================================
// POST /api/monitoring - Create new monitoring record
// =====================================================
router.post('/', authenticateToken, requireRole(['officer', 'super_admin']), async (req, res) => {
  try {
    const {
      monitoringId,
      dateOfVisit,
      monitoredBy,
      monitoredByRole,
      farmerId,
      farmerName,
      associationName,
      farmLocation,
      farmCondition,
      growthStage,
      issuesObserved,
      otherIssues,
      actionsTaken,
      recommendations,
      nextMonitoringDate,
      weatherCondition,
      estimatedYield,
      remarks,
      photoUrls
    } = req.body;

    // Validation
    if (!monitoringId || !dateOfVisit || !monitoredBy || !farmerId || !farmerName || 
        !farmCondition || !growthStage || !actionsTaken || !recommendations || !nextMonitoringDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Validate date logic
    if (new Date(nextMonitoringDate) <= new Date(dateOfVisit)) {
      return res.status(400).json({
        success: false,
        message: 'Next monitoring date must be after the visit date'
      });
    }

    const query = `
      INSERT INTO monitoring_records (
        monitoring_id, date_of_visit, monitored_by, monitored_by_role,
        farmer_id, farmer_name, association_name, farm_location,
        farm_condition, growth_stage, issues_observed, other_issues,
        actions_taken, recommendations, next_monitoring_date,
        weather_condition, estimated_yield, remarks, photo_urls,
        created_by, updated_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING *
    `;

    const values = [
      monitoringId,
      dateOfVisit,
      monitoredBy,
      monitoredByRole || null,
      farmerId,
      farmerName,
      associationName || null,
      farmLocation || null,
      farmCondition,
      growthStage,
      issuesObserved || [],
      otherIssues || null,
      actionsTaken,
      recommendations,
      nextMonitoringDate,
      weatherCondition || null,
      estimatedYield || null,
      remarks || null,
      photoUrls || [],
      req.user.id,
      req.user.id
    ];

    const result = await pool.query(query, values);

    res.status(201).json({
      success: true,
      message: 'Monitoring record created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating monitoring record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create monitoring record',
      error: error.message
    });
  }
});

// =====================================================
// PUT /api/monitoring/:id - Update monitoring record
// =====================================================
router.put('/:id', authenticateToken, requireRole(['officer', 'super_admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      dateOfVisit,
      monitoredBy,
      monitoredByRole,
      farmerId,
      farmerName,
      associationName,
      farmLocation,
      farmCondition,
      growthStage,
      issuesObserved,
      otherIssues,
      actionsTaken,
      recommendations,
      nextMonitoringDate,
      weatherCondition,
      estimatedYield,
      remarks,
      photoUrls
    } = req.body;

    // Check if record exists
    const checkResult = await pool.query(
      'SELECT * FROM monitoring_records WHERE monitoring_id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Monitoring record not found'
      });
    }

    // Validate date logic if both dates are provided
    if (dateOfVisit && nextMonitoringDate && new Date(nextMonitoringDate) <= new Date(dateOfVisit)) {
      return res.status(400).json({
        success: false,
        message: 'Next monitoring date must be after the visit date'
      });
    }

    const query = `
      UPDATE monitoring_records SET
        date_of_visit = COALESCE($1, date_of_visit),
        monitored_by = COALESCE($2, monitored_by),
        monitored_by_role = COALESCE($3, monitored_by_role),
        farmer_id = COALESCE($4, farmer_id),
        farmer_name = COALESCE($5, farmer_name),
        association_name = COALESCE($6, association_name),
        farm_location = COALESCE($7, farm_location),
        farm_condition = COALESCE($8, farm_condition),
        growth_stage = COALESCE($9, growth_stage),
        issues_observed = COALESCE($10, issues_observed),
        other_issues = COALESCE($11, other_issues),
        actions_taken = COALESCE($12, actions_taken),
        recommendations = COALESCE($13, recommendations),
        next_monitoring_date = COALESCE($14, next_monitoring_date),
        weather_condition = COALESCE($15, weather_condition),
        estimated_yield = COALESCE($16, estimated_yield),
        remarks = COALESCE($17, remarks),
        photo_urls = COALESCE($18, photo_urls),
        updated_by = $19
      WHERE monitoring_id = $20
      RETURNING *
    `;

    const values = [
      dateOfVisit,
      monitoredBy,
      monitoredByRole,
      farmerId,
      farmerName,
      associationName,
      farmLocation,
      farmCondition,
      growthStage,
      issuesObserved,
      otherIssues,
      actionsTaken,
      recommendations,
      nextMonitoringDate,
      weatherCondition,
      estimatedYield,
      remarks,
      photoUrls,
      req.user.id,
      id
    ];

    const result = await pool.query(query, values);

    res.json({
      success: true,
      message: 'Monitoring record updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating monitoring record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update monitoring record',
      error: error.message
    });
  }
});

// =====================================================
// DELETE /api/monitoring/:id - Delete monitoring record
// =====================================================
router.delete('/:id', authenticateToken, requireRole(['officer', 'super_admin']), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if record exists
    const checkResult = await pool.query(
      'SELECT * FROM monitoring_records WHERE monitoring_id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Monitoring record not found'
      });
    }

    // Update the record with updated_by before deletion (for history tracking)
    await pool.query(
      'UPDATE monitoring_records SET updated_by = $1 WHERE monitoring_id = $2',
      [req.user.id, id]
    );

    // Delete the record
    await pool.query('DELETE FROM monitoring_records WHERE monitoring_id = $1', [id]);

    res.json({
      success: true,
      message: 'Monitoring record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting monitoring record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete monitoring record',
      error: error.message
    });
  }
});

// =====================================================
// GET /api/monitoring/alerts/my - Get user's monitoring alerts
// =====================================================
router.get('/alerts/my', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT 
        a.alert_id,
        a.monitoring_id,
        a.alert_type,
        a.alert_message,
        a.severity,
        a.is_read,
        a.created_at,
        m.farmer_name,
        m.next_monitoring_date
      FROM monitoring_alerts a
      JOIN monitoring_records m ON a.monitoring_id = m.monitoring_id
      WHERE a.recipient_id = $1
      ORDER BY a.created_at DESC
      LIMIT 50
    `;

    const result = await pool.query(query, [req.user.id]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching monitoring alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alerts',
      error: error.message
    });
  }
});

// =====================================================
// PUT /api/monitoring/alerts/:alertId/read - Mark alert as read
// =====================================================
router.put('/alerts/:alertId/read', authenticateToken, async (req, res) => {
  try {
    const { alertId } = req.params;

    await pool.query(
      'UPDATE monitoring_alerts SET is_read = TRUE, read_at = CURRENT_TIMESTAMP WHERE alert_id = $1 AND recipient_id = $2',
      [alertId, req.user.id]
    );

    res.json({
      success: true,
      message: 'Alert marked as read'
    });
  } catch (error) {
    console.error('Error marking alert as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark alert as read',
      error: error.message
    });
  }
});

// =====================================================
// GET /api/monitoring/issues - Get all monitoring issues
// =====================================================
router.get('/issues/list', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM monitoring_issues WHERE is_active = TRUE ORDER BY issue_name'
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching monitoring issues:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch issues',
      error: error.message
    });
  }
});

module.exports = router;
