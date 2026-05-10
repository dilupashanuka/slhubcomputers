// =============================================================================
// SL HUB COMPUTER - Robots.txt Configuration
// =============================================================================
// Purpose: Define crawler access rules for search engine bots
// Features: Allow all crawlers on public pages, block admin/api paths,
//           reference the dynamic sitemap
// =============================================================================

import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/products",
          "/categories",
          "/prebuilt-pcs",
          "/pc-builder",
          "/services",
          "/contact",
          "/about",
          "/faq",
          "/shipping",
          "/returns",
          "/terms",
        ],
        disallow: [
          "/admin/",
          "/api/",
          "/cart",
          "/checkout",
          "/_next/",
        ],
      },
    ],
    sitemap: "https://slhubcomputer.com/sitemap.xml",
  };
}
