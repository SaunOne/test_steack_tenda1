'use client';
import { useEffect, useState } from "react";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loginStatus = localStorage.getItem("isLoginSuccess");
    if (loginStatus !== "true") {
      // Redirect to login if not logged in
      window.location.href = '/auth/login';
    } else {
      setIsLoggedIn(true); // Set isLoggedIn to true if logged in
    }
  }, []);

  return (
    <>
      {isLoggedIn && (
        <div className="min-h-screen flex justify-center items-center bg-[#fbf9ee]">
          <h1 className="font-bold text-3xl">Welcome to Dashboard!</h1>
        </div>
      )}
    </>
  );
}
