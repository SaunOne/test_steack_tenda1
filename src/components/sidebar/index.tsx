'use client';
import React from 'react';
import { useRouter, usePathname } from 'next/navigation';

const Sidebar: React.FC = () => {
    const router = useRouter();
    const pathname = usePathname();

    const menuItems = [
        { name: "Kelola Data Transaksi", path: "/transaksi" },
        { name: "Kelola Data Customer", path: "/customer" },
        { name: "Kelola Data Menu", path: "/menu" },
        { name: "Kelola Data Pegawai", path: "/pegawai" },
        { name: "Kelola Level", path: "/level" },
    ];

    return (
        <div className="flex flex-col max-w-64 min-h-screen h-full">
            <a href='/' className="bg-red-700 p-6 border-r text-white font-bold">
                Steak Tenda 2
            </a>
            <div className="bg-yellow-100 p-4 flex-grow">
                <ul className="space-y-2">
                    {menuItems.map((item) => (
                        <li key={item.path}>
                            <button
                                onClick={() => router.push(item.path)}
                                className={`block w-full text-left p-2 rounded-md ${pathname === item.path
                                        ? "bg-[#ece3cd]"
                                        : " hover:bg-gray-300"
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
