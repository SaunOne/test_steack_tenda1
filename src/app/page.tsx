"use client";

import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  FaUserCircle,
  FaShoppingCart,
  FaStar,
  FaGift,
  FaPercentage,
} from "react-icons/fa";

type Customer = {
  pelanggan_id: number;
  name: string;
  points: number;
  levelMember: {
    name: string;
  };
};

type Product = {
  menu_id: number;
  name: string;
  description: string;
  price: number;
  stok: number;
};

type LevelMember = {
  level_member_id: number;
  name: string;
  minimum_point: number;
  diskon: number;
};

const HomePage = () => {
  const [topCustomers, setTopCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [levelMember, setLevelMember] = useState<LevelMember[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const handleLogout = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("isLoginSuccess", "false");
      router.push("/");
      window.location.reload();
    }
  }, [router]);

  const confirmLogout = () => {
    setShowModal(true);
  };

  const cancelLogout = () => {
    setShowModal(false);
  };

  useEffect(() => {
    const loginStatus = localStorage?.getItem("isLoginSuccess");
    const isUserLoggedIn = loginStatus === "true";
    setIsLoggedIn(isUserLoggedIn);
    const fetchData = async () => {
      try {
        const [customersRes, productsRes, levelsRes] = await Promise.all([
          fetch("/api/home"),
          fetch("/api/menu"),
          fetch("/api/level_member"),
        ]);

        const customers = await customersRes.json();
        const products = await productsRes.json();
        const levels = await levelsRes.json();

        setTopCustomers(customers);
        setProducts(products);
        setLevelMember(levels);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Failed to load data.");
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <nav className="bg-red-600 text-white p-4 shadow-md flex justify-between items-center">
        <div className="text-2xl font-bold">SteakTenda</div>
        <div className="flex items-center gap-6">
          <a href="/transaksi" className="hover:underline text-lg">
            Admin
          </a>
          {isLoggedIn ? (
            <button
              onClick={confirmLogout}
              className="px-3 py-1 bg-white text-red-700 rounded hover:bg-gray-200"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => {
                setIsLoggedIn(true);
                router.push("/dashboard");
              }}
              className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded-lg font-semibold"
            >
              Login
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="mt-2 bg-gradient-to-r from-red-600 to-yellow-500 text-white py-20 px-10 rounded-b-3xl shadow-lg relative overflow-hidden">
        <h1 className="text-5xl font-extrabold mb-4 animate-pulse">
          Welcome to SteakTenda
        </h1>
        <p className="text-xl font-medium">
          Your trusted partner for quality products and services.
        </p>
        <div className="absolute bottom-0 right-0 opacity-30">
          <FaShoppingCart size={300} />
        </div>
      </div>

      {/* Scrollable Content Wrapper */}
      <div className="flex-grow overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Column 1 */}
        <div className="space-y-12">
          {/* Level Members */}
          {levelMember.length > 0 && (
            <div>
              <h2 className="text-3xl font-bold text-start mb-6">
                Level Members
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {levelMember.map((level, index) => (
                  <div
                    key={level.level_member_id}
                    className="bg-white shadow-lg rounded-lg p-6 flex flex-col items-center transform hover:scale-105 transition-transform duration-200 border border-gray-200"
                  >
                    <div className="bg-red-100 text-red-600 p-4 rounded-full mb-4">
                      {index % 2 === 0 ? (
                        <FaStar size={30} />
                      ) : (
                        <FaGift size={30} />
                      )}
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-bold mb-2">{level.name}</h3>
                      <p className="text-sm text-gray-500 mb-2">
                        Diskon:{" "}
                        <span className="font-semibold">{level.diskon}%</span>
                      </p>
                      <p className="text-sm text-gray-500">
                        Minimum Poin:{" "}
                        <span className="font-semibold">
                          {level.minimum_point}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Customers */}
          <div>
            <h2 className="text-3xl font-bold text-start mb-6">
              Top Customers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {topCustomers.map((customer) => (
                <div
                  key={customer.pelanggan_id}
                  className="bg-gradient-to-r from-yellow-100 to-red-100 shadow-lg rounded-lg p-6 flex items-center space-x-4 hover:shadow-xl transition-shadow border border-gray-200"
                >
                  <FaUserCircle className="text-red-600 text-5xl" />
                  <div>
                    <h3 className="text-2xl font-bold text-red-700">
                      {customer.name}
                    </h3>
                    <p className="text-lg text-gray-700">
                      Points:{" "}
                      <span className="font-semibold">{customer.points}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 2 */}
        <div>
          {/* Top Products */}
          <h2 className="text-3xl font-bold text-start mb-6">Top Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {products.map((product) => (
              <div
                key={product.menu_id}
                className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <img
                  src="https://www.sasa.co.id/medias/page_medias/cara_membuat_steak_daging.jpg"
                  alt={product.name}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-xl font-bold text-red-700">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-red-600">
                      Rp {product.price.toLocaleString()}
                    </span>
                    <FaShoppingCart className="text-red-600 text-2xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-4 text-center">
        &copy; 2024 SteakTenda. All rights reserved.
      </footer>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg text-center space-y-4">
            <p>Are you sure you want to log out?</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Yes, Logout
              </button>
              <button
                onClick={cancelLogout}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
