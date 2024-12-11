"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[]; // Roles yang diperbolehkan untuk mengakses halaman ini
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const router = useRouter();

  useEffect(() => {
    const isLogin = localStorage.getItem("isLoginSuccess") === "true";
    const userRole = JSON.parse(localStorage.getItem("role") || "null");
    console.log("user Role : name ", userRole);
    console.log(
      "userRole",
      isLogin,
      " include ",
      allowedRoles.includes(userRole)
    );
    if (!isLogin) {
      // Jika belum login, redirect ke halaman login
      router.push("/auth/login");
    } else if (!allowedRoles.includes(userRole.role)) {
      // Jika role tidak diizinkan, redirect ke halaman 403 atau dashboard
      router.push("/"); // Halaman 403 tidak diizinkan
    }
  }, [router, allowedRoles]);

  return <>{children}</>;
};

export default ProtectedRoute;
