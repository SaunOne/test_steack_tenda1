// pages/login.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation"; // Adjusted for Next.js's latest router API
import toast from "react-hot-toast";

export default function Login() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      // Send login request to API

      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      console.log(response);
      if (response.ok) {
        const data = await response.json();

        // Save the token in local storage
        localStorage.setItem("isLoginSuccess", "true");
        console.log("Login successful:", data);
        toast.success("Login Berhasil!");
        // Redirect to the dashboard on successful login
        router.push("/home");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Invalid username or password.");
        toast.error("Invalid Username dan Password!");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-red-700 text-white py-4 text-center">
        <h1 className="text-2xl font-semibold">Steak Tenda 2</h1>
      </header>

      {/* Login Form */}
      <main className="flex-grow flex items-center justify-center bg-gray-100">
        <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-center text-red-700 mb-6">
            Login
          </h2>

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          <form onSubmit={handleSubmit}>
            {/* Username Field */}
            <div className="mb-4">
              <label
                htmlFor="username"
                className="block text-gray-700 font-semibold mb-2"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Password Field */}
            <div className="mb-6">
              <label
                htmlFor="password"
                className="block text-gray-700 font-semibold mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-red-700 text-white py-2 rounded-lg font-semibold hover:bg-red-800 transition duration-200"
            >
              Login
            </button>
          </form>

          {/* Optional Forgot Password Link */}
          <div className="text-center mt-4">
            <a href="#" className="text-sm text-red-700 hover:underline">
              Forgot Password?
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
