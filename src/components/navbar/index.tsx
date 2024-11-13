'use client';
import React, { useCallback, useState } from "react";
import { useRouter } from 'next/navigation';
import Image from "next/image";

const Navbar: React.FC = () => {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const handleLogout = useCallback(() => {
    if (typeof window !== "undefined") {
      // Remove login status from localStorage
      localStorage.setItem("isLoginSuccess", "false");
      // Redirect to dashboard or login page
      router.push("/");
      // Force a full page reload to clear client-side state
      window.location.reload();
    }
  }, [router]);

  const confirmLogout = () => {
    setShowModal(true); // Show the confirmation modal
  };

  const cancelLogout = () => {
    setShowModal(false); // Hide the confirmation modal if user cancels
  };

  return (
    <>
      <nav className="flex items-center justify-end p-4 bg-red-700 text-white">
        <div className="flex items-center space-x-4">
          <span>Welcome, User!</span>
          {/* Uncomment to add profile image */}
          {/* <Image
            src="/profile.jpg"
            alt="Profile"
            width={40}
            height={40}
            className="rounded-full"
          /> */}
          <button
            onClick={confirmLogout}
            className="px-3 py-1 bg-white text-red-700 rounded hover:bg-gray-200"
          >
            Logout
          </button>
        </div>
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
