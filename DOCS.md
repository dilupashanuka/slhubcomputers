# SL HUB COMPUTER - Project Documentation

## 1. Project Overview
**SL HUB COMPUTER** is a high-performance, premium e-commerce platform and business management system tailored for the Sri Lankan computer hardware and repair market. It features a stunning "Midnight Tech" aesthetic with advanced performance optimizations.

---

## 2. Key Features

### 🌐 Public Website (Customer Facing)
*   **Premium UI/UX**: Modern dark-themed design using Framer Motion for smooth transitions and micro-interactions.
*   **Advanced PC Builder**: A step-by-step wizard that allows users to configure custom PCs with real-time price updates and compatibility checks.
*   **Dynamic Product Catalog**: Filterable and searchable inventory with category and brand-based navigation.
*   **WhatsApp Integration**: "Floating" WhatsApp button and specialized inquiry forms for seamless customer communication.
*   **Service Showcases**: Dedicated sections for CCTV Installation, Laptop Repair, and PC Maintenance.
*   **Mobile Optimized**: 100% responsive design ensuring a perfect experience on any device.

### 📊 Admin Dashboard (Business Management)
*   **Real-time Analytics**: Visualized data for revenue trends, order status distribution, and top-selling products.
*   **Inventory Management**: Complete control over Products, Categories, Brands, and Pre-built PCs.
*   **Order Tracking**: Centralized management system to view, update, and manage customer orders.
*   **Message Center**: Unified inbox for customer inquiries and service requests.
*   **Dynamic Site Settings**:
    *   **Facebook Sync**: Automatically synchronizes business hours and contact info from social media.
    *   **Logo & Map Management**: Upload business logos and embed Google Maps directly from the admin panel.
    *   **Storage**: Integrated with Supabase Storage for high-speed image delivery.

---

## 3. Technical Architecture
*   **Framework**: Next.js 15 (App Router)
*   **Styling**: Tailwind CSS & Framer Motion
*   **Database**: Supabase PostgreSQL (via Prisma ORM)
*   **Storage**: Supabase Bucket with WebP image optimization
*   **Authentication**: NextAuth.js
*   **Speed Optimizations**:
    *   **Dynamic Imports**: Code-splitting for faster initial page loads.
    *   **API Caching**: Edge-caching for product data to reduce latency.
    *   **Static Assets**: Optimized WebP image delivery to reduce bandwidth usage.
