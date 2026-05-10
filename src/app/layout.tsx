import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SL HUB COMPUTER - Your Trusted Tech Partner",
  description:
    "Shop premium computer parts, build custom PCs, and get expert repair services at SL HUB COMPUTER, Deiyandara, Sri Lanka.",
  keywords: [
    "SL HUB COMPUTER",
    "computer store",
    "custom PC",
    "PC builder",
    "Sri Lanka",
    "Deiyandara",
    "computer parts",
    "CCTV",
    "laptop repair",
  ],
  authors: [{ name: "SL HUB COMPUTER" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "SL HUB COMPUTER - Your Trusted Tech Partner",
    description:
      "Premium computer parts, custom PCs, and repair services in Deiyandara, Sri Lanka.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
