import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";
import ToastProvider from "@/components/toast/toastprovider";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className=" min-h-screen">
          <div className="flex flex-col flex-grow">
            <main className="flex-grow overflow-y-auto ">{children}</main>
          </div>
        </div>
        <ToastProvider />
      </body>
    </html>
  );
}
