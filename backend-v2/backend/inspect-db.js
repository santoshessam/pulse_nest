const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: false,
});

async function inspectDatabase() {
  try {
    console.log('Connecting to database...\n');

    // Get columns from customers table
    const customersQuery = `
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'team_pulse_nest'
        AND table_name = 'customers'
      ORDER BY ordinal_position;
    `;

    console.log('=== CUSTOMERS TABLE COLUMNS ===');
    const customersResult = await pool.query(customersQuery);
    customersResult.rows.forEach(row => {
      console.log(`  ${row.column_name} (${row.data_type})`);
    });

    console.log('\n=== NETWORK_TOPOLOGY_EDGES TABLE COLUMNS ===');
    const edgesQuery = `
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'team_pulse_nest'
        AND table_name = 'network_topology_edges'
      ORDER BY ordinal_position;
    `;
    const edgesResult = await pool.query(edgesQuery);
    edgesResult.rows.forEach(row => {
      console.log(`  ${row.column_name} (${row.data_type})`);
    });

    console.log('\n=== SAMPLE DATA FROM CUSTOMERS ===');
    const sampleQuery = `
      SELECT * FROM team_pulse_nest.customers LIMIT 1;
    `;
    const sampleResult = await pool.query(sampleQuery);
    console.log(JSON.stringify(sampleResult.rows[0], null, 2));

    await pool.end();
    console.log('\nDone!');
  } catch (error) {
    console.error('Error inspecting database:', error);
    await pool.end();
    process.exit(1);
  }
}

inspectDatabase();
