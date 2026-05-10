// =============================================================================
// SL HUB COMPUTER - Database Client
// =============================================================================
// Purpose: Singleton Prisma client for database access
// Features: Environment variable fallback for Turbopack compatibility,
//           connection pooling support via pgbouncer URL
// Note: Uses Supabase PostgreSQL with connection pooling on port 6543
// =============================================================================

import { PrismaClient } from "@prisma/client";

// ---------------------------------------------------------------------------
// CRITICAL: Set DATABASE_URL env var BEFORE importing PrismaClient
// Turbopack sometimes loses env vars during HMR hot reload.
// This ensures Prisma schema validation always finds a valid URL.
// Also handles the case where the system env has a non-PostgreSQL URL
// (e.g., SQLite fallback) that would fail Prisma schema validation.
// ---------------------------------------------------------------------------
const POSTGRES_POOLER_URL =
  "postgresql://postgres.qmrhukyiralrqhaoauxb:Tharusha%40slhubcomputers@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true";
const POSTGRES_DIRECT_URL =
  "postgresql://postgres.qmrhukyiralrqhaoauxb:Tharusha%40slhubcomputers@aws-1-ap-south-1.pooler.supabase.com:5432/postgres";

if (
  !process.env.DATABASE_URL ||
  !process.env.DATABASE_URL.startsWith("postgresql://") &&
  !process.env.DATABASE_URL.startsWith("postgres://")
) {
  process.env.DATABASE_URL = POSTGRES_POOLER_URL;
}

if (
  !process.env.DIRECT_URL ||
  !process.env.DIRECT_URL.startsWith("postgresql://") &&
  !process.env.DIRECT_URL.startsWith("postgres://")
) {
  process.env.DIRECT_URL = POSTGRES_DIRECT_URL;
}

// ---------------------------------------------------------------------------
// Database URL with fallback - always ensure PostgreSQL protocol
// ---------------------------------------------------------------------------
const databaseUrl =
  process.env.DATABASE_URL?.startsWith("postgresql://") ||
  process.env.DATABASE_URL?.startsWith("postgres://")
    ? process.env.DATABASE_URL
    : POSTGRES_POOLER_URL;

// ---------------------------------------------------------------------------
// Global singleton to prevent multiple Prisma instances during dev HMR
// ---------------------------------------------------------------------------
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// ---------------------------------------------------------------------------
// Create Prisma client with optimal settings for Supabase
// ---------------------------------------------------------------------------
export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    // Log queries in development for debugging
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

// Persist client in global scope for HMR
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

// Graceful shutdown handler
if (process.env.NODE_ENV !== "production") {
  process.on("beforeExit", async () => {
    await db.$disconnect();
  });
}

export default db;
