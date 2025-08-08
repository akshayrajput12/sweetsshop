#!/usr/bin/env node

/**
 * BukBox Setup Script
 * 
 * This script helps set up the BukBox project by:
 * 1. Checking for required environment variables
 * 2. Validating Supabase connection
 * 3. Providing setup guidance
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 BukBox Setup Script');
console.log('======================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found!');
  
  if (fs.existsSync(envExamplePath)) {
    console.log('📋 Copying .env.example to .env...');
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created from template');
    console.log('\n📝 Please update the .env file with your actual values:');
    console.log('   - VITE_SUPABASE_URL');
    console.log('   - VITE_SUPABASE_ANON_KEY');
    console.log('   - VITE_GOOGLE_MAPS_API_KEY');
    console.log('   - VITE_RAZORPAY_KEY_ID');
  } else {
    console.log('❌ .env.example file not found either!');
    process.exit(1);
  }
} else {
  console.log('✅ .env file found');
}

// Check supabase/.env file
const supabaseEnvPath = path.join(__dirname, 'supabase', '.env');
const supabaseEnvExamplePath = path.join(__dirname, 'supabase', '.env.example');

if (!fs.existsSync(supabaseEnvPath)) {
  console.log('❌ supabase/.env file not found!');
  
  if (fs.existsSync(supabaseEnvExamplePath)) {
    console.log('📋 Copying supabase/.env.example to supabase/.env...');
    fs.copyFileSync(supabaseEnvExamplePath, supabaseEnvPath);
    console.log('✅ supabase/.env file created from template');
    console.log('\n📝 Please update the supabase/.env file with your Razorpay secret key');
  }
} else {
  console.log('✅ supabase/.env file found');
}

// Read and validate environment variables
console.log('\n🔍 Checking environment variables...');

const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value && !key.startsWith('#')) {
    envVars[key.trim()] = value.trim();
  }
});

const requiredVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_GOOGLE_MAPS_API_KEY',
  'VITE_RAZORPAY_KEY_ID'
];

let missingVars = [];

requiredVars.forEach(varName => {
  if (!envVars[varName] || envVars[varName].includes('your_') || envVars[varName].includes('here')) {
    missingVars.push(varName);
    console.log(`❌ ${varName}: Not configured`);
  } else {
    console.log(`✅ ${varName}: Configured`);
  }
});

if (missingVars.length > 0) {
  console.log('\n⚠️  Missing required environment variables:');
  missingVars.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  console.log('\n📖 Please refer to BUKBOX_SETUP_GUIDE.md for detailed setup instructions');
} else {
  console.log('\n✅ All required environment variables are configured!');
}

// Check if migration file exists
const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20250208000000_bukbox_complete_migration.sql');

if (fs.existsSync(migrationPath)) {
  console.log('✅ Database migration file found');
  console.log('\n📋 Next steps:');
  console.log('   1. Run the migration in your Supabase SQL Editor');
  console.log('   2. Copy the content from:');
  console.log('      supabase/migrations/20250208000000_bukbox_complete_migration.sql');
  console.log('   3. Paste and execute in Supabase dashboard');
} else {
  console.log('❌ Database migration file not found!');
}

console.log('\n🎉 Setup check complete!');
console.log('\n📚 For detailed setup instructions, see: BUKBOX_SETUP_GUIDE.md');
console.log('🚀 To start development: npm run dev');

// Check package.json scripts
const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  console.log('\n📦 Available scripts:');
  Object.keys(packageJson.scripts || {}).forEach(script => {
    console.log(`   npm run ${script}`);
  });
}

console.log('\n' + '='.repeat(50));
console.log('BukBox - Bulk Shopping Platform');
console.log('Ready for bulk e-commerce! 🛒');
console.log('='.repeat(50));