/**
 * Seeds the first admin account.
 * Run with: node utils/seedAdmin.js
 */
require('dotenv').config()
const mongoose = require('mongoose')
const User = require('../models/User')

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('Connected to MongoDB')

    const existingAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL })
    if (existingAdmin) {
      console.log('Admin account already exists:', existingAdmin.email)
      process.exit(0)
    }

    const admin = await User.create({
      firstName: 'TransBridge',
      lastName: 'Admin',
      email: process.env.ADMIN_EMAIL,
      phone: process.env.ADMIN_PHONE,
      country: 'United Kingdom',
      password: process.env.ADMIN_PASSWORD,
      role: 'admin',
      isVerified: true,
      isActive: true,
    })

    console.log('✅ Admin account created successfully:')
    console.log(`   Email: ${admin.email}`)
    console.log(`   Phone: ${admin.phone}`)
    console.log('   Please change the password after first login.')

    process.exit(0)
  } catch (err) {
    console.error('Error seeding admin:', err.message)
    process.exit(1)
  }
}

seedAdmin()
