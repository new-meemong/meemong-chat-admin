import "./globals.css";

import { Geist, Geist_Mono } from "next/font/google";

import type { Metadata } from "next";
import Providers from "./providers";
import SideNavigation from "@/components/side-navigation";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: "채팅 어드민",
  description: "채팅 어드민"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <div className="flex">
            <SideNavigation />
            <main className="flex-1 p-2 md:p-8 md:ml-64">{children}</main>
          </div>
          <Toaster position="top-center" />
        </Providers>
      </body>
    </html>
  );
}
