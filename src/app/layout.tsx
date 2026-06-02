
import type { Metadata, Viewport } from "next";
import { cn } from "@/lib/utils";
import "./globals.css";
import { Providers } from "@/components/providers";

const siteUrl = "https://joshtours.lk";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Josh Tours — Quality Car Rental in Sri Lanka",
    template: "%s | Josh Tours",
  },
  description:
    "Josh Tours offers premium car rental services in Sri Lanka. Explore our fleet of well-maintained sedans, SUVs, and vans. 24/7 support, full insurance, competitive rates.",
  keywords: [
    "car rental Sri Lanka",
    "vehicle hire Sri Lanka",
    "Josh Tours",
    "rent a car Wattala",
    "car hire Colombo",
    "SUV rental Sri Lanka",
    "affordable car rental",
    "Sri Lanka travel",
    "Colombo car rental",
    "tourist car hire Sri Lanka",
  ],
  authors: [{ name: "Josh Tours", url: siteUrl }],
  creator: "Josh Tours",
  publisher: "Josh Tours",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "en_LK",
    url: siteUrl,
    siteName: "Josh Tours",
    title: "Josh Tours — Quality Car Rental in Sri Lanka",
    description:
      "Premium car rental in Sri Lanka. Sedans, SUVs, vans with full insurance and 24/7 support. Book your ride today.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Josh Tours — Quality Car Rental in Sri Lanka",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Josh Tours — Quality Car Rental in Sri Lanka",
    description:
      "Premium car rental in Sri Lanka. Sedans, SUVs, vans with full insurance and 24/7 support.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: siteUrl,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
    other: [
      { rel: "icon", type: "image/png", sizes: "32x32", url: "/favicon-32x32.png" },
      { rel: "icon", type: "image/png", sizes: "16x16", url: "/favicon-16x16.png" },
    ],
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#c41e3a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@400;500;700&family=Iskoola+Pota&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn("min-h-screen bg-background font-body antialiased flex flex-col pt-24")}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
