require('dotenv').config()
const sql = require('../db')

async function setupDatabase() {
  try {
    console.log('Creating profiles table...')
    
    await sql`
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `
    
    console.log('Profiles table created successfully')
    
    // Create a function to update updated_at timestamp
    await sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `
    
    // Add trigger to update updated_at
    await sql`
      DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles
    `
    
    await sql`
      CREATE TRIGGER update_profiles_updated_at
        BEFORE UPDATE ON profiles
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `
    
    console.log('Database setup completed successfully')
    process.exit(0)
  } catch (error) {
    console.error('Error setting up database:', error)
    process.exit(1)
  }
}

setupDatabase()
