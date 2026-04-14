require('dotenv').config()
const sql = require('../db')

async function addTempUser() {
  try {
    console.log('Adding temporary user...')
    
    // You can change these values
    const tempUser = {
      id: '00000000-0000-0000-0000-000000000001', // Fixed UUID for testing
      name: 'Test User',
      email: 'test@example.com'
    }
    
    await sql`
      INSERT INTO profiles (id, name, email)
      VALUES (${tempUser.id}, ${tempUser.name}, ${tempUser.email})
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        updated_at = NOW()
    `
    
    console.log('Temporary user added successfully!')
    console.log('Email:', tempUser.email)
    console.log('Password: You\'ll need to create this in Supabase Auth dashboard')
    console.log('Or use the Supabase Auth API to create the auth user')
    
    process.exit(0)
  } catch (error) {
    console.error('Error adding temp user:', error)
    process.exit(1)
  }
}

addTempUser()
