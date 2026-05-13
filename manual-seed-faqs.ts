import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  console.log("Starting manual FAQ seed...");

  // Delete existing FAQs to avoid duplicates and ensure clean slate
  await db.fAQ.deleteMany({});
  console.log("Deleted old FAQs.");

  const faqsData = [
    // General (5)
    { question: "Where is SL HUB COMPUTER located?", answer: "We are located on Hakmana Road, Deiyandara, Sri Lanka. You can visit our store during business hours: Mon-Sat 9AM-7PM, Sun 10AM-5PM.", category: "General", order: 1, isActive: true },
    { question: "What are your business hours?", answer: "We're open Monday to Saturday from 9:00 AM to 7:00 PM, and Sunday from 10:00 AM to 5:00 PM. We are closed on Poya days.", category: "General", order: 2, isActive: true },
    { question: "How can I contact SL HUB COMPUTER?", answer: "You can reach us through multiple channels: Hotline/WhatsApp at 071 067 8944, Email at slhubcomputer@gmail.com. WhatsApp is the fastest way to get a response.", category: "General", order: 3, isActive: true },
    { question: "Do you offer warranty on your products?", answer: "Yes! All products sold by SL HUB COMPUTER come with genuine manufacturer warranty. Computer components typically have 1-3 years warranty.", category: "General", order: 4, isActive: true },
    { question: "Are your products genuine?", answer: "Absolutely. We only sell 100% genuine products sourced from authorized distributors. We do not sell counterfeit or refurbished products as new.", category: "General", order: 5, isActive: true },
    
    // Products & Orders (6)
    { question: "How can I place an order?", answer: "You can place orders through our website and checking out via WhatsApp or call us at 071 067 8944. You can also visit our store in person.", category: "Products & Orders", order: 6, isActive: true },
    { question: "What payment methods do you accept?", answer: "We accept cash on delivery, bank transfers, and payments at our store. Online orders are typically handled via bank transfer.", category: "Products & Orders", order: 7, isActive: true },
    { question: "Do you deliver products to my area?", answer: "We deliver island-wide across Sri Lanka! Standard delivery takes 2-5 business days. Orders over Rs. 25,000 qualify for free standard delivery.", category: "Products & Orders", order: 8, isActive: true },
    { question: "Can I return or exchange a product?", answer: "Yes, we have a 7-day return policy for eligible products. Items must be in original condition with packaging intact.", category: "Products & Orders", order: 9, isActive: true },
    { question: "Do you offer installment plans?", answer: "Currently, we do not offer direct installment plans. However, you can use your credit card's installment features if available.", category: "Products & Orders", order: 10, isActive: true },
    { question: "How do I check product availability before ordering?", answer: "You can check the availability status on each product page or contact us directly via WhatsApp with the product name or link to confirm stock before placing your order.", category: "Products & Orders", order: 11, isActive: true },
    
    // Repair & Services (6)
    { question: "What repair services do you offer?", answer: "We offer comprehensive repair services including: laptop screen replacement, motherboard repair, OS installation, and hardware upgrades for desktops/laptops.", category: "Repair & Services", order: 12, isActive: true },
    { question: "How long do repairs usually take?", answer: "Simple repairs like OS installation can be completed same day. Hardware repairs typically take 1-3 business days depending on parts availability.", category: "Repair & Services", order: 13, isActive: true },
    { question: "Do you charge for repair diagnostics?", answer: "Diagnostics are generally free if you proceed with the repair. If you choose not to repair after diagnostics, a small service fee may apply depending on the complexity.", category: "Repair & Services", order: 14, isActive: true },
    { question: "Do you provide repair warranties?", answer: "Yes, all repair services come with a service warranty. Typically 30 days for software and 90 days for hardware repairs.", category: "Repair & Services", order: 15, isActive: true },
    { question: "Can you build a custom PC for me?", answer: "Absolutely! Custom PC building is our specialty. Use our online PC Builder tool or visit our store and our experts will help you design your dream build.", category: "Repair & Services", order: 16, isActive: true },
    { question: "Do you offer on-site repair services?", answer: "Yes, we offer on-site repair services for certain issues within our service area. Please contact us to schedule an on-site visit.", category: "Repair & Services", order: 17, isActive: true },
    
    // CCTV & Security (5)
    { question: "How many cameras do I need for my home/business?", answer: "The number of cameras depends on the size of the property and the areas you want to cover. We offer a free site survey to recommend the best setup for your needs.", category: "CCTV & Security", order: 18, isActive: true },
    { question: "Can I view my CCTV cameras remotely on my phone?", answer: "Yes! All our Tiandy CCTV systems support remote viewing via smartphone apps from anywhere in the world with an internet connection.", category: "CCTV & Security", order: 19, isActive: true },
    { question: "What is the warranty on CCTV systems?", answer: "We provide a comprehensive 1-year to 3-year warranty on CCTV cameras and NVRs depending on the brand and model, along with a service warranty for the installation.", category: "CCTV & Security", order: 20, isActive: true },
    { question: "What CCTV brands do you carry?", answer: "We are an authorized dealer for Tiandy CCTV products, offering a range of cameras, NVRs, and accessories. We also deal with Hikvision and Dahua.", category: "CCTV & Security", order: 21, isActive: true },
    { question: "Do you provide CCTV installation services?", answer: "Yes! We provide complete CCTV installation services including site survey, cabling, installation, and configuration for homes and businesses.", category: "CCTV & Security", order: 22, isActive: true },
  ];

  await db.fAQ.createMany({
    data: faqsData,
    skipDuplicates: true,
  });

  console.log(`Successfully seeded ${faqsData.length} FAQs!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
