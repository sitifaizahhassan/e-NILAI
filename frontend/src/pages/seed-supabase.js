const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedUsers() {
  const testUsers = [
    { email: 'admin@test.com', password: 'Admin@123', role: 'admin' },
    { email: 'teacher@test.com', password: 'Teacher@123', role: 'teacher' },
    { email: 'student@test.com', password: 'Student@123', role: 'student' }
  ];

  for (const user of testUsers) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true
    });

    if (error) {
      console.log(`Error creating ${user.email}:`, error.message);
    } else {
      console.log(`Created user: ${user.email}`);
    }
  }
}

seedUsers().catch(console.error);