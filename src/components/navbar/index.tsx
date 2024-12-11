"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  name: string;
  role: string;
};

const Navbar: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Periksa status login dan data pengguna
    const loginStatus = localStorage.getItem("isLoginSuccess") === "true";
    if (!loginStatus) {
      router.push("/auth/login");
    } else {
      // Ambil data pengguna dari localStorage
      const userData = localStorage.getItem("user");
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
  }, [router]);
  const handleLogout = () => {
    // Hapus data login dari localStorage
    localStorage.removeItem("isLoginSuccess");
    localStorage.removeItem("user");
    router.push("/auth/login");
    router.refresh(); // Reload the page to ensure all components are reset
  };

  const confirmLogout = () => {
    setShowModal(true);
  };

  const cancelLogout = () => {
    setShowModal(false);
  };

  if (!user) {
    return null; // Jangan tampilkan navbar jika pengguna belum login
  }

  return (
    <>
      <nav className="flex items-center justify-between p-4 bg-red-700 text-white">
        <div>
          <span className="font-bold">Welcome, {user.name}!</span>
          <span className="ml-4">(Role: {user.role})</span>
        </div>
        <button
          onClick={confirmLogout}
          className="px-3 py-1 bg-white text-red-700 rounded hover:bg-gray-200"
        >
          Logout
        </button>
      </nav>

      {/* Confirmation Modal */}
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
    </>
  );
};

export default Navbar;
