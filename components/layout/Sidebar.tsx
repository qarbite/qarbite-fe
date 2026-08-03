"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Settings, ClipboardCheck, Wrench, 
  BarChart3, FileText, History, Menu, X
} from "lucide-react";

const sidebarMenus = [
  { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { title: "Machines", path: "/machines", icon: Settings },
  { title: "Inspections", path: "/inspections", icon: ClipboardCheck },
  { title: "Maintenance", path: "/maintenance", icon: Wrench },
  { title: "Analytics", path: "/analytics", icon: BarChart3 },
  { title: "Reports", path: "/reports", icon: FileText },
  { title: "Activity Log", path: "/activity-log", icon: History },
];

export default function Sidebar() {
  const pathname = usePathname();
  // State untuk mengontrol sidebar di mode mobile
  const [isOpen, setIsOpen] = useState(false);

  // Menutup sidebar secara otomatis jika URL berubah (berpindah halaman di mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Tombol Hamburger (Hanya tampil di layar kecil) */}
      <button 
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-md shadow-md text-slate-600 hover:text-slate-900 transition-colors"
        aria-label="Open Menu"
      >
        <Menu size={24} />
      </button>

      {/* Overlay Gelap (Hanya tampil di mobile saat sidebar terbuka) */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-900/50 z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`
          w-64 h-screen bg-[#F8FAFC] border-r border-slate-200 flex flex-col fixed left-0 top-0 z-50
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0
        `}
      >
        {/* Logo Area & Close Button */}
        <div className="p-6 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">QARBITE</h1>
            <p className="text-xs text-slate-500 font-medium tracking-widest mt-1">INDUSTRIAL PRECISION</p>
          </div>
          {/* Tombol Close (Hanya tampil di layar kecil) */}
          <button 
            onClick={() => setIsOpen(false)}
            className="md:hidden text-slate-400 hover:text-slate-700 transition-colors"
            aria-label="Close Menu"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {sidebarMenus.map((menu) => {
            const isActive = pathname === menu.path;
            const Icon = menu.icon;
            return (
              <Link
                key={menu.path}
                href={menu.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive 
                    ? "bg-white text-blue-600 shadow-sm font-semibold" 
                    : "text-slate-600 hover:bg-slate-100 font-medium"
                }`}
              >
                <Icon size={20} className={isActive ? "text-blue-600" : "text-slate-400"} />
                <span>{menu.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-200 m-4 rounded-xl bg-white shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0">
            {/* Placeholder for User Avatar */}
            <img src="https://i.pravatar.cc/150?u=alex" alt="Alex Chen" className="w-full h-full object-cover" />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-slate-900 truncate">Alex Chen</p>
            <p className="text-xs text-slate-500 truncate">Chief Engineer</p>
          </div>
        </div>
      </aside>
    </>
  );
}