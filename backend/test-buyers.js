// Test script to check and add buyers
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function testBuyers() {
  console.log('🔍 Checking buyers in database...\n');

  // Check all buyers
  const { data: allBuyers, error: allError } = await supabase
    .from('buyers')
    .select('*');

  if (allError) {
    console.error('❌ Error fetching buyers:', allError);
    console.error('Error details:', JSON.stringify(allError, null, 2));
    return;
  }

  console.log(`📊 Total buyers in database: ${allBuyers?.length || 0}`);
  
  if (allBuyers && allBuyers.length > 0) {
    console.log('\n📋 Buyers list:');
    allBuyers.forEach((buyer, index) => {
      console.log(`\n${index + 1}. ${buyer.business_name}`);
      console.log(`   - ID: ${buyer.buyer_id}`);
      console.log(`   - Owner: ${buyer.owner_name}`);
      console.log(`   - Contact: ${buyer.contact_number}`);
      console.log(`   - Email: ${buyer.email}`);
      console.log(`   - Active: ${buyer.is_active}`);
      console.log(`   - Verified: ${buyer.is_verified}`);
      console.log(`   - Status: ${buyer.verification_status}`);
    });
  } else {
    console.log('\n⚠️  No buyers found in database!');
  }

  // Check verified buyers only
  const { data: verifiedBuyers, error: verifiedError } = await supabase
    .from('buyers')
    .select('*')
    .eq('is_active', true)
    .eq('is_verified', true);

  if (verifiedError) {
    console.error('❌ Error fetching verified buyers:', verifiedError);
  }

  console.log(`\n✅ Verified & Active buyers: ${verifiedBuyers?.length || 0}`);

  // If no verified buyers, let's add a test buyer
  if (!verifiedBuyers || verifiedBuyers.length === 0) {
    console.log('\n⚠️  No verified buyers found. Adding test buyer...');
    
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash('buyer123', 10);

    const { data: newBuyer, error: insertError } = await supabase
      .from('buyers')
      .insert({
        business_name: 'Test Buyer Company',
        owner_name: 'John Doe',
        business_address: '123 Business St, Davao City',
        contact_number: '+63 912 345 6789',
        email: 'testbuyer@example.com',
        password_hash: hashedPassword,
        is_active: true,
        is_verified: true,
        verification_status: 'verified',
        payment_terms: 'Cash on Delivery',
        buying_schedule: 'Monday to Friday, 8AM-5PM'
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error creating test buyer:', insertError);
    } else {
      console.log('✅ Test buyer created successfully!');
      console.log(`   - Business: ${newBuyer.business_name}`);
      console.log(`   - ID: ${newBuyer.buyer_id}`);
      console.log(`   - Email: ${newBuyer.email}`);
      console.log(`   - Password: buyer123`);
    }
  }

  console.log('\n✨ Done!');
}

testBuyers().catch(console.error);
