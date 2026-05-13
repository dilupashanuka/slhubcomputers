# SL HUB COMPUTER - Project Overview (AI Reference)

## 🚀 Tech Stack
- **Framework**: Next.js 16+ (App Router), React 19
- **Styling**: Tailwind CSS 4, Framer Motion, Lucide Icons
- **UI Components**: Radix UI, Shadcn UI (located in `src/components/ui`)
- **Database**: PostgreSQL (Supabase) with Prisma ORM
- **State Management**: Zustand (`src/store/use-store.ts`), React Query
- **Authentication**: Next Auth & Custom Customer Auth
- **Utilities**: Nodemailer (Email), SMS Gateway integration

## 📂 Directory Structure
- `src/app`: Next.js routes (Admin, API, etc.)
- `src/components`: UI Components
  - `admin`: Dashboard & Management
  - `pc-builder`: Custom PC configurator
  - `home`: Homepage sections (Hero, Featured, etc.)
  - `products`: Product cards, details, and lists
  - `layout`: Header, Footer, Navigation
- `src/lib`: Shared logic (DB client, Chat, Analytics, Email, etc.)
- `src/store`: Global Zustand state (`slhub-store`)
- `prisma/`: Database schema and migrations

## 🛠️ Key Models (Prisma)
- `Product`: Main e-commerce entity
- `Category` & `Brand`: Classification
- `Order` & `OrderItem`: Transaction data
- `SiteSettings`: Singleton for site configuration (Colors, SEO, Contact)
- `PrebuiltPC`: Specialized model for bundled PC packages
- `Affiliate`, `Coupon`, `GiftCard`: Marketing tools
- `Customer`: Registered users

## 🔄 Global State (Zustand)
Main store: `useStore` in `src/store/use-store.ts`
- `currentView`: Manages SPA-like navigation (home, category, product, pc-builder, etc.)
- `cart`, `wishlist`, `compareList`: E-commerce state
- `customer`, `isLoggedIn`: Auth state
- `pcBuilderComponents`: Selected parts for custom builds
- `siteSettings`: Cached site configuration

## 📝 Development Notes
- **Styling**: Uses Tailwind 4 with modern CSS features.
- **Icons**: Standardized on Lucide React.
- **Data Fetching**: Primarily Server Actions and React Query for client-side state.
- **Persistence**: Zustand store is persisted in `localStorage` under key `slhub-store`.
