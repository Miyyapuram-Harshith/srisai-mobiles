import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qhkgoasyvbawugdsdhko.supabase.co/';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFoa2dvYXN5dmJhd3VnZHNkaGtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzNDEwNDcsImV4cCI6MjA5ODkxNzA0N30.hb8nDimWYrix3qTK1_NQWiHXLpZXeAVq_3Oo__OkZbs';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data, error } = await supabase.from('users').select('*').limit(1);
  console.log("User row:", data, error);
}

run();
