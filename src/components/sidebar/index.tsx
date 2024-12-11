"use client";
import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const Sidebar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [roleName, setRoleName] = useState<string | null>(null);

  useEffect(() => {
    // Periksa status login dan role_name dari localStorage
    const loginStatus = localStorage.getItem("isLoginSuccess") === "true";
    const userData = localStorage.getItem("user");
    if (loginStatus && userData) {
      const user = JSON.parse(userData);
      setRoleName(user.role);
      console.log("roleName", user.role);
    }
    setIsLoggedIn(loginStatus);

    // Jika belum login, redirect ke halaman login
    if (!loginStatus) {
      router.push("/auth/login");
    }
  }, [router]);

  if (!isLoggedIn) {
    // Jangan tampilkan apa-apa jika belum login
    return null;
  }

  // Tentukan menu berdasarkan role
  const menuItems = [
    ...(roleName === "owner" || roleName === "kasir"
      ? [{ name: "Kelola Data Transaksi", path: "/dashboard/transaksi" }]
      : []),
    ...(roleName === "owner"
      ? [
          { name: "Kelola Data Customer", path: "/dashboard/customer" },
          { name: "Kelola Data Menu", path: "/dashboard/menu" },
          { name: "Kelola Data Pegawai", path: "/dashboard/pegawai" },
          { name: "Kelola Level", path: "/dashboard/level_member" },
          { name: "Laporan Penjualan", path: "/dashboard/laporan_penjualan" },
        ]
      : []),
  ];

  return (
    <div className="flex flex-col max-w-64 min-h-screen h-full">
      <a href="/" className="bg-red-700 p-6 border-r text-white font-bold">
        Steak Tenda 2
      </a>
      <div className="bg-yellow-100 p-4 flex-grow">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <button
                onClick={() => router.push(item.path)}
                className={`block w-full text-left p-2 rounded-md ${
                  pathname === item.path ? "bg-[#ece3cd]" : " hover:bg-gray-300"
                }`}
              >
                {item.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
