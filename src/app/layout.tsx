import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";

import { StoreProvider } from "@/store/provider";
import NotificationsProvider from "../providers/Notifications";
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
  title: "Timelapse",
  description: "Easily add and adjust photos to create a simple timelapse",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex flex-col min-h-full">
          <StoreProvider>
            <NotificationsProvider>{children}</NotificationsProvider>
          </StoreProvider>
          <div className="mt-auto text-center text-sm p-2 border-t border-neutral-200">
            Built with ❤️ by{" "}
            <Link
              href="https://github.com/nickjvm"
              className="hover:underline focus:underline"
            >
              @nickjvm
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
