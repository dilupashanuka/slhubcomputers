import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Connecting to database...');
  try {
    const result = await prisma.blockedIP.deleteMany();
    console.log(`Successfully deleted ${result.count} blocked IPs.`);
  } catch (error) {
    console.error('Error deleting blocked IPs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
