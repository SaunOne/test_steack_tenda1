import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-col flex-grow">
        <Navbar />
        <main className="flex-grow overflow-y-auto p-4">{children}</main>
      </div>
    </div>
  );
}
