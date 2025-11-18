const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Boost the Broadband API is running' });
});

// Get eligible customers for broadband upgrade
app.get('/api/customers/eligible', async (req, res) => {
  try {
    const { device_id, technology, min_usage, current_speed, exact_speed_match } = req.query;

    let query = `
      SELECT
        nte.child_device_id as olt,
        AVG(nte.link_utilization_percentage) as avg_link_utilization_percentage,
        SUM(nte.link_bandwidth_gbps) as total_link_bandwidth_gbps,
        MAX(nte.lag_type) as max_lag_type,
        c.customer_id,
        CONCAT(c.first_name, ' ', c.last_name) as name,
        c.address,
        c.phone,
        c.email,
        c.customer_id as account_id,
        c.avg_usage_percentage,
        c.avg_download_usage_mbps,
        c.current_download_mbps,
        c.olt_technology,
        MAX(os.max_utilization_pct) as max_utilization_pct,
        CASE
          WHEN MAX(os.max_utilization_pct) < CAST(c.avg_usage_percentage AS FLOAT)
          THEN MAX(os.notes)
          ELSE NULL
        END as capacity_notes
      FROM team_pulse_nest.network_topology_edges nte
      JOIN team_pulse_nest.customers c
        ON c.device_id = nte.child_device_id
      JOIN team_pulse_nest.oversubscription_standards os
        ON os.lag_type = nte.lag_type
      WHERE nte.link_status = 'Up'
        AND c.olt_technology IN ('XGS-PON', '25XGS-PON')
        AND CAST(c.avg_usage_percentage AS FLOAT) > 50
        AND c.account_status = 'Active'
    `;

    const queryParams = [];
    let paramIndex = 1;

    // Add device_id filter if provided
    if (device_id) {
      query += ` AND nte.child_device_id = $${paramIndex}`;
      queryParams.push(device_id);
      paramIndex++;
    }

    // Add technology filter if provided
    if (technology) {
      query += ` AND c.olt_technology = $${paramIndex}`;
      queryParams.push(technology);
      paramIndex++;
    }

    // Add minimum usage filter if provided
    if (min_usage) {
      query += ` AND CAST(c.avg_usage_percentage AS FLOAT) >= $${paramIndex}`;
      queryParams.push(parseFloat(min_usage));
      paramIndex++;
    }

    // Add current speed filter if provided
    if (current_speed) {
      const operator = exact_speed_match === 'true' ? '=' : '>=';
      query += ` AND c.current_download_mbps ${operator} $${paramIndex}`;
      queryParams.push(parseFloat(current_speed));
      paramIndex++;
    }

    query += `
      GROUP BY
        nte.child_device_id,
        c.customer_id,
        c.first_name,
        c.last_name,
        c.address,
        c.phone,
        c.email,
        c.avg_usage_percentage,
        c.avg_download_usage_mbps,
        c.current_download_mbps,
        c.olt_technology
      HAVING
        MAX(nte.lag_type) = MAX(os.lag_type)
        AND AVG(nte.link_utilization_percentage) <= MAX(os.max_utilization_pct)
      ORDER BY avg_link_utilization_percentage ASC, olt, c.avg_usage_percentage DESC
    `;

    const result = await pool.query(query, queryParams);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching eligible customers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching eligible customers',
      error: error.message,
    });
  }
});

// Get unique device IDs for filter dropdown
app.get('/api/devices', async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT nte.child_device_id as device_id
      FROM team_pulse_nest.network_topology_edges nte
      WHERE nte.link_status = 'Up'
      ORDER BY device_id
    `;

    const result = await pool.query(query);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching devices',
      error: error.message,
    });
  }
});

// Get technologies for filter dropdown
app.get('/api/technologies', async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT c.olt_technology as technology
      FROM team_pulse_nest.customers c
      WHERE c.olt_technology IN ('XGS-PON', '25XGS-PON')
      ORDER BY technology
    `;

    const result = await pool.query(query);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching technologies:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching technologies',
      error: error.message,
    });
  }
});

// Get network topology and statistics for a device
app.get('/api/network/topology/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    console.log('Fetching network topology for device:', deviceId);

    // Get all edges connected to this device
    const edgesQuery = `
      SELECT
        parent_device_id,
        child_device_id,
        link_status,
        link_utilization_percentage,
        link_bandwidth_gbps,
        lag_type
      FROM team_pulse_nest.network_topology_edges
      WHERE parent_device_id = $1 OR child_device_id = $1
    `;

    // Get summary statistics for this device
    const statsQuery = `
      SELECT
        child_device_id as device_id,
        COUNT(DISTINCT parent_device_id) as connected_parents,
        COUNT(*) as total_links,
        AVG(link_utilization_percentage) as avg_utilization,
        MAX(link_utilization_percentage) as max_utilization,
        SUM(link_bandwidth_gbps) as total_bandwidth,
        MAX(lag_type) as lag_type,
        COUNT(CASE WHEN link_status = 'Up' THEN 1 END) as links_up,
        COUNT(CASE WHEN link_status != 'Up' THEN 1 END) as links_down
      FROM team_pulse_nest.network_topology_edges
      WHERE child_device_id = $1
      GROUP BY child_device_id
    `;

    // Get customer count for this device
    const customerCountQuery = `
      SELECT COUNT(*) as customer_count
      FROM team_pulse_nest.customers
      WHERE device_id = $1
    `;

    const [edgesResult, statsResult, customerCountResult] = await Promise.all([
      pool.query(edgesQuery, [deviceId]),
      pool.query(statsQuery, [deviceId]),
      pool.query(customerCountQuery, [deviceId])
    ]);

    res.json({
      success: true,
      data: {
        edges: edgesResult.rows,
        statistics: statsResult.rows.length > 0 ? statsResult.rows[0] : null,
        customerCount: customerCountResult.rows[0]?.customer_count || 0
      }
    });
  } catch (error) {
    console.error('Error fetching network topology:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching network topology',
      error: error.message,
    });
  }
});

// Get customer details by account ID
app.get('/api/customers/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;
    console.log('Received request for customer with accountId:', accountId);

    const query = `
      SELECT *
      FROM team_pulse_nest.customers
      WHERE customer_id = $1
    `;

    const result = await pool.query(query, [accountId]);
    console.log('Query result row count:', result.rows.length);

    if (result.rows.length === 0) {
      console.log('Customer not found for accountId:', accountId);
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    console.log('Customer found:', result.rows[0].customer_id);
    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error fetching customer details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customer details',
      error: error.message,
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
