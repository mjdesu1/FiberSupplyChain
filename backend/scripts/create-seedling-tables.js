const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection configuration
const client = new Client({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'abaca_db',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

async function createSeedlingTables() {
  try {
    // Connect to database
    await client.connect();
    console.log('Connected to database');

    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'database', 'create_seedling_tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL
    await client.query(sql);
    
    console.log('✓ Association seedling tables created successfully!');
  } catch (err) {
    console.error('✗ Error creating seedling tables:', err.message);
  } finally {
    await client.end();
  }
}

// Run the function
createSeedlingTables();