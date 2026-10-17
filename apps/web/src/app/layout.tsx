import type { Metadata } from "next";
import { Inter, Outfit, JetBrains_Mono } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { Analytics } from "@vercel/analytics/react";
import "@/styles/globals.css";

// Self-hosted fonts, exposed as CSS variables so every picker option is real/distinct.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jbmono", display: "swap" });

export const metadata: Metadata = {
  title: "mdNinja — Navin Hill",
  description: "High-fidelity visual Markdown workbench and living canon viewer for modern engineering repositories by Navin Hill.",
  manifest: "https://media.navinhill.com/brand/site.webmanifest",
  icons: {
    icon: [
      {
        url: "https://media.navinhill.com/brand/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "https://media.navinhill.com/brand/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "https://media.navinhill.com/brand/favicon-dark-32x32.png",
        sizes: "32x32",
        type: "image/png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "https://media.navinhill.com/brand/favicon-dark-16x16.png",
        sizes: "16x16",
        type: "image/png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    shortcut: "https://media.navinhill.com/brand/favicon.ico",
    apple: [
      {
        url: "https://media.navinhill.com/brand/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  openGraph: {
    title: "mdNinja — Navin Hill",
    description: "High-fidelity visual Markdown workbench and living canon viewer for modern engineering repositories by Navin Hill.",
    siteName: "Navin Hill",
    type: "website",
    images: [
      {
        url: "https://media.navinhill.com/brand/og-image.png",
        width: 1200,
        height: 630,
        alt: "Navin Hill",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "mdNinja — Navin Hill",
    description: "High-fidelity visual Markdown workbench and living canon viewer for modern engineering repositories by Navin Hill.",
    images: ["https://media.navinhill.com/brand/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} ${jetbrainsMono.variable} ${GeistSans.variable}`}
    >
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
