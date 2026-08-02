"use client"; // Wajib karena kita pakai usePathname untuk mendeteksi menu aktif

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClipboardCheck, Settings, User, Wrench } from 'lucide-react';
import { sidebarMenus } from '@/config/navigation'; // Import konfigurasi menu Anda

export default function TabletLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans">
      
      {/* SLIM SIDEBAR (TABLET) */}
      <aside className="w-[180px] flex-shrink-0 bg-[#F8FAFC] border-r border-slate-200 flex flex-col justify-between">
        <div>
          <div className="p-4 flex items-center gap-2 border-b border-slate-200">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs">
              <ClipboardCheck size={16} />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 leading-tight">QARBITE</h1>
              <p className="text-[9px] text-slate-500 font-medium">Industrial Precision</p>
            </div>
          </div>
          
          {/* MAPPING MENU DARI config/navigation.ts */}
          <nav className="p-2 space-y-1 mt-2">
            {sidebarMenus.map((menu) => {
              const Icon = menu.icon;
              // Trick: Jika kita sedang di /qa-form, biarkan menu Inspections tetap menyala (aktif)
              const isActive = pathname === menu.path || (pathname === '/qa-form' && menu.path === '/inspections');

              return (
                <Link 
                  key={menu.path}
                  href={menu.path} // Saat diklik, akan otomatis kembali ke layout desktop!
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-xs font-bold transition-colors ${
                    isActive 
                      ? 'bg-white text-blue-700 shadow-sm border border-slate-100' 
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-blue-700' : 'text-slate-400'} />
                  {menu.title}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-12 border-b border-slate-200 bg-white flex justify-between items-center px-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-blue-600 tracking-widest uppercase">QA Inspection Form (Tablet)</span>
          </div>
          <div className="flex items-center gap-4 text-slate-600">
            <div className="flex items-center gap-2 text-xs font-bold bg-slate-100 px-3 py-1.5 rounded-md">
              <Wrench size={14} className="text-blue-600" />
              Unit: QR-992-XP
            </div>
            <Settings size={18} className="cursor-pointer hover:text-slate-900" />
            <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden">
              <User size={14} />
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}