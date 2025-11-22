// Test the buyers API endpoint
const fetch = require('node-fetch');

async function testBuyersAPI() {
  console.log('🧪 Testing /api/buyers/all endpoint...\n');

  try {
    const response = await fetch('http://localhost:3001/api/buyers/all', {
      headers: {
        'Authorization': 'Bearer test-token' // We'll test without auth first
      }
    });

    console.log('📡 Response Status:', response.status);
    console.log('📡 Response Status Text:', response.statusText);
    
    const data = await response.json();
    console.log('\n📦 Response Data:');
    console.log(JSON.stringify(data, null, 2));

    if (data.buyers) {
      console.log(`\n✅ Found ${data.buyers.length} buyer(s)`);
      data.buyers.forEach((buyer, i) => {
        console.log(`\n${i + 1}. ${buyer.business_name}`);
        console.log(`   Contact: ${buyer.contact_number}`);
      });
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️  Backend server is not running!');
      console.error('   Start it with: cd backend && npm start');
    }
  }
}

testBuyersAPI();
