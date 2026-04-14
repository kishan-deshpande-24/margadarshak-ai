require('dotenv').config()
const { createClient } = require("@supabase/supabase-js")
const sql = require('../db')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function createFullUser() {
  try {
    console.log('Creating user in Supabase Auth...')
    
    const email = 'test@example.com'
    const password = 'Test123456'
    const name = 'Test User'
    
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailConfirm: true,
        data: { name }
      }
    })
    
    if (authError) {
      console.error('Auth error:', authError.message)
      // If user already exists, try to get existing user
      const { data: existingUser } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (existingUser?.user) {
        console.log('User already exists in auth')
        await createProfile(existingUser.user.id, name, email)
        return
      }
      throw authError
    }
    
    console.log('Auth user created successfully')
    await createProfile(authData.user.id, name, email)
    
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

async function createProfile(userId, name, email) {
  try {
    console.log('Creating profile...')
    
    await sql`
      INSERT INTO profiles (id, name, email)
      VALUES (${userId}, ${name}, ${email})
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        updated_at = NOW()
    `
    
    console.log('Profile created successfully!')
    console.log('Email:', email)
    console.log('Password: Test123456')
    console.log('\nYou can now sign in with these credentials.')
    
    process.exit(0)
  } catch (error) {
    console.error('Profile error:', error.message)
    process.exit(1)
  }
}

createFullUser()
