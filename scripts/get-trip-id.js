// Simple script to get the Thailand 2026 trip ID
// Run with: node scripts/get-trip-id.js

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase environment variables');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function getTripId() {
  const { data, error } = await supabase
    .from('trips')
    .select('id, name')
    .eq('name', 'Thailand 2026')
    .single();

  if (error) {
    console.error('Error fetching trip:', error);
    process.exit(1);
  }

  if (!data) {
    console.log('No trip found with name "Thailand 2026"');
    console.log('Make sure you have run the seed script');
    process.exit(1);
  }

  console.log('\n✅ Found trip:');
  console.log(`   Name: ${data.name}`);
  console.log(`   ID: ${data.id}\n`);
}

getTripId();

