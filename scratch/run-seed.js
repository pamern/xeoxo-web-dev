const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const sqlPath = path.join(__dirname, '../supabase/seed_test_reviews_and_orders.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  console.log('Executing SQL Seed script from:', sqlPath);
  
  // Execute raw query
  await prisma.$executeRawUnsafe(sql);
  console.log('SQL Seed script executed successfully!');
}

main()
  .catch((e) => {
    console.error('Error executing SQL seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
