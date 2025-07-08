import type { Metadata } from "next";
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
        <StoreProvider>
          <NotificationsProvider>{children}</NotificationsProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
