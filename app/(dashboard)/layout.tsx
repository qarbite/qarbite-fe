import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F4F7F9] flex">
      <Sidebar />
      <div className="flex-1 md:ml-64 flex flex-col min-w-0 transition-all duration-300">
        <Header />
        <main className="p-4 md:p-8 pt-0 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}