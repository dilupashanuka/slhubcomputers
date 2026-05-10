import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const settings = await prisma.siteSettings.upsert({
    where: { id: 'site-settings' },
    update: {
      phone: '071 067 8944',
      email: 'slhub9@gmail.com',
      address: 'Hakamana Road, Deiyandara',
      facebook: 'https://web.facebook.com/profile.php?id=100063543731370',
      description: 'WELCOME TO SL HUB COMPUTER 🙏. Expert in Laptop Parts, Custom PC Builds, Tech Support, and CCTV Cameras.',
    },
    create: {
      id: 'site-settings',
      siteName: 'SL HUB COMPUTER',
      tagline: 'Your Trusted Tech Partner',
      description: 'WELCOME TO SL HUB COMPUTER 🙏. Expert in Laptop Parts, Custom PC Builds, Tech Support, and CCTV Cameras.',
      phone: '071 067 8944',
      email: 'slhub9@gmail.com',
      address: 'Hakamana Road, Deiyandara',
      whatsapp: '94710678944',
      facebook: 'https://web.facebook.com/profile.php?id=100063543731370',
      currency: 'LKR',
      currencySymbol: 'Rs.',
    },
  });
  console.log('Settings updated:', settings);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
