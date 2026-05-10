# SL HUB Platform Documentation

## Overview
SL HUB is a high-performance e-commerce platform tailored for computer hardware enthusiasts and professional builders in Sri Lanka. It features a modern "Midnight Tech" aesthetic with advanced functionality.

## Core Features
1. **Interactive PC Builder**: A step-by-step wizard for configuring custom PCs with real-time compatibility checks.
2. **AI Chat Assistant**: Integrated AI (SL HUB AI) to help users with technical questions and product recommendations.
3. **Admin Dashboard**: Comprehensive management suite for inventory, orders, analytics, and site settings.
4. **Responsive Design**: 100% mobile-responsive interface optimized for all devices.
5. **SEO & Performance**: Optimized for speed (Dynamic Imports, Edge Caching) and search visibility.

## Technical Stack
- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Framer Motion
- **Backend**: Next.js Server Actions & API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: NextAuth.js
- **State Management**: Zustand
- **Media**: Cloudinary (Image hosting)

## Performance Optimizations
- **Dynamic Loading**: View components are lazy-loaded to reduce initial bundle size.
- **Server Caching**: Products API uses 30s TTL server-side caching and 60s browser caching.
- **Image Optimization**: All images are served via Cloudinary with automatic formatting (WebP/AVIF).

## Admin Credentials
- **Username**: admin
- **Password**: slhub2024 (Stored in environment variables)
