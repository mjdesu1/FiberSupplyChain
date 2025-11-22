const { Client } = require('pg');

// Database connection configuration
const client = new Client({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'abaca_db',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

async function testConnection() {
  try {
    // Connect to database
    await client.connect();
    console.log('✓ Connected to database successfully');
    
    // Test if tables exist
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('association_seedling_distributions', 'farmer_seedling_distributions')
      ORDER BY table_name;
    `);
    
    if (result.rows.length === 2) {
      console.log('✓ Both association seedling tables exist');
      result.rows.forEach(row => {
        console.log(`  - ${row.table_name}`);
      });
    } else {
      console.log(`⚠ Only ${result.rows.length} of 2 required tables found:`);
      result.rows.forEach(row => {
        console.log(`  - ${row.table_name}`);
      });
    }
    
    // Close connection
    await client.end();
    console.log('✓ Database connection test completed');
  } catch (err) {
    console.error('✗ Error testing database connection:', err.message);
    try {
      await client.end();
    } catch (endErr) {
      // Ignore errors when closing connection
    }
  }
}

// Run the test
testConnection();