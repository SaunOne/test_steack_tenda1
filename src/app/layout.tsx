"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";
import ToastProvider from "@/components/toast/toastprovider";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingLogin, setIsCheckingLogin] = useState(true); // State untuk loading
  const router = useRouter();
  const pathname = usePathname(); // Mendapatkan path saat ini

  useEffect(() => {
    try {
      const loginStatus = localStorage?.getItem("isLoginSuccess");
      const isUserLoggedIn = loginStatus === "true";
      setIsLoggedIn(isUserLoggedIn);

      if (!isUserLoggedIn && pathname !== "/auth/login") {
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error);
    } finally {
      setIsCheckingLogin(false);
    }
  }, [router, pathname]);

  // Tampilkan spinner saat masih mengecek status login
  if (isCheckingLogin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  // Jangan tampilkan Sidebar dan Navbar pada path "/"
  const showLayout = isLoggedIn && pathname !== "/";

  return (
    <html lang="en">
      <body className="antialiased">
        <div className="flex min-h-screen">
          {showLayout && <Sidebar />}
          <div className="flex flex-col flex-grow">
            {showLayout && <Navbar />}
            <main className="flex-grow overflow-y-auto p-4 h-[200rem]"></main>
            {children}
          </div>
        </div>
        <ToastProvider />
      </body>
      {/* <script src="./node_modules/preline/dist/preline.js"></script> */}
    </html>
  );
}
