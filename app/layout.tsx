import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Telugu, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSansTelugu = Noto_Sans_Telugu({
  variable: "--font-noto-telugu",
  subsets: ["telugu"],
  display: "swap",
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  variable: "--font-noto-devanagari",
  subsets: ["devanagari"],
  display: "swap",
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
import { LanguageProvider } from "@/lib/language-context";
import { AuthProvider } from "@/lib/auth-context";
import AuthModal from "@/components/AuthModal";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${notoSansTelugu.variable} ${notoSansDevanagari.variable} antialiased min-h-screen flex flex-col bg-[#0e0e0e]`}>
        <AuthProvider>
          <LanguageProvider>
            <Navbar />
            <main className="grow pb-24 md:pb-8">
              {children}
            </main>
            <BottomNav />
            <PwaRegister />
            <AuthModal />
            <Toaster theme="dark" richColors position="top-center" />
          </LanguageProvider>
        </AuthProvider>
      </body>

    </html>
  );
}
