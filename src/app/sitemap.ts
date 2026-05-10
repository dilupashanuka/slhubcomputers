// =============================================================================
// SL HUB COMPUTER - Dynamic Sitemap
// =============================================================================
// Purpose: Generate a dynamic sitemap listing all products, categories,
//          prebuilt PCs, services, and static pages for SEO crawlers.
// Features: Auto-generated URLs from database, proper change frequencies,
//           priority ordering, and lastModified timestamps
// =============================================================================

import { MetadataRoute } from "next";
import { db } from "@/lib/db";

const BASE_URL = "https://slhubcomputer.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    // -------------------------------------------------------------------------
    // Fetch all dynamic content from the database in parallel
    // -------------------------------------------------------------------------
    const [products, categories, prebuiltPCs, services, pageContents] =
      await Promise.all([
        db.product.findMany({
          where: { stock: { gt: 0 } },
          select: { slug: true, updatedAt: true },
        }),
        db.category.findMany({
          where: { isActive: true },
          select: { slug: true, updatedAt: true },
        }),
        db.prebuiltPC.findMany({
          where: { isAvailable: true },
          select: { slug: true, updatedAt: true },
        }),
        db.service.findMany({
          where: { isActive: true },
          select: { slug: true, updatedAt: true },
        }),
        db.pageContent.findMany({
          where: { isActive: true },
          select: { slug: true, updatedAt: true },
        }),
      ]);

    // -------------------------------------------------------------------------
    // Static pages with fixed priorities
    // -------------------------------------------------------------------------
    const staticPages: MetadataRoute.Sitemap = [
      {
        url: BASE_URL,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1.0,
      },
      {
        url: `${BASE_URL}/products`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.9,
      },
      {
        url: `${BASE_URL}/categories`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      },
      {
        url: `${BASE_URL}/prebuilt-pcs`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      },
      {
        url: `${BASE_URL}/pc-builder`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      },
      {
        url: `${BASE_URL}/services`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      },
      {
        url: `${BASE_URL}/contact`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
      },
      {
        url: `${BASE_URL}/about`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
      },
      {
        url: `${BASE_URL}/faq`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.5,
      },
      {
        url: `${BASE_URL}/cart`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.4,
      },
    ];

    // -------------------------------------------------------------------------
    // Product pages
    // -------------------------------------------------------------------------
    const productPages: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${BASE_URL}/products/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    // -------------------------------------------------------------------------
    // Category pages
    // -------------------------------------------------------------------------
    const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
      url: `${BASE_URL}/categories/${category.slug}`,
      lastModified: category.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    // -------------------------------------------------------------------------
    // Prebuilt PC pages
    // -------------------------------------------------------------------------
    const prebuiltPCPages: MetadataRoute.Sitemap = prebuiltPCs.map((pc) => ({
      url: `${BASE_URL}/prebuilt-pcs/${pc.slug}`,
      lastModified: pc.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    // -------------------------------------------------------------------------
    // Service pages
    // -------------------------------------------------------------------------
    const servicePages: MetadataRoute.Sitemap = services.map((service) => ({
      url: `${BASE_URL}/services/${service.slug}`,
      lastModified: service.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

    // -------------------------------------------------------------------------
    // Static content pages (shipping, returns, terms, etc.)
    // -------------------------------------------------------------------------
    const contentPages: MetadataRoute.Sitemap = pageContents.map((page) => ({
      url: `${BASE_URL}/${page.slug}`,
      lastModified: page.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));

    // -------------------------------------------------------------------------
    // Combine and return all sitemap entries
    // -------------------------------------------------------------------------
    return [
      ...staticPages,
      ...productPages,
      ...categoryPages,
      ...prebuiltPCPages,
      ...servicePages,
      ...contentPages,
    ];
  } catch (error) {
    console.error("Sitemap generation error:", error);

    // Fallback to static pages only if database fetch fails
    return [
      {
        url: BASE_URL,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1.0,
      },
      {
        url: `${BASE_URL}/products`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.9,
      },
      {
        url: `${BASE_URL}/contact`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
      },
    ];
  }
}
