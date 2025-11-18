const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function populateContactPreference() {
  try {
    console.log('Connecting to database...');

    // Update contact_preference with random distribution
    const updateQuery = `
      UPDATE team_pulse_nest.customers
      SET contact_preference = CASE
          WHEN RANDOM() < 0.30 THEN 'phone'
          WHEN RANDOM() < 0.60 THEN 'email'
          ELSE 'text'
      END
      WHERE contact_preference IS NULL OR contact_preference = '';
    `;

    const result = await pool.query(updateQuery);
    console.log(`Updated ${result.rowCount} rows`);

    // Verify the distribution
    const verifyQuery = `
      SELECT
          contact_preference,
          COUNT(*) as count,
          ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
      FROM team_pulse_nest.customers
      WHERE contact_preference IS NOT NULL
      GROUP BY contact_preference
      ORDER BY contact_preference;
    `;

    const verifyResult = await pool.query(verifyQuery);
    console.log('\nContact Preference Distribution:');
    console.table(verifyResult.rows);

    await pool.end();
    console.log('\nDone!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

populateContactPreference();
