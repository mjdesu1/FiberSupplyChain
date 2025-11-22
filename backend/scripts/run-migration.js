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

async function runMigration() {
  try {
    // Connect to database
    await client.connect();
    console.log('Connected to database');

    // Read the association seedling migration file
    const migrationPath = path.join(__dirname, '..', 'database', 'association_seedling_migration.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split the migration into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(`Executing ${statements.length} statements...`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim().length > 0) {
        try {
          await client.query(statement);
          console.log(`✓ Statement ${i + 1} executed successfully`);
        } catch (err) {
          // Skip notices and non-critical errors
          if (!err.message.includes('already exists') && !err.message.includes('RAISE NOTICE')) {
            console.warn(`⚠ Warning on statement ${i + 1}:`, err.message);
          }
        }
      }
    }
    
    console.log('Migration completed successfully!');
  } catch (err) {
    console.error('Error running migration:', err);
  } finally {
    await client.end();
  }
}

// Run the migration
runMigration();