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
  title: "mdNinja — Zero-Constraint Living Canon",
  description: "High-fidelity visual Markdown workbench and living canon viewer for modern engineering repositories.",
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
