import { Search, Bell, Settings } from "lucide-react";

export default function Header() {
  return (
    <header className="h-20 px-8 flex items-center justify-between bg-transparent">
      <div className="flex items-center gap-8">
        <h2 className="text-2xl font-bold text-slate-900">DASHBOARD</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search machines, parts or logs..." 
            className="w-80 pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 text-slate-400">
          <button className="hover:text-slate-600 transition-colors relative">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <button className="hover:text-slate-600 transition-colors">
            <Settings size={20} />
          </button>
        </div>
        <div className="h-6 w-px bg-slate-300"></div>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          SYSTEM STATUS
        </div>
      </div>
    </header>
  );
}