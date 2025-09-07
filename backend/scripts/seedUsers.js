/**
 * Seed script to create demo users
 * Run with: node scripts/seedUsers.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/db');

const seedUsers = async () => {
  try {
    // Connect to database
    await connectDB();

    // Clear existing users (optional - comment out to keep existing users)
    console.log('🧹 Clearing existing demo users to ensure fresh credentials...');
    await User.deleteMany({
      $or: [
        { email: { $in: ['demo@veriscope.com', 'test@veriscope.com', 'john@example.com', 'jane@example.com'] } },
        { username: { $in: ['demo', 'testuser', 'john_doe', 'jane_smith'] } }
      ]
    });
    
    // Demo users to create
    const users = [
      {
        username: 'demo',
        email: 'demo@veriscope.com',
        password: 'demo123'
      },
      {
        username: 'testuser',
        email: 'test@veriscope.com', 
        password: 'test123'
      },
      {
        username: 'john_doe',
        email: 'john@example.com',
        password: 'password123'
      },
      {
        username: 'jane_smith',
        email: 'jane@example.com',
        password: 'password123'
      }
    ];

    console.log('🌱 Seeding users...');
    
    // Create users (only if they don't exist)
    for (const userData of users) {
      const existingUser = await User.findOne({
        $or: [{ email: userData.email }, { username: userData.username }]
      });

      if (!existingUser) {
        await User.create(userData);
        console.log(`✅ Created user: ${userData.username} (${userData.email})`);
      } else {
        console.log(`⚠️  User already exists: ${userData.username} (${userData.email})`);
      }
    }

    console.log('🎉 User seeding completed!');
    console.log('\n📝 Demo Accounts:');
    console.log('1. Username: demo, Email: demo@veriscope.com, Password: demo123');
    console.log('2. Username: testuser, Email: test@veriscope.com, Password: test123');
    console.log('3. Username: john_doe, Email: john@example.com, Password: password123');
    console.log('4. Username: jane_smith, Email: jane@example.com, Password: password123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  }
};

// Run the seeding
seedUsers();