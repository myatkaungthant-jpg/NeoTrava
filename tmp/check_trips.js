const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://beoqkvfymqhsavbebbcb.supabase.co';
const supabaseKey = 'sb_publishable_uT5cTLN_rRDpys9dDUUxCg_bkrCgsPVy';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTrips() {
  const { data, error } = await supabase.from('trips').select('*');
  if (error) {
    console.error('Error fetching trips:', error);
    return;
  }
  console.log('Total trips found:', data.length);
  if (data.length > 0) {
    console.log('Sample user_id with trips:', data[0].user_id);
    console.log('Sample trip_id:', data[0].id);
  }
}

checkTrips();
