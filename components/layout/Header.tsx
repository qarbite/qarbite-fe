import { Search, Bell, Settings } from "lucide-react";

export default function Header() {
  return (
    <header className="h-16 md:h-20 px-4 pl-20 md:px-8 flex items-center justify-between bg-transparent gap-4">      {/* KIRI: Judul & Pencarian */}
      <div className="flex items-center gap-4 md:gap-8 flex-1 md:flex-none">
        {/* Judul disembunyikan di layar kecil (tampil mulai ukuran tablet/md) */}
        <h2 className="hidden md:block text-xl md:text-2xl font-bold text-slate-900">
          DASHBOARD
        </h2>
        
        {/* Search Bar - Fleksibel di layar kecil, statis di desktop */}
        <div className="relative w-full max-w-md md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search machines..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      {/* KANAN: Ikon & Status */}
      <div className="flex items-center gap-3 md:gap-6 shrink-0">
        <div className="flex items-center gap-3 md:gap-4 text-slate-400">
          <button className="hover:text-slate-600 transition-colors relative">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <button className="hover:text-slate-600 transition-colors hidden sm:block">
            <Settings size={20} />
          </button>
        </div>
        
        {/* Garis Pemisah (Disembunyikan di mobile ekstra kecil) */}
        <div className="hidden sm:block h-6 w-px bg-slate-300"></div>
        
        {/* System Status (Teks disembunyikan di mobile, hanya indikator warna yang tampil) */}
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <span className="w-2 h-2 rounded-full bg-green-500 shrink-0"></span>
          <span className="hidden sm:block">SYSTEM STATUS</span>
        </div>
      </div>
    </header>
  );
}