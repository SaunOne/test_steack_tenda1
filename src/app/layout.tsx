'use client';
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";
import { useEffect, useState } from "react";
import ToastProvider from "@/components/toast/toastprovider";


const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    const loginStatus = localStorage.getItem("isLoginSuccess");
    setIsLoggedIn(loginStatus === "true");
  }, []);

  return (
    <html lang="en">
      <body className="antialiased">
        <div className="flex min-h-screen">
          {isLoggedIn && <Sidebar />}
          <div className="flex flex-col flex-grow">
          {isLoggedIn && <Navbar />}
            <main>{children}</main>
          </div>
        </div>
        {/* Tambahkan ToastProvider */}
        <ToastProvider />
      </body>
    </html>
  );
}
