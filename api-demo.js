#!/usr/bin/env node

/**
 * Example script demonstrating API usage
 * This script shows how to interact with the Land Management API
 */

const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

async function demonstrateAPI() {
  console.log('🌍 Land Management API Demo\n');

  try {
    // 1. Create a new land record
    console.log('1️⃣ Creating a new land record...');
    const newLand = {
      ownerWallet: '0xABCDEF123456',
      coordinatesCID: 'QmExampleCoordinates123',
      documentCID: 'QmExampleDocument456',
      areaSqMeters: 5000,
      status: 'Provisional',
      history: ['Land registered on 2024-11-01']
    };

    const createResponse = await axios.post(`${API_BASE_URL}/api/lands`, newLand);
    console.log('✅ Created:', createResponse.data);
    const landId = createResponse.data._id;
    console.log();

    // 2. List all lands
    console.log('2️⃣ Fetching all lands...');
    const listResponse = await axios.get(`${API_BASE_URL}/api/lands`);
    console.log(`✅ Found ${listResponse.data.length} land record(s)`);
    console.log();

    // 3. Get single land by ID
    console.log('3️⃣ Fetching land by ID...');
    const getResponse = await axios.get(`${API_BASE_URL}/api/lands/${landId}`);
    console.log('✅ Retrieved:', getResponse.data);
    console.log();

    // 4. Update the land record
    console.log('4️⃣ Updating land status to Approved...');
    const updateData = {
      status: 'Approved',
      history: [
        'Land registered on 2024-11-01',
        'Approved by Tehsildar on 2024-11-02'
      ]
    };
    const updateResponse = await axios.put(`${API_BASE_URL}/api/lands/${landId}`, updateData);
    console.log('✅ Updated:', updateResponse.data);
    console.log();

    // 5. Delete the land record
    console.log('5️⃣ Deleting land record...');
    const deleteResponse = await axios.delete(`${API_BASE_URL}/api/lands/${landId}`);
    console.log('✅ Deleted:', deleteResponse.data.message);
    console.log();

    console.log('🎉 Demo completed successfully!');

  } catch (error) {
    if (error.response) {
      console.error('❌ API Error:', error.response.data);
    } else if (error.code === 'ECONNREFUSED') {
      console.error('❌ Error: Cannot connect to the API server.');
      console.error('   Make sure the server is running with: npm run server');
    } else {
      console.error('❌ Error:', error.message);
    }
    process.exit(1);
  }
}

// Run the demo
if (require.main === module) {
  demonstrateAPI();
}

module.exports = { demonstrateAPI };
