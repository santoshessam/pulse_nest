const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function debugCustomer() {
  try {
    console.log('Checking customer 100000989...\n');

    // Get customer details
    const query = `
      SELECT
        customer_id,
        first_name,
        last_name,
        last_promo_offer_date,
        last_upgrade_date,
        CURRENT_DATE as today,
        CURRENT_DATE - INTERVAL '7 days' as seven_days_ago,
        CASE
          WHEN last_promo_offer_date >= CURRENT_DATE - INTERVAL '7 days'
          THEN 'YES - Within 7 days'
          ELSE 'NO - Older than 7 days'
        END as within_7_days
      FROM team_pulse_nest.customers
      WHERE customer_id = '100000989'
    `;

    const result = await pool.query(query);

    if (result.rows.length > 0) {
      console.log('Customer found:');
      console.table(result.rows);
    } else {
      console.log('Customer not found!');
    }

    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

debugCustomer();
