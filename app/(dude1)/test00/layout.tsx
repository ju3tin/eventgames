import React from "react"
import type { Metadata, Viewport } from "next";
import { Inter, Rajdhani } from "next/font/google";

// import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-rajdhani",
});

export const metadata: Metadata = {
  title: "NEXUS Arena - Gamer Profiles",
  description:
    "Browse all gamer profiles on NEXUS Arena. View stats, rankings, and connect with players.",
};

export const viewport: Viewport = {
  themeColor: "#00e68a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${rajdhani.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
