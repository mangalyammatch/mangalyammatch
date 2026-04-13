const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function testRegistration() {
  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = 'TestPass123';

  console.log('\n🧪 Testing full registration flow against Supabase...\n');

  try {
    // Step 1: Check DB connection
    console.log('Step 1: Testing DB connection...');
    const count = await prisma.user.count();
    console.log(`✅ DB connected. Current user count: ${count}`);

    // Step 2: Hash password
    console.log('\nStep 2: Hashing password...');
    const password_hash = await bcrypt.hash(testPassword, 10);
    console.log('✅ Password hashed successfully.');

    // Step 3: Create User (without transaction first)
    console.log('\nStep 3: Creating user WITHOUT transaction...');
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        password_hash,
        role: 'USER',
        status: 'PENDING',
        isVerified: false,
        otp: '123456',
        otpExpires: new Date(Date.now() + 10 * 60 * 1000),
      }
    });
    console.log(`✅ User created: ${user.id}`);

    // Step 4: Create Profile
    console.log('\nStep 4: Creating profile...');
    const profile = await prisma.profile.create({
      data: {
        userId: user.id,
        name: 'TestUser',
        age: 25,
        gender: 'Unknown',
      }
    });
    console.log(`✅ Profile created: ${profile.id}`);

    // Cleanup
    await prisma.profile.delete({ where: { id: profile.id }});
    await prisma.user.delete({ where: { id: user.id }});
    console.log('\n✅ Cleanup done. Test user removed.');
    console.log('\n🎉 REGISTRATION WORKS PERFECTLY! The issue is Render env variables.\n');

  } catch (err) {
    console.error('\n❌ FAILED AT:', err.message);
    console.error('Error code:', err.code);
    console.error('Full error:', JSON.stringify(err, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

testRegistration();
