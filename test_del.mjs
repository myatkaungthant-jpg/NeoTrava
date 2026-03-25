import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = Object.fromEntries(envFile.split('\n').map(line => line.split('=')));

const supabase = createClient(env.VITE_SUPABASE_URL.trim(), env.VITE_SUPABASE_ANON_KEY.trim());

async function run() {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin47@gmail.com',
    password: 'admin47'
  });
  
  if (authError) return console.log('Auth error:', authError);
  
  const {data, error} = await supabase.from('trips').select('id, title').limit(1);
  if (error) return console.log('Select error:', error);
  if (!data || data.length === 0) return console.log('no trips');
  
  console.log('Trying to delete trip:', data[0].title, '(', data[0].id, ')');
  const {error: err} = await supabase.from('trips').delete().eq('id', data[0].id);
  console.log('Delete error:', err);
}
run();
