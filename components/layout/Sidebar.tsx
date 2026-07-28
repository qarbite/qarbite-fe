"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Settings, ClipboardCheck, Wrench, 
  BarChart3, FileText, History 
} from "lucide-react";

const sidebarMenus = [
  { title: "Dashboard", path: "/", icon: LayoutDashboard },
  { title: "Machines", path: "/machines", icon: Settings },
  { title: "Inspections", path: "/inspections", icon: ClipboardCheck },
  { title: "Maintenance", path: "/maintenance", icon: Wrench },
  { title: "Analytics", path: "/analytics", icon: BarChart3 },
  { title: "Reports", path: "/reports", icon: FileText },
  { title: "Activity Log", path: "/activity-log", icon: History },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-[#F8FAFC] border-r border-slate-200 flex flex-col fixed left-0 top-0">
      {/* Logo Area */}
      <div className="p-6">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">QARBITE</h1>
        <p className="text-xs text-slate-500 font-medium tracking-widest mt-1">INDUSTRIAL PRECISION</p>
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
        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
          {/* Placeholder for User Avatar */}
          <img src="https://i.pravatar.cc/150?u=alex" alt="Alex Chen" className="w-full h-full object-cover" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900">Alex Chen</p>
          <p className="text-xs text-slate-500">Chief Engineer</p>
        </div>
      </div>
    </aside>
  );
}