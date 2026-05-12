import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  try {
    // SAFETY CHECK: Prevent accidental data loss
    const existingProducts = await db.product.count();
    if (existingProducts > 0) {
      console.log('Database already contains products. Skipping seed to prevent data loss.');
      return;
    }

    // 1. SEED CATEGORIES
    const categoriesData = [
      { name: "Processors", slug: "processors", description: "Intel & AMD CPUs for every budget and performance need", icon: "Cpu", order: 1 },
      { name: "Graphics Cards", slug: "graphics-cards", description: "NVIDIA & AMD GPUs for gaming, editing, and AI workloads", icon: "Monitor", order: 2 },
      { name: "Motherboards", slug: "motherboards", description: "ATX, Micro-ATX, and Mini-ITX motherboards from top brands", icon: "CircuitBoard", order: 3 },
      { name: "Memory", slug: "memory", description: "DDR4 & DDR5 RAM for desktops, laptops, and servers", icon: "MemoryStick", order: 4 },
      { name: "Storage", slug: "storage", description: "SSDs, HDDs, and NVMe drives for fast and reliable storage", icon: "HardDrive", order: 5 },
      { name: "Power Supplies", slug: "power-supplies", description: "Reliable PSUs from 450W to 1200W for any build", icon: "Zap", order: 6 },
      { name: "PC Cases", slug: "pc-cases", description: "ATX, Micro-ATX, and ITX cases with great airflow and style", icon: "Box", order: 7 },
      { name: "Cooling", slug: "cooling", description: "Air coolers, AIO liquid coolers, and case fans", icon: "Fan", order: 8 },
      { name: "Monitors", slug: "monitors", description: "Gaming, office, and professional monitors from 24 to 32 inches", icon: "Monitor", order: 9 },
      { name: "Peripherals", slug: "peripherals", description: "Keyboards, mice, headsets, and mousepads", icon: "Mouse", order: 10 },
      { name: "CCTV & Security", slug: "cctv-security", description: "Tiandy, Hikvision, and Dahua CCTV systems and accessories", icon: "Camera", order: 11 },
    ];

    const categories: any[] = [];
    for (const cat of categoriesData) {
      const category = await db.category.upsert({
        where: { slug: cat.slug },
        update: cat,
        create: cat,
      });
      categories.push(category);
    }
    console.log(`Created ${categories.length} categories`);

    // 2. SEED BRANDS
    const brandsData = [
      { name: "Intel", slug: "intel", country: "USA", order: 1 },
      { name: "AMD", slug: "amd", country: "USA", order: 2 },
      { name: "NVIDIA", slug: "nvidia", country: "USA", order: 3 },
      { name: "ASUS", slug: "asus", country: "Taiwan", order: 4 },
      { name: "MSI", slug: "msi", country: "Taiwan", order: 5 },
      { name: "Gigabyte", slug: "gigabyte", country: "Taiwan", order: 6 },
      { name: "Corsair", slug: "corsair", country: "USA", order: 7 },
      { name: "G.Skill", slug: "gskill", country: "Taiwan", order: 8 },
      { name: "Samsung", slug: "samsung", country: "South Korea", order: 9 },
      { name: "WD", slug: "wd", country: "USA", order: 10 },
      { name: "Seasonic", slug: "seasonic", country: "Taiwan", order: 11 },
      { name: "NZXT", slug: "nzxt", country: "USA", order: 12 },
      { name: "Noctua", slug: "noctua", country: "Austria", order: 13 },
      { name: "LG", slug: "lg", country: "South Korea", order: 14 },
      { name: "Logitech", slug: "logitech", country: "Switzerland", order: 15 },
      { name: "Razer", slug: "razer", country: "USA", order: 16 },
      { name: "EVGA", slug: "evga", country: "USA", order: 17 },
      { name: "Kingston", slug: "kingston", country: "USA", order: 18 },
      { name: "Cooler Master", slug: "cooler-master", country: "Taiwan", order: 19 },
      { name: "ASRock", slug: "asrock", country: "Taiwan", order: 20 },
      { name: "Hikvision", slug: "hikvision", country: "China", order: 21 },
      { name: "Dahua", slug: "dahua", country: "China", order: 22 },
      { name: "Tiandy", slug: "tiandy", country: "China", order: 23 },
    ];

    const brands: any[] = [];
    for (const brand of brandsData) {
      const b = await db.brand.upsert({
        where: { slug: brand.slug },
        update: brand,
        create: brand,
      });
      brands.push(b);
    }
    console.log(`Created ${brands.length} brands`);

    // Helper to find category/brand by slug
    const findCat = (slug: string) => categories.find((c) => c.slug === slug)?.id || "";
    const findBrand = (slug: string) => brands.find((b) => b.slug === slug)?.id || "";

    // 3. SEED PRODUCTS

    const productsData = [
      {
        name: "Intel Core i9-14900K", slug: "intel-core-i9-14900k",
        description: "24 cores (8P+16E), 32 threads, up to 6.0GHz, 36MB L3 cache. Ultimate performance for enthusiasts and creators.",
        shortDesc: "24-Core flagship, up to 6.0GHz",
        price: 185000, originalPrice: 195000, stock: 5, sku: "INT-14900K",
        categoryId: findCat("processors"), brandId: findBrand("intel"),
        specs: JSON.stringify({ Cores: "24 (8P + 16E)", Threads: "32", "Base Clock": "3.2 GHz", "Boost Clock": "6.0 GHz", "L3 Cache": "36 MB", TDP: "125W", Socket: "LGA 1700" }),
        images: JSON.stringify(["/images/products/intel-i9-14900k.webp"]), isFeatured: true, isNew: false, isOnSale: true, warranty: "3 Years"
      },
      {
        name: "AMD Ryzen 9 7950X", slug: "amd-ryzen-9-7950x",
        description: "16 cores, 32 threads, up to 5.7GHz, 64MB L3 cache. The ultimate multitasking and productivity processor.",
        shortDesc: "16-Core flagship AM5 CPU",
        price: 165000, originalPrice: 175000, stock: 4, sku: "AMD-7950X",
        categoryId: findCat("processors"), brandId: findBrand("amd"),
        specs: JSON.stringify({ Cores: "16", Threads: "32", "Base Clock": "4.5 GHz", "Boost Clock": "5.7 GHz", "L3 Cache": "64 MB", TDP: "170W", Socket: "AM5" }),
        images: JSON.stringify(["/images/products/amd-ryzen9-7950x.webp"]), isFeatured: true, isNew: false, isOnSale: true, warranty: "3 Years"
      },
      {
        name: "NVIDIA GeForce RTX 4090 24GB", slug: "nvidia-rtx-4090-24gb",
        description: "24GB GDDR6X, DLSS 3, Ray Tracing. The fastest consumer GPU for 4K/8K gaming and AI workloads.",
        shortDesc: "24GB GDDR6X, ultimate performance",
        price: 650000, originalPrice: null, stock: 2, sku: "NVI-4090-24G",
        categoryId: findCat("graphics-cards"), brandId: findBrand("nvidia"),
        specs: JSON.stringify({ "VRAM": "24 GB GDDR6X", "Memory Bus": "384-bit", "Boost Clock": "2520 MHz", "CUDA Cores": "16384", TDP: "450W", "Outputs": "3x DP 1.4a, 1x HDMI 2.1" }),
        images: JSON.stringify(["/images/products/nvidia-rtx4090.webp"]), isFeatured: true, isNew: false, isOnSale: false, warranty: "3 Years"
      },
      {
        name: "ASUS ROG Strix B760-A Gaming WiFi D4", slug: "asus-rog-strix-b760-a",
        description: "LGA 1700, DDR4, WiFi 6E, 2.5G LAN, RGB, 14+1 power stages. Premium gaming motherboard.",
        shortDesc: "LGA 1700, DDR4, WiFi 6E, RGB",
        price: 72000, originalPrice: 78000, stock: 8, sku: "ASUS-B760A",
        categoryId: findCat("motherboards"), brandId: findBrand("asus"),
        specs: JSON.stringify({ Socket: "LGA 1700", Chipset: "Intel B760", "Memory Slots": "4x DDR4", "Max Memory": "128 GB", WiFi: "WiFi 6E", LAN: "2.5G LAN", "Form Factor": "ATX" }),
        images: JSON.stringify(["/images/products/asus-z790-hero.webp"]), isFeatured: true, isNew: false, isOnSale: true, warranty: "3 Years"
      },
      {
        name: "Corsair Vengeance DDR5 16GB (2x8GB) 6000MHz", slug: "corsair-vengeance-ddr5-16gb-6000",
        description: "2x8GB DDR5-6000, CL36, low-profile heat spreader. Great for AMD & Intel builds.",
        shortDesc: "16GB DDR5-6000 dual channel kit",
        price: 22000, originalPrice: 25000, stock: 20, sku: "COR-VEN16-6000",
        categoryId: findCat("memory"), brandId: findBrand("corsair"),
        specs: JSON.stringify({ Type: "DDR5", Capacity: "16 GB (2x8 GB)", Speed: "6000 MHz", Latency: "CL36-36-36-36", Voltage: "1.35V", "Heat Spreader": "Aluminum" }),
        images: JSON.stringify(["/images/products/corsair-ddr5.webp"]), isFeatured: false, isNew: true, isOnSale: true, warranty: "Lifetime"
      },
      {
        name: "Samsung 990 Pro 1TB NVMe SSD", slug: "samsung-990-pro-1tb",
        description: "PCIe 4.0 NVMe, up to 7450/6900 MB/s read/write. Top-tier NVMe for gaming and productivity.",
        shortDesc: "1TB NVMe, up to 7450 MB/s",
        price: 28000, originalPrice: 32000, stock: 15, sku: "SAM-990P-1T",
        categoryId: findCat("storage"), brandId: findBrand("samsung"),
        specs: JSON.stringify({ Capacity: "1 TB", Interface: "PCIe 4.0 x4 NVMe", "Read Speed": "7450 MB/s", "Write Speed": "6900 MB/s", Form: "M.2 2280", Warranty: "5 Years" }),
        images: JSON.stringify(["/images/products/samsung-990pro.webp"]), isFeatured: true, isNew: true, isOnSale: true, warranty: "5 Years"
      },
      {
        name: "Corsair RM750e 750W 80+ Gold", slug: "corsair-rm750e-750w",
        description: "750W, 80+ Gold, fully modular, ATX 3.0 compatible, zero RPM mode. Quiet and efficient.",
        shortDesc: "750W 80+ Gold, ATX 3.0",
        price: 32000, originalPrice: 36000, stock: 12, sku: "COR-RM750E",
        categoryId: findCat("power-supplies"), brandId: findBrand("corsair"),
        specs: JSON.stringify({ Wattage: "750W", Efficiency: "80+ Gold", Modular: "Fully Modular", Fan: "135mm Rifle Bearing", Warranty: "7 Years", "ATX 3.0": "Yes" }),
        images: JSON.stringify(["/images/products/corsair-psu.webp"]), isFeatured: false, isNew: false, isOnSale: true, warranty: "7 Years"
      },
      {
        name: "NZXT H7 Flow ATX Mid-Tower", slug: "nzxt-h7-flow",
        description: "Mid-tower ATX, perforated front panel, cable management. Clean design with great airflow.",
        shortDesc: "Mid-tower ATX, excellent airflow",
        price: 28000, originalPrice: null, stock: 7, sku: "NZXT-H7F",
        categoryId: findCat("pc-cases"), brandId: findBrand("nzxt"),
        specs: JSON.stringify({ "Form Factor": "Mid-Tower ATX", "Motherboard Support": "ATX, Micro-ATX, Mini-ITX", "Max GPU Length": "365mm", "Max CPU Cooler Height": "165mm" }),
        images: JSON.stringify(["/images/products/nzxt-h7flow.webp"]), isFeatured: true, isNew: false, isOnSale: false, warranty: "2 Years"
      },
      {
        name: "Noctua NH-D15 Chromax Black", slug: "noctua-nh-d15-chromax",
        description: "Dual-tower air cooler, 2x NF-A15 fans, 6 heat pipes. Top-tier air cooling performance.",
        shortDesc: "Dual-tower air cooler, best air cooling",
        price: 28000, originalPrice: null, stock: 6, sku: "NOC-D15B",
        categoryId: findCat("cooling"), brandId: findBrand("noctua"),
        specs: JSON.stringify({ Type: "Dual-Tower Air Cooler", Fans: "2x NF-A15 140mm", "Heat Pipes": "6x Nickel-Plated Copper", TDP: "250W+", "Height": "165mm", Noise: "24.6 dBA" }),
        images: JSON.stringify(["/images/products/noctua-nhd15.webp"]), isFeatured: true, isNew: false, isOnSale: false, warranty: "6 Years"
      },
      {
        name: "LG UltraGear 27\" 165Hz QHD Gaming Monitor", slug: "lg-ultragear-27",
        description: "27-inch QHD (2560x1440), 165Hz, 1ms, IPS, HDR10. Excellent gaming monitor.",
        shortDesc: "27\" QHD 165Hz IPS gaming monitor",
        price: 125000, originalPrice: 135000, stock: 5, sku: "LG-27-UG",
        categoryId: findCat("monitors"), brandId: findBrand("lg"),
        specs: JSON.stringify({ Size: "27\"", Resolution: "2560 x 1440 (QHD)", "Refresh Rate": "165Hz", "Response Time": "1ms GTG", Panel: "IPS" }),
        images: JSON.stringify(["/images/products/lg-ultragear.webp"]), isFeatured: true, isNew: false, isOnSale: true, warranty: "3 Years"
      },
      {
        name: "Logitech G502 Hero Gaming Mouse", slug: "logitech-g502-hero",
        description: "25600 DPI HERO sensor, 11 programmable buttons, adjustable weights, RGB. Legendary gaming mouse.",
        shortDesc: "High-DPI gaming mouse, 11 buttons",
        price: 12000, originalPrice: 14500, stock: 15, sku: "LOG-G502",
        categoryId: findCat("peripherals"), brandId: findBrand("logitech"),
        specs: JSON.stringify({ Sensor: "HERO 25K", DPI: "100-25600", Buttons: "11 Programmable", Weight: "121g (adjustable)", Cable: "Braided USB", RGB: "Yes" }),
        images: JSON.stringify(["/images/products/logitech-mouse.webp"]), isFeatured: true, isNew: false, isOnSale: true, warranty: "2 Years"
      },
      {
        name: "Razer BlackWidow V3 Mechanical Keyboard", slug: "razer-blackwidow-v3",
        description: "Green mechanical switches, full-size, RGB Chroma, wrist rest. Premium gaming keyboard.",
        shortDesc: "Mechanical gaming keyboard, RGB",
        price: 22000, originalPrice: null, stock: 8, sku: "RZR-BWV3",
        categoryId: findCat("peripherals"), brandId: findBrand("razer"),
        specs: JSON.stringify({ Switches: "Razer Green Mechanical", Layout: "Full-Size", RGB: "Chroma RGB per-key", "Key Rollover": "N-Key", "Cable Length": "1.8m USB-C", "Wrist Rest": "Included" }),
        images: JSON.stringify(["/images/products/razer-keyboard.webp"]), isFeatured: false, isNew: false, isOnSale: false, warranty: "2 Years"
      },
      {
        name: "Dahua PTZ Camera 4MP", slug: "dahua-ptz-4mp",
        description: "4MP, 25x Optical Zoom, IR 100m, IP66. Professional Dahua PTZ camera.",
        shortDesc: "4MP Dahua PTZ, 25x Zoom",
        price: 85000, originalPrice: 95000, stock: 5, sku: "DAH-PTZ4",
        categoryId: findCat("cctv-security"), brandId: findBrand("dahua"),
        specs: JSON.stringify({ Resolution: "4MP", "Optical Zoom": "25x", "IR Range": "100m", Protection: "IP66" }),
        images: JSON.stringify(["/images/products/dahua-ptz.webp"]), isFeatured: false, isNew: false, isOnSale: true, warranty: "2 Years"
      },
      {
        name: "Hikvision DS-2CD 4MP Bullet Camera", slug: "hikvision-bullet-4mp",
        description: "4MP, IR 30m, IP67. Hikvision bullet camera with smart detection.",
        shortDesc: "4MP Hikvision bullet, IR 30m",
        price: 15000, originalPrice: null, stock: 20, sku: "HIK-B4MP",
        categoryId: findCat("cctv-security"), brandId: findBrand("hikvision"),
        specs: JSON.stringify({ Resolution: "4MP", "IR Range": "30m", Protection: "IP67" }),
        images: JSON.stringify(["/images/products/hikvision-camera.webp"]), isFeatured: false, isNew: true, isOnSale: false, warranty: "2 Years"
      },
      {
        name: "Hikvision NVR 8-Channel 4K", slug: "hikvision-nvr-8ch",
        description: "8-channel NVR, 4K recording, 1x SATA. Professional Hikvision network video recorder.",
        shortDesc: "8-ch Hikvision NVR, 4K recording",
        price: 25000, originalPrice: null, stock: 10, sku: "HIK-NVR8",
        categoryId: findCat("cctv-security"), brandId: findBrand("hikvision"),
        specs: JSON.stringify({ Channels: "8", "Max Resolution": "4K", "HDD Bays": "1x SATA" }),
        images: JSON.stringify(["/images/products/hikvision-nvr.webp"]), isFeatured: false, isNew: false, isOnSale: false, warranty: "2 Years"
      },
    ];

    await db.product.createMany({
      data: productsData,
    });
    console.log(`Created ${productsData.length} products`);

    // 4. SEED BANNERS
    const bannersData = [
      { title: "Custom PC Building", subtitle: "Build Your Dream PC", description: "Configure your perfect custom PC with premium components.", link: "pc-builder", buttonText: "Start Building", bgColor: "from-blue-600 to-blue-800", order: 1, isActive: true },
      { title: "CCTV Security Solutions", subtitle: "Protect What Matters", description: "Professional CCTV installation with Tiandy, Hikvision, and Dahua.", link: "category", buttonText: "View CCTV", bgColor: "from-emerald-600 to-emerald-800", order: 2, isActive: true },
    ];
    await db.banner.createMany({ data: bannersData });
    console.log(`Created ${bannersData.length} banners`);

    // 5. SEED SITE SETTINGS
    await db.siteSettings.upsert({
      where: { id: "site-settings" },
      update: {},
      create: {
        id: "site-settings",
        siteName: "SL HUB COMPUTER",
        tagline: "Your Trusted Tech Partner",
        description: "Premium computer parts and services",
        phone: "071 067 8944",
        email: "slhubcomputer@gmail.com",
        address: "Hakmana Road, Deiyandara",
        whatsapp: "94710678944",
      },
    });
    console.log('Created site settings');

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

main();
