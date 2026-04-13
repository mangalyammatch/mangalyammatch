const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Attempting to connect to Render PostgreSQL...');
    const userCount = await prisma.user.count();
    console.log('Successfully connected!');
    console.log('Current user count in cloud database:', userCount);
  } catch (err) {
    console.error('Database connection or schema error:', err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
