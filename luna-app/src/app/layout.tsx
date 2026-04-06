import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";
import { SkipToMainLink } from "@/components/shared/SkipToMainLink";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
});

const body = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXTAUTH_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Luna — Cycle Tracker",
  description: "Your body's rhythm, understood.",
  applicationName: "Luna",
  icons: {
    apple: [{ url: "/icon", type: "image/png", sizes: "192x192" }],
  },
  appleWebApp: {
    capable: true,
    title: "Luna",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "Luna — Cycle Tracker",
    description: "Your body's rhythm, understood.",
    type: "website",
    locale: "en_US",
    siteName: "Luna",
    images: [{ url: "/icon", type: "image/png", width: 512, height: 512, alt: "Luna" }],
  },
  twitter: {
    card: "summary",
    title: "Luna — Cycle Tracker",
    description: "Your body's rhythm, understood.",
  },
};

/** Mobile / PWA / iOS: edge-to-edge safe areas + status bar tint */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#c97b7b" },
    { media: "(prefers-color-scheme: dark)", color: "#1e1429" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${geistMono.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground antialiased [padding-top:env(safe-area-inset-top,0px)]">
        <SkipToMainLink />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
