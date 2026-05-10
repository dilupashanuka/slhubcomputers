// =============================================================================
// SL HUB COMPUTER - Database Seed API Route
// =============================================================================
// Purpose: POST endpoint for seeding the database with comprehensive demo data
// Features: Creates categories, brands, products, banners, services, settings,
//           and Pre-Built PCs for the SL HUB COMPUTER e-commerce platform
// Data: All prices in LKR (Rs.), realistic Sri Lankan market pricing
// NEW: Includes 6 Pre-Built PCs (2 budget, 2 gaming, 1 office, 1 workstation)
// =============================================================================

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST() {
  try {
    // ========================================================================
    // 1. SEED CATEGORIES - 11 product categories for SL HUB COMPUTER
    // ========================================================================
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

    const categories = [];
    for (const cat of categoriesData) {
      const category = await db.category.upsert({
        where: { slug: cat.slug },
        update: cat,
        create: cat,
      });
      categories.push(category);
    }

    // ========================================================================
    // 2. SEED BRANDS - 23 brands carried by SL HUB COMPUTER
    // ========================================================================
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

    const brands = [];
    for (const brand of brandsData) {
      const b = await db.brand.upsert({
        where: { slug: brand.slug },
        update: brand,
        create: brand,
      });
      brands.push(b);
    }

    // Helper to find category/brand by slug
    const findCat = (slug: string) => categories.find((c) => c.slug === slug)?.id || "";
    const findBrand = (slug: string) => brands.find((b) => b.slug === slug)?.id || "";

    // ========================================================================
    // 3. SEED PRODUCTS - ~44 products with realistic LKR pricing
    // ========================================================================

    // Delete existing products first to avoid unique constraint errors
    await db.review.deleteMany();
    await db.orderItem.deleteMany();
    await db.product.deleteMany();

    const productsData = [
      // ---- Processors (5) ----
      {
        name: "Intel Core i5-14400F", slug: "intel-core-i5-14400f",
        description: "10 cores (6P+4E), 16 threads, up to 4.7GHz, 20MB L3 cache. Great value gaming processor with 14th Gen hybrid architecture.",
        shortDesc: "10-Core gaming CPU, up to 4.7GHz",
        price: 62000, originalPrice: 68000, stock: 15, sku: "INT-14400F",
        categoryId: findCat("processors"), brandId: findBrand("intel"),
        specs: JSON.stringify({ Cores: "10 (6P + 4E)", Threads: "16", "Base Clock": "2.5 GHz", "Boost Clock": "4.7 GHz", "L3 Cache": "20 MB", TDP: "65W", Socket: "LGA 1700" }),
        images: JSON.stringify(["/images/products/cpu-intel-14400f.jpg"]), isFeatured: true, isNew: true, isOnSale: true, warranty: "3 Years"
      },
      {
        name: "Intel Core i7-14700K", slug: "intel-core-i7-14700k",
        description: "20 cores (8P+12E), 28 threads, up to 5.6GHz, 33MB L3 cache. Top-tier gaming and productivity processor.",
        shortDesc: "20-Core powerhouse, up to 5.6GHz",
        price: 125000, originalPrice: null, stock: 8, sku: "INT-14700K",
        categoryId: findCat("processors"), brandId: findBrand("intel"),
        specs: JSON.stringify({ Cores: "20 (8P + 12E)", Threads: "28", "Base Clock": "3.4 GHz", "Boost Clock": "5.6 GHz", "L3 Cache": "33 MB", TDP: "125W", Socket: "LGA 1700" }),
        images: JSON.stringify(["/images/products/cpu-intel-14700k.jpg"]), isFeatured: true, isNew: false, isOnSale: false, warranty: "3 Years"
      },
      {
        name: "Intel Core i9-14900K", slug: "intel-core-i9-14900k",
        description: "24 cores (8P+16E), 32 threads, up to 6.0GHz, 36MB L3 cache. Ultimate performance for enthusiasts and creators.",
        shortDesc: "24-Core flagship, up to 6.0GHz",
        price: 185000, originalPrice: 195000, stock: 5, sku: "INT-14900K",
        categoryId: findCat("processors"), brandId: findBrand("intel"),
        specs: JSON.stringify({ Cores: "24 (8P + 16E)", Threads: "32", "Base Clock": "3.2 GHz", "Boost Clock": "6.0 GHz", "L3 Cache": "36 MB", TDP: "125W", Socket: "LGA 1700" }),
        images: JSON.stringify(["/images/products/cpu-intel-14900k.jpg"]), isFeatured: true, isNew: false, isOnSale: true, warranty: "3 Years"
      },
      {
        name: "AMD Ryzen 5 7600X", slug: "amd-ryzen-5-7600x",
        description: "6 cores, 12 threads, up to 5.3GHz, 32MB L3 cache. Excellent gaming performance with AM5 platform.",
        shortDesc: "6-Core AM5 gaming CPU, up to 5.3GHz",
        price: 55000, originalPrice: null, stock: 12, sku: "AMD-7600X",
        categoryId: findCat("processors"), brandId: findBrand("amd"),
        specs: JSON.stringify({ Cores: "6", Threads: "12", "Base Clock": "4.7 GHz", "Boost Clock": "5.3 GHz", "L3 Cache": "32 MB", TDP: "105W", Socket: "AM5" }),
        images: JSON.stringify(["/images/products/cpu-amd-7600x.jpg"]), isFeatured: false, isNew: true, isOnSale: false, warranty: "3 Years"
      },
      {
        name: "AMD Ryzen 7 7800X3D", slug: "amd-ryzen-7-7800x3d",
        description: "8 cores, 16 threads, up to 5.0GHz, 96MB L3 cache with 3D V-Cache. The ultimate gaming processor.",
        shortDesc: "8-Core with 3D V-Cache, best for gaming",
        price: 115000, originalPrice: 128000, stock: 6, sku: "AMD-7800X3D",
        categoryId: findCat("processors"), brandId: findBrand("amd"),
        specs: JSON.stringify({ Cores: "8", Threads: "16", "Base Clock": "4.2 GHz", "Boost Clock": "5.0 GHz", "L3 Cache": "96 MB (3D V-Cache)", TDP: "120W", Socket: "AM5" }),
        images: JSON.stringify(["/images/products/cpu-amd-7800x3d.jpg"]), isFeatured: true, isNew: false, isOnSale: true, warranty: "3 Years"
      },

      // ---- Graphics Cards (6) ----
      {
        name: "NVIDIA GeForce RTX 4060 8GB", slug: "nvidia-rtx-4060-8gb",
        description: "8GB GDDR6, DLSS 3, Ray Tracing. Perfect 1080p gaming GPU with Ada Lovelace architecture.",
        shortDesc: "8GB GDDR6, great for 1080p gaming",
        price: 115000, originalPrice: 125000, stock: 10, sku: "NVI-4060-8G",
        categoryId: findCat("graphics-cards"), brandId: findBrand("nvidia"),
        specs: JSON.stringify({ "VRAM": "8 GB GDDR6", "Memory Bus": "128-bit", "Boost Clock": "2460 MHz", "CUDA Cores": "3072", TDP: "115W", "Outputs": "3x DP 1.4a, 1x HDMI 2.1" }),
        images: JSON.stringify(["/images/products/gpu-rtx4060.jpg"]), isFeatured: true, isNew: false, isOnSale: true, warranty: "3 Years"
      },
      {
        name: "NVIDIA GeForce RTX 4070 Super 12GB", slug: "nvidia-rtx-4070-super-12gb",
        description: "12GB GDDR6X, DLSS 3, Ray Tracing. Excellent 1440p gaming performance with Super upgrade.",
        shortDesc: "12GB GDDR6X, excellent 1440p gaming",
        price: 205000, originalPrice: null, stock: 7, sku: "NVI-4070S-12G",
        categoryId: findCat("graphics-cards"), brandId: findBrand("nvidia"),
        specs: JSON.stringify({ "VRAM": "12 GB GDDR6X", "Memory Bus": "192-bit", "Boost Clock": "2520 MHz", "CUDA Cores": "7168", TDP: "220W", "Outputs": "3x DP 1.4a, 1x HDMI 2.1" }),
        images: JSON.stringify(["/images/products/gpu-rtx4070s.jpg"]), isFeatured: true, isNew: true, isOnSale: false, warranty: "3 Years"
      },
      {
        name: "NVIDIA GeForce RTX 4080 Super 16GB", slug: "nvidia-rtx-4080-super-16gb",
        description: "16GB GDDR6X, DLSS 3, Ray Tracing. Top-tier 4K gaming performance for enthusiasts.",
        shortDesc: "16GB GDDR6X, 4K gaming beast",
        price: 385000, originalPrice: 410000, stock: 3, sku: "NVI-4080S-16G",
        categoryId: findCat("graphics-cards"), brandId: findBrand("nvidia"),
        specs: JSON.stringify({ "VRAM": "16 GB GDDR6X", "Memory Bus": "256-bit", "Boost Clock": "2550 MHz", "CUDA Cores": "10240", TDP: "320W", "Outputs": "3x DP 1.4a, 1x HDMI 2.1" }),
        images: JSON.stringify(["/images/products/gpu-rtx4080s.jpg"]), isFeatured: true, isNew: false, isOnSale: true, warranty: "3 Years"
      },
      {
        name: "NVIDIA GeForce RTX 4090 24GB", slug: "nvidia-rtx-4090-24gb",
        description: "24GB GDDR6X, DLSS 3, Ray Tracing. The fastest consumer GPU for 4K/8K gaming and AI workloads.",
        shortDesc: "24GB GDDR6X, ultimate performance",
        price: 650000, originalPrice: null, stock: 2, sku: "NVI-4090-24G",
        categoryId: findCat("graphics-cards"), brandId: findBrand("nvidia"),
        specs: JSON.stringify({ "VRAM": "24 GB GDDR6X", "Memory Bus": "384-bit", "Boost Clock": "2520 MHz", "CUDA Cores": "16384", TDP: "450W", "Outputs": "3x DP 1.4a, 1x HDMI 2.1" }),
        images: JSON.stringify(["/images/products/gpu-rtx4090.jpg"]), isFeatured: true, isNew: false, isOnSale: false, warranty: "3 Years"
      },
      {
        name: "AMD Radeon RX 7600 8GB", slug: "amd-rx-7600-8gb",
        description: "8GB GDDR6, FSR 3, Ray Tracing. Budget-friendly 1080p gaming with RDNA 3 architecture.",
        shortDesc: "8GB GDDR6, budget 1080p gaming",
        price: 88000, originalPrice: 95000, stock: 9, sku: "AMD-RX7600",
        categoryId: findCat("graphics-cards"), brandId: findBrand("amd"),
        specs: JSON.stringify({ "VRAM": "8 GB GDDR6", "Memory Bus": "128-bit", "Boost Clock": "2655 MHz", "Stream Processors": "2048", TDP: "165W", "Outputs": "3x DP 2.1, 1x HDMI 2.1" }),
        images: JSON.stringify(["/images/products/gpu-rx7600.jpg"]), isFeatured: false, isNew: true, isOnSale: true, warranty: "3 Years"
      },
      {
        name: "ASUS Dual RTX 4060 Ti 16GB", slug: "asus-dual-rtx-4060-ti-16gb",
        description: "16GB GDDR6, DLSS 3, dual-fan cooling. Great for 1080p gaming and content creation.",
        shortDesc: "16GB GDDR6, dual-fan design",
        price: 155000, originalPrice: null, stock: 5, sku: "ASUS-4060TI-16G",
        categoryId: findCat("graphics-cards"), brandId: findBrand("asus"),
        specs: JSON.stringify({ "VRAM": "16 GB GDDR6", "Memory Bus": "128-bit", "Boost Clock": "2535 MHz", "CUDA Cores": "4352", TDP: "165W", "Outputs": "2x DP 1.4a, 2x HDMI 2.1" }),
        images: JSON.stringify(["/images/products/gpu-asus-4060ti.jpg"]), isFeatured: false, isNew: true, isOnSale: false, warranty: "3 Years"
      },

      // ---- Motherboards (4) ----
      {
        name: "ASUS ROG Strix B760-A Gaming WiFi D4", slug: "asus-rog-strix-b760-a",
        description: "LGA 1700, DDR4, WiFi 6E, 2.5G LAN, RGB, 14+1 power stages. Premium gaming motherboard.",
        shortDesc: "LGA 1700, DDR4, WiFi 6E, RGB",
        price: 72000, originalPrice: 78000, stock: 8, sku: "ASUS-B760A",
        categoryId: findCat("motherboards"), brandId: findBrand("asus"),
        specs: JSON.stringify({ Socket: "LGA 1700", Chipset: "Intel B760", "Memory Slots": "4x DDR4", "Max Memory": "128 GB", WiFi: "WiFi 6E", LAN: "2.5G LAN", "Form Factor": "ATX" }),
        images: JSON.stringify(["/images/products/mb-asus-b760a.jpg"]), isFeatured: true, isNew: false, isOnSale: true, warranty: "3 Years"
      },
      {
        name: "MSI MAG B650 Tomahawk WiFi", slug: "msi-mag-b650-tomahawk",
        description: "AM5, DDR5, WiFi 6E, 2.5G LAN, 12+2+1 power phases. Great AM5 gaming motherboard.",
        shortDesc: "AM5, DDR5, WiFi 6E, 2.5G LAN",
        price: 65000, originalPrice: null, stock: 6, sku: "MSI-B650T",
        categoryId: findCat("motherboards"), brandId: findBrand("msi"),
        specs: JSON.stringify({ Socket: "AM5", Chipset: "AMD B650", "Memory Slots": "4x DDR5", "Max Memory": "128 GB", WiFi: "WiFi 6E", LAN: "2.5G LAN", "Form Factor": "ATX" }),
        images: JSON.stringify(["/images/products/mb-msi-b650t.jpg"]), isFeatured: false, isNew: false, isOnSale: false, warranty: "3 Years"
      },
      {
        name: "Gigabyte B760 Gaming X DDR4", slug: "gigabyte-b760-gaming-x",
        description: "LGA 1700, DDR4, 12+1+1 phases, PCIe 4.0, M.2 slots. Budget-friendly gaming motherboard.",
        shortDesc: "LGA 1700, DDR4, PCIe 4.0",
        price: 42000, originalPrice: null, stock: 10, sku: "GIG-B760GX",
        categoryId: findCat("motherboards"), brandId: findBrand("gigabyte"),
        specs: JSON.stringify({ Socket: "LGA 1700", Chipset: "Intel B760", "Memory Slots": "4x DDR4", "Max Memory": "128 GB", WiFi: "No", LAN: "1G LAN", "Form Factor": "ATX" }),
        images: JSON.stringify(["/images/products/mb-gig-b760.jpg"]), isFeatured: false, isNew: false, isOnSale: false, warranty: "3 Years"
      },
      {
        name: "ASRock A620M Pro RS", slug: "asrock-a620m-pro-rs",
        description: "AM5, DDR5, 8+2+1 power phases, M.2 SSD, budget AM5 option for Ryzen 7000 series.",
        shortDesc: "AM5, DDR5, budget AM5 option",
        price: 28000, originalPrice: null, stock: 12, sku: "ASR-A620M",
        categoryId: findCat("motherboards"), brandId: findBrand("asrock"),
        specs: JSON.stringify({ Socket: "AM5", Chipset: "AMD A620", "Memory Slots": "2x DDR5", "Max Memory": "64 GB", WiFi: "No", LAN: "1G LAN", "Form Factor": "Micro-ATX" }),
        images: JSON.stringify(["/images/products/mb-asr-a620m.jpg"]), isFeatured: false, isNew: false, isOnSale: false, warranty: "3 Years"
      },

      // ---- Memory (4) ----
      {
        name: "Corsair Vengeance DDR5 16GB (2x8GB) 6000MHz", slug: "corsair-vengeance-ddr5-16gb-6000",
        description: "2x8GB DDR5-6000, CL36, low-profile heat spreader. Great for AMD & Intel builds.",
        shortDesc: "16GB DDR5-6000 dual channel kit",
        price: 22000, originalPrice: 25000, stock: 20, sku: "COR-VEN16-6000",
        categoryId: findCat("memory"), brandId: findBrand("corsair"),
        specs: JSON.stringify({ Type: "DDR5", Capacity: "16 GB (2x8 GB)", Speed: "6000 MHz", Latency: "CL36-36-36-36", Voltage: "1.35V", "Heat Spreader": "Aluminum" }),
        images: JSON.stringify(["/images/products/ram-corsair-ddr5.jpg"]), isFeatured: false, isNew: true, isOnSale: true, warranty: "Lifetime"
      },
      {
        name: "G.Skill Trident Z5 RGB DDR5 32GB (2x16GB) 6400MHz", slug: "gskill-trident-z5-32gb-6400",
        description: "2x16GB DDR5-6400, CL32, RGB lighting, premium performance memory for enthusiasts.",
        shortDesc: "32GB DDR5-6400 RGB kit",
        price: 48000, originalPrice: null, stock: 8, sku: "GS-TZ5-32-6400",
        categoryId: findCat("memory"), brandId: findBrand("gskill"),
        specs: JSON.stringify({ Type: "DDR5", Capacity: "32 GB (2x16 GB)", Speed: "6400 MHz", Latency: "CL32-39-39-39", Voltage: "1.4V", "Heat Spreader": "Aluminum + RGB" }),
        images: JSON.stringify(["/images/products/ram-gskill-tz5.jpg"]), isFeatured: true, isNew: false, isOnSale: false, warranty: "Lifetime"
      },
      {
        name: "Kingston Fury Beast DDR5 16GB 5200MHz", slug: "kingston-fury-beast-16gb-5200",
        description: "16GB DDR5-5200, CL40, sleek heat spreader. Reliable DDR5 for any build.",
        shortDesc: "16GB DDR5-5200 single stick",
        price: 14000, originalPrice: null, stock: 25, sku: "KST-FB16-5200",
        categoryId: findCat("memory"), brandId: findBrand("kingston"),
        specs: JSON.stringify({ Type: "DDR5", Capacity: "16 GB (1x16 GB)", Speed: "5200 MHz", Latency: "CL40", Voltage: "1.25V", "Heat Spreader": "Aluminum" }),
        images: JSON.stringify(["/images/products/ram-kingston-fury.jpg"]), isFeatured: false, isNew: false, isOnSale: false, warranty: "Lifetime"
      },
      {
        name: "Corsair Vengeance LPX DDR4 16GB (2x8GB) 3200MHz", slug: "corsair-vengeance-lpx-16gb-3200",
        description: "2x8GB DDR4-3200, CL16, low-profile design. Perfect for DDR4 builds.",
        shortDesc: "16GB DDR4-3200 budget kit",
        price: 11000, originalPrice: 13000, stock: 30, sku: "COR-LPX16-3200",
        categoryId: findCat("memory"), brandId: findBrand("corsair"),
        specs: JSON.stringify({ Type: "DDR4", Capacity: "16 GB (2x8 GB)", Speed: "3200 MHz", Latency: "CL16-18-18-18", Voltage: "1.35V", "Heat Spreader": "Aluminum" }),
        images: JSON.stringify(["/images/products/ram-corsair-lpx.jpg"]), isFeatured: false, isNew: false, isOnSale: true, warranty: "Lifetime"
      },

      // ---- Storage (4) ----
      {
        name: "Samsung 990 Pro 1TB NVMe SSD", slug: "samsung-990-pro-1tb",
        description: "PCIe 4.0 NVMe, up to 7450/6900 MB/s read/write. Top-tier NVMe for gaming and productivity.",
        shortDesc: "1TB NVMe, up to 7450 MB/s",
        price: 28000, originalPrice: 32000, stock: 15, sku: "SAM-990P-1T",
        categoryId: findCat("storage"), brandId: findBrand("samsung"),
        specs: JSON.stringify({ Capacity: "1 TB", Interface: "PCIe 4.0 x4 NVMe", "Read Speed": "7450 MB/s", "Write Speed": "6900 MB/s", Form: "M.2 2280", Warranty: "5 Years" }),
        images: JSON.stringify(["/images/products/ssd-samsung-990p.jpg"]), isFeatured: true, isNew: true, isOnSale: true, warranty: "5 Years"
      },
      {
        name: "Samsung 870 EVO 1TB SATA SSD", slug: "samsung-870-evo-1tb",
        description: "SATA III, up to 560/530 MB/s. Reliable SATA SSD for upgrades and storage expansion.",
        shortDesc: "1TB SATA SSD, reliable performance",
        price: 15000, originalPrice: null, stock: 20, sku: "SAM-870E-1T",
        categoryId: findCat("storage"), brandId: findBrand("samsung"),
        specs: JSON.stringify({ Capacity: "1 TB", Interface: "SATA III", "Read Speed": "560 MB/s", "Write Speed": "530 MB/s", Form: "2.5-inch", Warranty: "5 Years" }),
        images: JSON.stringify(["/images/products/ssd-samsung-870.jpg"]), isFeatured: false, isNew: false, isOnSale: false, warranty: "5 Years"
      },
      {
        name: "WD Blue SN580 500GB NVMe SSD", slug: "wd-blue-sn580-500gb",
        description: "PCIe 4.0 NVMe, up to 4150/4150 MB/s. Budget NVMe for fast boot and load times.",
        shortDesc: "500GB NVMe, budget friendly",
        price: 9000, originalPrice: null, stock: 25, sku: "WD-SN580-500",
        categoryId: findCat("storage"), brandId: findBrand("wd"),
        specs: JSON.stringify({ Capacity: "500 GB", Interface: "PCIe 4.0 x4 NVMe", "Read Speed": "4150 MB/s", "Write Speed": "4150 MB/s", Form: "M.2 2280", Warranty: "5 Years" }),
        images: JSON.stringify(["/images/products/ssd-wd-sn580.jpg"]), isFeatured: false, isNew: false, isOnSale: false, warranty: "5 Years"
      },
      {
        name: "WD Blue 2TB HDD 7200RPM", slug: "wd-blue-2tb-hdd",
        description: "2TB 7200RPM, 256MB cache, SATA III. Reliable bulk storage for files and games.",
        shortDesc: "2TB HDD, 7200RPM, bulk storage",
        price: 12000, originalPrice: 14000, stock: 18, sku: "WD-BLUE-2T",
        categoryId: findCat("storage"), brandId: findBrand("wd"),
        specs: JSON.stringify({ Capacity: "2 TB", Interface: "SATA III", RPM: "7200", Cache: "256 MB", Form: "3.5-inch", Warranty: "2 Years" }),
        images: JSON.stringify(["/images/products/hdd-wd-blue.jpg"]), isFeatured: false, isNew: false, isOnSale: true, warranty: "2 Years"
      },

      // ---- Power Supplies (3) ----
      {
        name: "Seasonic Focus GX-750 750W 80+ Gold", slug: "seasonic-focus-gx-750",
        description: "750W, 80+ Gold, fully modular, 10-year warranty, 120mm FDB fan. Premium power supply.",
        shortDesc: "750W 80+ Gold, fully modular",
        price: 35000, originalPrice: null, stock: 10, sku: "SEA-GX750",
        categoryId: findCat("power-supplies"), brandId: findBrand("seasonic"),
        specs: JSON.stringify({ Wattage: "750W", Efficiency: "80+ Gold", Modular: "Fully Modular", Fan: "120mm FDB", Warranty: "10 Years", Protections: "OVP, UVP, OCP, SCP, OTP" }),
        images: JSON.stringify(["/images/products/psu-seasonic-gx750.jpg"]), isFeatured: true, isNew: false, isOnSale: false, warranty: "10 Years"
      },
      {
        name: "Corsair RM750e 750W 80+ Gold", slug: "corsair-rm750e-750w",
        description: "750W, 80+ Gold, fully modular, ATX 3.0 compatible, zero RPM mode. Quiet and efficient.",
        shortDesc: "750W 80+ Gold, ATX 3.0",
        price: 32000, originalPrice: 36000, stock: 12, sku: "COR-RM750E",
        categoryId: findCat("power-supplies"), brandId: findBrand("corsair"),
        specs: JSON.stringify({ Wattage: "750W", Efficiency: "80+ Gold", Modular: "Fully Modular", Fan: "135mm Rifle Bearing", Warranty: "7 Years", "ATX 3.0": "Yes" }),
        images: JSON.stringify(["/images/products/psu-corsair-rm750e.jpg"]), isFeatured: false, isNew: false, isOnSale: true, warranty: "7 Years"
      },
      {
        name: "Cooler Master MWE 550W 80+ Bronze", slug: "cooler-master-mwe-550w",
        description: "550W, 80+ Bronze, non-modular, 120mm fan. Reliable budget power supply.",
        shortDesc: "550W 80+ Bronze, budget PSU",
        price: 13000, originalPrice: null, stock: 20, sku: "CM-MWE550",
        categoryId: findCat("power-supplies"), brandId: findBrand("cooler-master"),
        specs: JSON.stringify({ Wattage: "550W", Efficiency: "80+ Bronze", Modular: "Non-Modular", Fan: "120mm", Warranty: "3 Years", Protections: "OVP, UVP, OCP, SCP" }),
        images: JSON.stringify(["/images/products/psu-cm-mwe550.jpg"]), isFeatured: false, isNew: false, isOnSale: false, warranty: "3 Years"
      },

      // ---- PC Cases (3) ----
      {
        name: "NZXT H6 Flow ATX Mid-Tower", slug: "nzxt-h6-flow",
        description: "Mid-tower ATX, perforated front panel, cable management, 2x F120 fans included. Clean design with great airflow.",
        shortDesc: "Mid-tower ATX, excellent airflow",
        price: 28000, originalPrice: null, stock: 7, sku: "NZXT-H6F",
        categoryId: findCat("pc-cases"), brandId: findBrand("nzxt"),
        specs: JSON.stringify({ "Form Factor": "Mid-Tower ATX", "Motherboard Support": "ATX, Micro-ATX, Mini-ITX", "Fans Included": "2x 120mm", "Max GPU Length": "365mm", "Max CPU Cooler Height": "165mm", "Drive Bays": "2x 2.5\", 2x 3.5\"" }),
        images: JSON.stringify(["/images/products/case-nzxt-h6.jpg"]), isFeatured: true, isNew: false, isOnSale: false, warranty: "2 Years"
      },
      {
        name: "Corsair 4000D Airflow ATX Mid-Tower", slug: "corsair-4000d-airflow",
        description: "Mid-tower ATX, mesh front panel, RapidRoute cable management, 2x 120mm fans. Popular airflow case.",
        shortDesc: "Mid-tower ATX, mesh airflow design",
        price: 22000, originalPrice: 25000, stock: 9, sku: "COR-4000D",
        categoryId: findCat("pc-cases"), brandId: findBrand("corsair"),
        specs: JSON.stringify({ "Form Factor": "Mid-Tower ATX", "Motherboard Support": "ATX, Micro-ATX, Mini-ITX", "Fans Included": "2x 120mm", "Max GPU Length": "360mm", "Max CPU Cooler Height": "170mm", "Drive Bays": "2x 2.5\", 2x 3.5\"" }),
        images: JSON.stringify(["/images/products/case-corsair-4000d.jpg"]), isFeatured: false, isNew: false, isOnSale: true, warranty: "2 Years"
      },
      {
        name: "Cooler Master MasterBox Q300L Mini-ITX", slug: "cooler-master-q300l",
        description: "Mini-ITX/Micro-ATX, compact design, mesh front, 1x 120mm fan. Budget small form factor case.",
        shortDesc: "Mini-ITX, compact budget case",
        price: 9500, originalPrice: null, stock: 15, sku: "CM-Q300L",
        categoryId: findCat("pc-cases"), brandId: findBrand("cooler-master"),
        specs: JSON.stringify({ "Form Factor": "Mini-Tower", "Motherboard Support": "Mini-ITX, Micro-ATX", "Fans Included": "1x 120mm", "Max GPU Length": "360mm", "Max CPU Cooler Height": "155mm", "Drive Bays": "2x 2.5\", 2x 3.5\"" }),
        images: JSON.stringify(["/images/products/case-cm-q300l.jpg"]), isFeatured: false, isNew: false, isOnSale: false, warranty: "2 Years"
      },

      // ---- Cooling (3) ----
      {
        name: "Noctua NH-D15 Chromax Black", slug: "noctua-nh-d15-chromax",
        description: "Dual-tower air cooler, 2x NF-A15 fans, 6 heat pipes. Top-tier air cooling performance.",
        shortDesc: "Dual-tower air cooler, best air cooling",
        price: 28000, originalPrice: null, stock: 6, sku: "NOC-D15B",
        categoryId: findCat("cooling"), brandId: findBrand("noctua"),
        specs: JSON.stringify({ Type: "Dual-Tower Air Cooler", Fans: "2x NF-A15 140mm", "Heat Pipes": "6x Nickel-Plated Copper", TDP: "250W+", "Height": "165mm", Noise: "24.6 dBA" }),
        images: JSON.stringify(["/images/products/cooler-noctua-d15.jpg"]), isFeatured: true, isNew: false, isOnSale: false, warranty: "6 Years"
      },
      {
        name: "Corsair iCUE H100i Elite Capellix 240mm AIO", slug: "corsair-h100i-elite-240mm",
        description: "240mm AIO liquid cooler, RGB pump, 2x ML120 fans. Great cooling with stunning RGB effects.",
        shortDesc: "240mm AIO liquid cooler, RGB",
        price: 32000, originalPrice: 36000, stock: 8, sku: "COR-H100IE",
        categoryId: findCat("cooling"), brandId: findBrand("corsair"),
        specs: JSON.stringify({ Type: "240mm AIO Liquid Cooler", Fans: "2x ML120 RGB", Radiator: "240mm Aluminum", RGB: "33 Capellix LEDs", Noise: "10-36 dBA", Warranty: "5 Years" }),
        images: JSON.stringify(["/images/products/cooler-corsair-h100i.jpg"]), isFeatured: false, isNew: true, isOnSale: true, warranty: "5 Years"
      },
      {
        name: "Cooler Master Hyper 212 Black Edition", slug: "cooler-master-hyper-212-black",
        description: "Single-tower air cooler, 1x SickleFlow fan, 4 heat pipes. Classic budget cooler with great value.",
        shortDesc: "Budget air cooler, great value",
        price: 7500, originalPrice: null, stock: 25, sku: "CM-212BE",
        categoryId: findCat("cooling"), brandId: findBrand("cooler-master"),
        specs: JSON.stringify({ Type: "Single-Tower Air Cooler", Fans: "1x SickleFlow 120mm", "Heat Pipes": "4x Direct Contact", TDP: "150W+", "Height": "158mm", Noise: "8-27 dBA" }),
        images: JSON.stringify(["/images/products/cooler-cm-212.jpg"]), isFeatured: false, isNew: false, isOnSale: false, warranty: "2 Years"
      },

      // ---- Monitors (3) ----
      {
        name: "LG 27GP850-B 27\" 165Hz QHD IPS Gaming Monitor", slug: "lg-27gp850-b",
        description: "27-inch QHD (2560x1440), 165Hz (OC 180Hz), 1ms, IPS, HDR10, NVIDIA G-Sync Compatible. Excellent gaming monitor.",
        shortDesc: "27\" QHD 165Hz IPS gaming monitor",
        price: 125000, originalPrice: 135000, stock: 5, sku: "LG-27GP850",
        categoryId: findCat("monitors"), brandId: findBrand("lg"),
        specs: JSON.stringify({ Size: "27\"", Resolution: "2560 x 1440 (QHD)", "Refresh Rate": "165Hz (OC 180Hz)", "Response Time": "1ms GTG", Panel: "Nano IPS", HDR: "HDR10", Sync: "NVIDIA G-Sync Compatible" }),
        images: JSON.stringify(["/images/products/monitor-lg-27gp.jpg"]), isFeatured: true, isNew: false, isOnSale: true, warranty: "3 Years"
      },
      {
        name: "LG 24MP60G-B 24\" 75Hz FHD IPS Monitor", slug: "lg-24mp60g-b",
        description: "24-inch FHD (1920x1080), 75Hz, 5ms, IPS, FreeSync. Great office and casual gaming monitor.",
        shortDesc: "24\" FHD 75Hz IPS office monitor",
        price: 35000, originalPrice: null, stock: 10, sku: "LG-24MP60",
        categoryId: findCat("monitors"), brandId: findBrand("lg"),
        specs: JSON.stringify({ Size: "24\"", Resolution: "1920 x 1080 (FHD)", "Refresh Rate": "75Hz", "Response Time": "5ms GTG", Panel: "IPS", HDR: "No", Sync: "AMD FreeSync" }),
        images: JSON.stringify(["/images/products/monitor-lg-24mp.jpg"]), isFeatured: false, isNew: false, isOnSale: false, warranty: "3 Years"
      },
      {
        name: "LG 32UN880-B 32\" 4K USB-C HDR Monitor", slug: "lg-32un880-b",
        description: "32-inch 4K UHD, 60Hz, IPS, HDR10, USB-C 96W PD, Ergo stand. Professional monitor for creators.",
        shortDesc: "32\" 4K USB-C HDR professional monitor",
        price: 245000, originalPrice: null, stock: 3, sku: "LG-32UN880",
        categoryId: findCat("monitors"), brandId: findBrand("lg"),
        specs: JSON.stringify({ Size: "32\"", Resolution: "3840 x 2160 (4K UHD)", "Refresh Rate": "60Hz", "Response Time": "5ms GTG", Panel: "IPS", HDR: "HDR10", "USB-C": "96W Power Delivery" }),
        images: JSON.stringify(["/images/products/monitor-lg-32un.jpg"]), isFeatured: false, isNew: false, isOnSale: false, warranty: "3 Years"
      },

      // ---- Peripherals (4) ----
      {
        name: "Logitech G502 Hero Gaming Mouse", slug: "logitech-g502-hero",
        description: "25600 DPI HERO sensor, 11 programmable buttons, adjustable weights, RGB. Legendary gaming mouse.",
        shortDesc: "High-DPI gaming mouse, 11 buttons",
        price: 12000, originalPrice: 14500, stock: 15, sku: "LOG-G502",
        categoryId: findCat("peripherals"), brandId: findBrand("logitech"),
        specs: JSON.stringify({ Sensor: "HERO 25K", DPI: "100-25600", Buttons: "11 Programmable", Weight: "121g (adjustable)", Cable: "Braided USB", RGB: "Yes" }),
        images: JSON.stringify(["/images/products/mouse-logitech-g502.jpg"]), isFeatured: true, isNew: false, isOnSale: true, warranty: "2 Years"
      },
      {
        name: "Razer BlackWidow V3 Mechanical Keyboard", slug: "razer-blackwidow-v3",
        description: "Green mechanical switches, full-size, RGB Chroma, wrist rest. Premium gaming keyboard.",
        shortDesc: "Mechanical gaming keyboard, RGB",
        price: 22000, originalPrice: null, stock: 8, sku: "RZR-BWV3",
        categoryId: findCat("peripherals"), brandId: findBrand("razer"),
        specs: JSON.stringify({ Switches: "Razer Green Mechanical", Layout: "Full-Size", RGB: "Chroma RGB per-key", "Key Rollover": "N-Key", "Cable Length": "1.8m USB-C", "Wrist Rest": "Included" }),
        images: JSON.stringify(["/images/products/kb-razer-bwv3.jpg"]), isFeatured: false, isNew: false, isOnSale: false, warranty: "2 Years"
      },
      {
        name: "Logitech G Pro X Gaming Headset", slug: "logitech-g-pro-x-headset",
        description: "50mm drivers, Blue VO!CE mic, USB sound card, DTS:X 7.1. Tournament-grade gaming headset.",
        shortDesc: "Pro gaming headset with Blue VO!CE",
        price: 25000, originalPrice: 28000, stock: 6, sku: "LOG-GPX-HS",
        categoryId: findCat("peripherals"), brandId: findBrand("logitech"),
        specs: JSON.stringify({ Drivers: "50mm Pro-G", Microphone: "Detachable Boom (Blue VO!CE)", Surround: "DTS:X 7.1 Virtual", Connection: "USB / 3.5mm", Weight: "320g", RGB: "No" }),
        images: JSON.stringify(["/images/products/hs-logitech-gpx.jpg"]), isFeatured: false, isNew: false, isOnSale: true, warranty: "2 Years"
      },
      {
        name: "Razer DeathAdder V2 Gaming Mouse", slug: "razer-deathadder-v2",
        description: "20000 DPI Focus+ sensor, 8 programmable buttons, Speedflex cable. Ergonomic FPS gaming mouse.",
        shortDesc: "Ergonomic FPS gaming mouse",
        price: 9000, originalPrice: null, stock: 12, sku: "RZR-DAV2",
        categoryId: findCat("peripherals"), brandId: findBrand("razer"),
        specs: JSON.stringify({ Sensor: "Focus+ 20K", DPI: "100-20000", Buttons: "8 Programmable", Weight: "82g", Cable: "Speedflex USB", RGB: "Yes" }),
        images: JSON.stringify(["/images/products/mouse-razer-da.jpg"]), isFeatured: false, isNew: false, isOnSale: false, warranty: "2 Years"
      },

      // ---- CCTV & Security (3) ----
      {
        name: "Tiandy TC-C32C 4MP IR Bullet Camera", slug: "tiandy-tc-c32c",
        description: "4MP, IR 50m, IP67, PoE, Smart IR. Professional Tiandy bullet camera for outdoor surveillance.",
        shortDesc: "4MP Tiandy bullet camera, IR 50m",
        price: 18000, originalPrice: 22000, stock: 20, sku: "TND-TC32C",
        categoryId: findCat("cctv-security"), brandId: findBrand("tiandy"),
        specs: JSON.stringify({ Resolution: "4MP (2560x1440)", "IR Range": "50m", Protection: "IP67", Power: "PoE / 12V DC", Lens: "2.8-12mm Motorized", "Smart Features": "Smart IR, WDR" }),
        images: JSON.stringify(["/images/products/cctv-tiandy-c32c.jpg"]), isFeatured: false, isNew: false, isOnSale: true, warranty: "2 Years"
      },
      {
        name: "Hikvision DS-2CD2143G2-I 4MP Dome Camera", slug: "hikvision-ds-2cd2143g2",
        description: "4MP, IR 30m, IP67, PoE, AcuSense. Hikvision dome camera with smart detection.",
        shortDesc: "4MP Hikvision dome, AcuSense AI",
        price: 25000, originalPrice: null, stock: 12, sku: "HIK-2143G2",
        categoryId: findCat("cctv-security"), brandId: findBrand("hikvision"),
        specs: JSON.stringify({ Resolution: "4MP (2560x1440)", "IR Range": "30m", Protection: "IP67", Power: "PoE / 12V DC", Lens: "2.8mm Fixed", "Smart Features": "AcuSense, WDR 120dB" }),
        images: JSON.stringify(["/images/products/cctv-hikvision-dome.jpg"]), isFeatured: false, isNew: true, isOnSale: false, warranty: "2 Years"
      },
      {
        name: "Tiandy NVR 16-Channel 4K", slug: "tiandy-nvr-16ch-4k",
        description: "16-channel NVR, 4K recording, 2x SATA, PoE switch built-in. Professional Tiandy network video recorder.",
        shortDesc: "16-ch Tiandy NVR, 4K recording",
        price: 55000, originalPrice: null, stock: 5, sku: "TND-NVR16",
        categoryId: findCat("cctv-security"), brandId: findBrand("tiandy"),
        specs: JSON.stringify({ Channels: "16", "Max Resolution": "4K (8MP)", "HDD Bays": "2x SATA (up to 10TB each)", PoE: "Built-in 16-port PoE", Network: "RJ-45 1000M", "Smart Features": "AI Search, Motion Detection" }),
        images: JSON.stringify(["/images/products/cctv-tiandy-nvr.jpg"]), isFeatured: false, isNew: false, isOnSale: false, warranty: "2 Years"
      },
    ];

    // Create all products
    const createdProducts = [];
    for (const product of productsData) {
      const p = await db.product.create({ data: product });
      createdProducts.push(p);
    }

    // ========================================================================
    // 4. SEED BANNERS - 3 homepage promotional banners
    // ========================================================================
    await db.banner.deleteMany();

    const bannersData = [
      {
        title: "Custom PC Building",
        subtitle: "Build Your Dream PC",
        description: "Configure your perfect custom PC with premium components from SL HUB COMPUTER. Expert assembly, testing, and warranty included.",
        image: null,
        link: "pc-builder",
        buttonText: "Start Building",
        bgColor: "from-blue-600 to-blue-800",
        order: 1,
        isActive: true,
      },
      {
        title: "CCTV Security Solutions",
        subtitle: "Protect What Matters",
        description: "Professional CCTV installation with Tiandy, Hikvision, and Dahua. Complete security solutions for homes and businesses in Sri Lanka.",
        image: null,
        link: "category",
        buttonText: "View CCTV",
        bgColor: "from-emerald-600 to-emerald-800",
        order: 2,
        isActive: true,
      },
      {
        title: "Laptop & PC Repair",
        subtitle: "Expert Repair Services",
        description: "Professional laptop and PC repair by certified technicians. Hardware repairs, software fixes, data recovery, and upgrades at SL HUB COMPUTER.",
        image: null,
        link: "contact",
        buttonText: "Book Repair",
        bgColor: "from-orange-600 to-red-700",
        order: 3,
        isActive: true,
      },
    ];

    for (const banner of bannersData) {
      await db.banner.create({ data: banner });
    }

    // ========================================================================
    // 5. SEED SERVICES - 6 SL HUB COMPUTER services
    // ========================================================================
    await db.service.deleteMany();

    const servicesData = [
      {
        name: "PC Parts & Repair",
        slug: "pc-parts-repair",
        description: "Complete PC parts sales and professional repair services. From component upgrades to full system diagnostics and repair.",
        icon: "Cpu",
        features: JSON.stringify(["Component Sales", "System Diagnostics", "Hardware Repair", "OS Installation", "Driver Setup", "Performance Optimization"]),
        price: "From Rs. 1,000",
        order: 1,
        isActive: true,
      },
      {
        name: "Laptop Repair",
        slug: "laptop-repair",
        description: "Expert laptop repair services for all brands. Screen replacement, keyboard repair, battery replacement, and more.",
        icon: "Laptop",
        features: JSON.stringify(["Screen Replacement", "Keyboard Repair", "Battery Replacement", "Hinge Repair", "Motherboard Repair", "Data Recovery"]),
        price: "From Rs. 2,500",
        order: 2,
        isActive: true,
      },
      {
        name: "Mobile Accessories & Repair",
        slug: "mobile-accessories-repair",
        description: "Mobile phone accessories and repair services. Screen protectors, cases, chargers, and professional screen/battery replacement.",
        icon: "Smartphone",
        features: JSON.stringify(["Screen Protectors", "Phone Cases", "Chargers & Cables", "Screen Replacement", "Battery Replacement", "Software Fixes"]),
        price: "From Rs. 500",
        order: 3,
        isActive: true,
      },
      {
        name: "CCTV Security (Tiandy)",
        slug: "cctv-security",
        description: "Professional CCTV security solutions with Tiandy, Hikvision, and Dahua systems. Installation, configuration, and monitoring setup.",
        icon: "Camera",
        features: JSON.stringify(["Site Survey", "Camera Installation", "NVR Setup", "Remote Viewing", "Night Vision Setup", "Maintenance Contracts"]),
        price: "From Rs. 15,000",
        order: 4,
        isActive: true,
      },
      {
        name: "Custom PC Building",
        slug: "custom-pc-building",
        description: "Build your dream PC with our expert guidance. We help you choose the best components and professionally assemble your custom rig.",
        icon: "Wrench",
        features: JSON.stringify(["Component Selection", "Compatibility Check", "Professional Assembly", "Cable Management", "System Testing", "Warranty Coverage"]),
        price: "Assembly from Rs. 5,000",
        order: 5,
        isActive: true,
      },
      {
        name: "Software Solutions",
        slug: "software-solutions",
        description: "Complete software solutions including OS installation, software setup, antivirus, data backup, and networking configuration.",
        icon: "Code",
        features: JSON.stringify(["OS Installation", "Software Setup", "Antivirus Setup", "Data Backup", "Network Configuration", "Remote Support"]),
        price: "From Rs. 1,500",
        order: 6,
        isActive: true,
      },
    ];

    for (const service of servicesData) {
      await db.service.create({ data: service });
    }

    // ========================================================================
    // 6. SEED SITE SETTINGS - SL HUB COMPUTER defaults
    // ========================================================================
    await db.siteSettings.upsert({
      where: { id: "site-settings" },
      update: {},
      create: {
        id: "site-settings",
        siteName: "SL HUB COMPUTER",
        tagline: "Your Trusted Tech Partner",
        description: "Premium computer parts, custom PCs, and repair services in Deiyandara, Sri Lanka",
        phone: "071 067 8944",
        email: "slhubcomputer@gmail.com",
        address: "Hakmana Road, Deiyandara, Sri Lanka",
        whatsapp: "94710678944",
        facebook: "https://www.facebook.com/profile.php?id=100063543731370",
        currency: "LKR",
        currencySymbol: "Rs.",
        shippingFee: 500,
        freeShippingAbove: 25000,
        taxRate: 0,
        openingHours: "Mon-Sat: 9AM-7PM, Sun: 10AM-5PM",
        metaTitle: "SL HUB COMPUTER - Your Trusted Tech Partner",
        metaDescription: "Shop premium computer parts, build custom PCs, and get expert repair services at SL HUB COMPUTER, Deiyandara, Sri Lanka.",
      },
    });

    // ========================================================================
    // 7. SEED PRE-BUILT PCs - 6 pre-built PC packages (NEW!)
    // ========================================================================
    await db.prebuiltPC.deleteMany();

    const prebuiltPCsData = [
      // Budget PC 1 - Entry Level
      {
        name: "SL HUB Budget Starter PC",
        slug: "slhub-budget-starter",
        description: "Perfect entry-level PC for students and home use. Handles web browsing, office work, and light gaming with ease. Great value for money with reliable components.",
        category: "budget",
        price: 85000,
        originalPrice: 95000,
        image: "/images/prebuilt/budget-starter.jpg",
        specs: JSON.stringify({
          cpu: "Intel Core i5-12400F",
          gpu: "Intel UHD 730 (Integrated)",
          ram: "16GB DDR4 3200MHz",
          storage: "512GB NVMe SSD",
          psu: "550W 80+ Bronze",
          case: "Micro-ATX Tower",
          cooler: "Stock Intel Cooler",
          motherboard: "H610M DDR4"
        }),
        features: JSON.stringify([
          "Ideal for students & home use",
          "Runs Office, browsing smoothly",
          "Light gaming capable",
          "Fast NVMe boot drive",
          "Free assembly & testing",
          "1 Year comprehensive warranty"
        ]),
        isAvailable: true,
        isFeatured: true,
        order: 1,
      },
      // Budget PC 2 - Budget Gaming
      {
        name: "SL HUB Budget Gaming PC",
        slug: "slhub-budget-gaming",
        description: "Affordable gaming PC that delivers solid 1080p performance. Play popular titles like Valorant, CS2, and League of Legends at high settings with smooth frame rates.",
        category: "budget",
        price: 145000,
        originalPrice: 158000,
        image: "/images/prebuilt/budget-gaming.jpg",
        specs: JSON.stringify({
          cpu: "Intel Core i5-14400F",
          gpu: "NVIDIA RTX 4060 8GB",
          ram: "16GB DDR4 3200MHz",
          storage: "512GB NVMe SSD",
          psu: "650W 80+ Bronze",
          case: "ATX Mid-Tower with RGB",
          cooler: "Aftermarket Air Cooler",
          motherboard: "B760M DDR4 WiFi"
        }),
        features: JSON.stringify([
          "Solid 1080p gaming performance",
          "RTX 4060 with DLSS 3 support",
          "WiFi included for easy setup",
          "RGB case with great airflow",
          "Free assembly & cable management",
          "1 Year comprehensive warranty"
        ]),
        isAvailable: true,
        isFeatured: true,
        order: 2,
      },
      // Gaming PC 1 - Mid-Range Gaming
      {
        name: "SL HUB Gaming Fighter PC",
        slug: "slhub-gaming-fighter",
        description: "Mid-range gaming powerhouse built for 1440p gaming. Equipped with RTX 4070 Super for stunning visuals and high frame rates in all modern titles.",
        category: "gaming",
        price: 250000,
        originalPrice: 270000,
        image: "/images/prebuilt/gaming-fighter.jpg",
        specs: JSON.stringify({
          cpu: "Intel Core i7-14700K",
          gpu: "NVIDIA RTX 4070 Super 12GB",
          ram: "32GB DDR5 6000MHz",
          storage: "1TB NVMe Gen4 SSD",
          psu: "750W 80+ Gold Modular",
          case: "Premium ATX Mid-Tower",
          cooler: "240mm AIO Liquid Cooler",
          motherboard: "Z790 DDR5 WiFi"
        }),
        features: JSON.stringify([
          "Excellent 1440p gaming",
          "RTX 4070 Super with DLSS 3",
          "32GB DDR5 for multitasking",
          "AIO liquid cooling for low temps",
          "Premium modular PSU",
          "2 Year comprehensive warranty"
        ]),
        isAvailable: true,
        isFeatured: true,
        order: 3,
      },
      // Gaming PC 2 - High-End Gaming
      {
        name: "SL HUB Gaming Beast PC",
        slug: "slhub-gaming-beast",
        description: "Ultimate 4K gaming rig for enthusiasts. RTX 4080 Super combined with top-tier components for uncompromised performance in every game.",
        category: "gaming",
        price: 450000,
        originalPrice: 480000,
        image: "/images/prebuilt/gaming-beast.jpg",
        specs: JSON.stringify({
          cpu: "Intel Core i9-14900K",
          gpu: "NVIDIA RTX 4080 Super 16GB",
          ram: "32GB DDR5 6400MHz RGB",
          storage: "2TB NVMe Gen4 SSD",
          psu: "850W 80+ Gold Modular",
          case: "Premium ATX Full-Tower",
          cooler: "360mm AIO Liquid Cooler RGB",
          motherboard: "Z790 DDR5 WiFi 6E"
        }),
        features: JSON.stringify([
          "Uncompromised 4K gaming",
          "RTX 4080 Super for max settings",
          "360mm AIO for cool & quiet",
          "2TB Gen4 SSD massive storage",
          "Premium RGB build",
          "3 Year comprehensive warranty"
        ]),
        isAvailable: true,
        isFeatured: true,
        order: 4,
      },
      // Office PC
      {
        name: "SL HUB Office Pro PC",
        slug: "slhub-office-pro",
        description: "Professional office PC designed for productivity. Handles multitasking, spreadsheets, presentations, and video conferencing with ease. Energy efficient and whisper quiet.",
        category: "office",
        price: 95000,
        originalPrice: null,
        image: "/images/prebuilt/office-pro.jpg",
        specs: JSON.stringify({
          cpu: "Intel Core i5-14400",
          gpu: "Intel UHD 730 (Integrated)",
          ram: "16GB DDR4 3200MHz",
          storage: "512GB NVMe SSD + 1TB HDD",
          psu: "450W 80+ Bronze",
          case: "Compact Micro-ATX",
          cooler: "Aftermarket Low-Profile Cooler",
          motherboard: "B760M DDR4 WiFi"
        }),
        features: JSON.stringify([
          "Perfect for office productivity",
          "Dual storage (SSD + HDD)",
          "WiFi for easy connectivity",
          "Compact & space-saving design",
          "Whisper quiet operation",
          "1 Year comprehensive warranty"
        ]),
        isAvailable: true,
        isFeatured: false,
        order: 5,
      },
      // Workstation
      {
        name: "SL HUB Workstation Pro PC",
        slug: "slhub-workstation-pro",
        description: "High-performance workstation for content creators, developers, and professionals. Handles video editing, 3D rendering, software development, and heavy multitasking.",
        category: "workstation",
        price: 380000,
        originalPrice: 410000,
        image: "/images/prebuilt/workstation-pro.jpg",
        specs: JSON.stringify({
          cpu: "AMD Ryzen 9 7900X",
          gpu: "NVIDIA RTX 4070 Super 12GB",
          ram: "64GB DDR5 5600MHz",
          storage: "1TB NVMe Gen4 SSD + 2TB HDD",
          psu: "850W 80+ Gold Modular",
          case: "Premium ATX Mid-Tower",
          cooler: "360mm AIO Liquid Cooler",
          motherboard: "X670E DDR5 WiFi 6E"
        }),
        features: JSON.stringify([
          "Built for content creators",
          "12-core Ryzen 9 for heavy workloads",
          "64GB RAM for multitasking",
          "RTX 4070 Super for GPU rendering",
          "Dual storage (NVMe + HDD)",
          "3 Year comprehensive warranty"
        ]),
        isAvailable: true,
        isFeatured: true,
        order: 6,
      },
    ];

    for (const pc of prebuiltPCsData) {
      await db.prebuiltPC.create({ data: pc });
    }

    // ========================================================================
    // Return success response with summary
    // ========================================================================
    return NextResponse.json({
      success: true,
      message: "Database seeded successfully for SL HUB COMPUTER",
      data: {
        categories: categories.length,
        brands: brands.length,
        products: createdProducts.length,
        banners: bannersData.length,
        services: servicesData.length,
        prebuiltPCs: prebuiltPCsData.length,
        settings: "configured",
      },
    });
  } catch (error) {
    console.error("Seed API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to seed database", details: String(error) },
      { status: 500 }
    );
  }
}
