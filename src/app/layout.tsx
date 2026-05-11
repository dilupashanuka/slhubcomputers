import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { PwaRegister } from "@/components/pwa-register";
import { ReactQueryProvider } from "@/lib/react-query-provider";
import { ThemeProvider as CustomThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://slhubcomputer.com";
const SITE_NAME = "SL HUB COMPUTER";
const SITE_TITLE = "SL HUB COMPUTER - Your Trusted Tech Partner";
const SITE_DESCRIPTION =
  "Shop premium computer parts, build custom PCs, and get expert repair services at SL HUB COMPUTER, Deiyandara, Sri Lanka. Best prices on processors, GPUs, RAM, storage & more.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "SL HUB COMPUTER",
    "computer store Sri Lanka",
    "custom PC builder",
    "PC builder Sri Lanka",
    "Deiyandara computer shop",
    "computer parts Sri Lanka",
    "CCTV Sri Lanka",
    "laptop repair Sri Lanka",
    "gaming PC Sri Lanka",
    "buy computer parts online",
    "GPU Sri Lanka",
    "processor Sri Lanka",
    "RAM Sri Lanka",
    "SSD Sri Lanka",
    "motherboard Sri Lanka",
    "prebuilt PC Sri Lanka",
    "PC repair Deiyandara",
    "tech store Sri Lanka",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "technology",
  classification: "E-Commerce",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    locale: "en_LK",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: SITE_TITLE,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [`${SITE_URL}/og-image.png`],
    creator: "@slhubcomputer",
  },
  verification: {
    google: "google-site-verification-code",
  },
};

export const viewport: Viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="SL HUB" />
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https://qmrhukyiralrqhaoauxb.supabase.co https://*.supabase.co; connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com https://qmrhukyiralrqhaoauxb.supabase.co https://*.supabase.co wss://qmrhukyiralrqhaoauxb.supabase.co;"
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ReactQueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <CustomThemeProvider>
              {children}
              <Toaster />
              <PwaRegister />
            </CustomThemeProvider>
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
