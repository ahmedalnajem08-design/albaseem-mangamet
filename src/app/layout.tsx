import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#dc2626" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "AL-BASEEM | نظام إدارة التجارة",
    template: "%s | AL-BASEEM",
  },
  description: "نظام إدارة شامل للتجارة العامة - إدارة الزبائن، المهام، والتذكيرات",
  keywords: ["إدارة", "تجارة", "زبائن", "مهام", "عراق", "البصيم"],
  authors: [{ name: "AL-BASEEM Team" }],
  creator: "Ahmed Al Najem",
  publisher: "AL-BASEEM",
  
  // PWA
  manifest: "/manifest.json",
  
  // Icons
  icons: {
    icon: [
      { url: "/icons/icon-72x72.png", sizes: "72x72", type: "image/png" },
      { url: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icons/icon-128x128.png", sizes: "128x128", type: "image/png" },
      { url: "/icons/icon-144x144.png", sizes: "144x144", type: "image/png" },
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-384x384.png", sizes: "384x384", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  
  // Apple PWA
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AL-BASEEM",
  },
  
  // Open Graph
  openGraph: {
    type: "website",
    locale: "ar_IQ",
    url: "https://albaseem.vercel.app",
    siteName: "AL-BASEEM",
    title: "AL-BASEEM | نظام إدارة التجارة",
    description: "نظام إدارة شامل للتجارة العامة",
    images: [
      {
        url: "/icons/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "AL-BASEEM Logo",
      },
    ],
  },
  
  // Twitter
  twitter: {
    card: "summary_large_image",
    title: "AL-BASEEM | نظام إدارة التجارة",
    description: "نظام إدارة شامل للتجارة العامة",
    images: ["/icons/icon-512x512.png"],
  },
  
  // Other
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  
  // Categories
  category: "business",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="AL-BASEEM" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="AL-BASEEM" />
        <meta name="msapplication-TileColor" content="#dc2626" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* iOS Splash Screens */}
        <link rel="apple-touch-startup-image" href="/icons/icon-192x192.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('SW registered: ', registration);
                    },
                    function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
