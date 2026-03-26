import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "GigShield | Protect Your Gig Work",
  description: "Check your fair wages and legal rights under the Telangana Gig and Platform Workers Act 2025.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GigShield",
  },
};

export const viewport = {
  themeColor: "#0e0e0e",
};

import Navbar from "@/components/Navbar";
import { BottomNav } from "@/components/BottomNav";
import PwaRegister from "@/components/PwaRegister";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-[#0e0e0e]`}>
        <Navbar />
        <main className="grow pb-24 md:pb-8">
          {children}
        </main>
        <BottomNav />
        <PwaRegister />
        <Toaster theme="dark" richColors position="top-center" />
      </body>

    </html>
  );
}
