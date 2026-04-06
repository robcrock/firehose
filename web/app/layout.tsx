import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Analytics } from "@vercel/analytics/next"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Firehose — What users are saying about Libre",
  description: "Live feed of what users are saying about FreeStyle Libre apps. See the mood, spot the pain, act on what matters.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <Analytics />
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
