import React from 'react';
import { Plus, Info, Lock } from 'lucide-react';

// ============================================================================
// 1. SIMULASI FETCH DATA DARI SUPABASE
// ============================================================================
async function getMaintenanceData() {
  await new Promise(resolve => setTimeout(resolve, 300));

  return {
    alerts: [
      {
        id: "ALT-1",
        title: "Cutter-4 Pressure Drop",
        description: "Hydraulic leak detected in sub-assembly B. Immediate attention required.",
        actionRequired: true,
        actionText: "DEPLOY TEAM"
      },
      {
        id: "ALT-2",
        title: "Conveyor-12 Calibration",
        description: "Scheduled drift detected. Service window opening in 4h.",
        actionRequired: false,
        actionText: ""
      }
    ],
    efficiency: {
      percentage: 88,
      text: "Preventive maintenance is up 12% this month, reducing downtime by 4.2 hours.",
      label: "88% TARGET REACHED"
    },
    // Dummy calendar grid untuk tampilan bulan ini (5 minggu)
    calendarDays: [
      { date: 28, isCurrentMonth: false, events: [] },
      { date: 29, isCurrentMonth: false, events: [] },
      { date: 30, isCurrentMonth: false, events: [] },
      { date: 31, isCurrentMonth: false, events: [] },
      { date: 1, isCurrentMonth: true, events: [{ id: 1, title: "Preventive C...", type: "preventive", style: "outline" }] },
      { date: 2, isCurrentMonth: true, events: [] },
      { date: 3, isCurrentMonth: true, events: [] },
      { date: 4, isCurrentMonth: true, events: [] },
      { date: 5, isCurrentMonth: true, events: [{ id: 2, title: "Annual Service", type: "preventive", style: "solid" }, { id: 3, title: "Filter Swap", type: "general", style: "soft-blue" }] },
      { date: 6, isCurrentMonth: true, events: [] },
      { date: 7, isCurrentMonth: true, events: [] },
      { date: 8, isCurrentMonth: true, events: [{ id: 4, title: "Corrective R...", type: "corrective", style: "solid" }] },
      { date: 9, isCurrentMonth: true, events: [] },
      { date: 10, isCurrentMonth: true, events: [] },
      { date: 11, isCurrentMonth: true, events: [] },
      { date: 12, isCurrentMonth: true, events: [], locked: true }, 
      { date: 13, isCurrentMonth: true, events: [{ id: 5, title: "Sensor Test", type: "preventive", style: "outline" }] },
      { date: 14, isCurrentMonth: true, events: [] },
      { date: 15, isCurrentMonth: true, events: [] },
      { date: 16, isCurrentMonth: true, events: [] },
      { date: 17, isCurrentMonth: true, events: [] },
      { date: 18, isCurrentMonth: true, events: [] },
      { date: 19, isCurrentMonth: true, events: [{ id: 6, title: "Main Engine ...", type: "preventive", style: "solid" }] },
      { date: 20, isCurrentMonth: true, events: [{ id: 7, title: "Overhaul Day 2", type: "preventive", style: "solid" }] },
      { date: 21, isCurrentMonth: true, events: [] },
      { date: 22, isCurrentMonth: true, events: [] },
      { date: 23, isCurrentMonth: true, events: [{ id: 8, title: "Oil Lubrication", type: "general", style: "outline-brown" }] },
      { date: 24, isCurrentMonth: true, events: [] },
      { date: 25, isCurrentMonth: true, events: [] },
      { date: 26, isCurrentMonth: true, events: [] },
      { date: 27, isCurrentMonth: true, events: [] },
      { date: 28, isCurrentMonth: true, events: [] },
      { date: 29, isCurrentMonth: true, events: [] },
      { date: 30, isCurrentMonth: true, events: [] },
      { date: 1, isCurrentMonth: false, events: [] },
    ]
  };
}

// ============================================================================
// 2. HALAMAN UTAMA (SERVER COMPONENT)
// ============================================================================
export default async function MaintenancePage() {
  const data = await getMaintenanceData();
  const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  return (
    <div className="flex flex-col gap-6 max-w-[1500px] mx-auto pb-8">
      
      {/* HEADER SECTION */}
      {/* Diubah menjadi flex-col di mobile agar judul & tombol tidak berdesakan */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-4 gap-4 md:gap-0">
        <div>
          <h2 className="text-[10px] font-bold text-amber-700 tracking-widest uppercase mb-1">System Operations</h2>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Maintenance</h1>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
          {/* View Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 justify-between sm:justify-start">
            <button className="px-4 py-1.5 bg-white shadow-sm rounded-md text-sm font-bold text-slate-800 flex-1 sm:flex-none">Month</button>
            <button className="px-4 py-1.5 text-slate-500 hover:text-slate-800 text-sm font-bold transition-colors flex-1 sm:flex-none">Week</button>
            <button className="px-4 py-1.5 text-slate-500 hover:text-slate-800 text-sm font-bold transition-colors flex-1 sm:flex-none">Day</button>
          </div>
          {/* Schedule Button */}
          <button className="flex justify-center items-center gap-2 px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg transition-colors shadow-md text-sm w-full sm:w-auto">
            <Plus size={16} strokeWidth={3} /> Schedule Task
          </button>
        </div>
      </div>

      {/* grid-cols-12 sudah responsif secara default (stack di mobile, span di desktop) */}
      <div className="grid grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: FILTERS & ALERTS (Span 3) */}
        {/* Akan otomatis mengambil 12 kolom (penuh) di mobile, dan 3 kolom di layar besar (lg) */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-8 order-2 lg:order-1">
          
          {/* Filters */}
          <div>
            <h3 className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-4">View Filters</h3>
            <div className="space-y-4">
              <ToggleRow label="Upcoming Tasks" isActive={true} icon="calendar" />
              <ToggleRow label="Machine Alerts" isActive={false} icon="alert" />
            </div>
          </div>

          {/* Active Alerts */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Active Alerts</h3>
              <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">2 CRITICAL</span>
            </div>
            <div className="space-y-4">
              {data.alerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          </div>

          {/* Efficiency Report */}
          <div className="bg-[#0052CC] rounded-xl p-6 text-white shadow-md">
            <h3 className="font-bold text-lg mb-3">Efficiency Report</h3>
            <p className="text-blue-100 text-sm leading-relaxed mb-6">
              {data.efficiency.text}
            </p>
            <div>
              <div className="w-full bg-blue-800/50 h-1.5 rounded-full overflow-hidden mb-2">
                <div 
                  className="bg-white h-full rounded-full" 
                  style={{ width: `${data.efficiency.percentage}%` }}
                ></div>
              </div>
              <p className="text-[10px] font-bold tracking-wider">{data.efficiency.label}</p>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: CALENDAR (Span 9) */}
        {/* Akan otomatis mengambil 12 kolom (penuh) di mobile, dan 9 kolom di layar besar (lg) */}
        <div className="col-span-12 lg:col-span-9 order-1 lg:order-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
            
            {/* WRAPPER OVERFLOW: Mengizinkan scroll horizontal pada kalender di layar sempit */}
            <div className="overflow-x-auto">
              <div className="min-w-[800px]"> {/* Lebar minimal agar grid kalender tidak hancur */}
                
                {/* Calendar Header */}
                <div className="grid grid-cols-7 border-b border-slate-100 bg-white">
                  {weekDays.map((day) => (
                    <div key={day} className="py-4 text-center text-[11px] font-bold text-slate-500 tracking-wider">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 auto-rows-[minmax(120px,1fr)] bg-slate-100 gap-px border-b border-slate-100">
                  {data.calendarDays.map((day, idx) => {
                    const isHighlightedColumn = (idx % 7 === 1 || idx % 7 === 2) && day.isCurrentMonth && (day.date >= 5 && day.date <= 20);

                    return (
                      <div 
                        key={idx} 
                        className={`p-2 flex flex-col gap-1 transition-colors ${
                          day.isCurrentMonth 
                            ? isHighlightedColumn ? 'bg-[#F0F4F8]' : 'bg-white' 
                            : 'bg-white text-slate-300'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-xs font-bold ${
                            !day.isCurrentMonth ? 'text-slate-300' : 
                            (day.date === 5 || day.date === 8 || day.date === 1) ? 'text-blue-600' : 'text-slate-600'
                          }`}>
                            {day.date}
                          </span>
                          {day.locked && <Lock size={12} className="text-slate-300" />}
                        </div>
                        
                        {/* Events */}
                        <div className="flex flex-col gap-1 mt-1">
                          {day.events.map((event) => (
                            <EventChip key={event.id} event={event} />
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
                
              </div>
            </div>

            {/* Calendar Legend */}
            {/* Diubah menjadi flex-col di mobile agar tidak terpotong */}
            <div className="p-4 bg-white flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
              <div className="flex flex-wrap gap-4 xl:gap-6">
                <LegendItem color="bg-blue-600" label="PREVENTIVE MAINTENANCE" />
                <LegendItem color="bg-red-600" label="CORRECTIVE REPAIR" />
                <LegendItem color="bg-amber-700" label="GENERAL SERVICE" />
              </div>
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold tracking-wider">
                <Info size={14} />
                TIMES SHOWN IN LOCAL DEPOT (EST)
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 3. REUSABLE MICRO-COMPONENTS
// ============================================================================

function ToggleRow({ label, isActive, icon }: { label: string, isActive: boolean, icon: string }) {
  return (
    <div className="flex justify-between items-center group cursor-pointer">
      <div className="flex items-center gap-3 text-slate-600 font-semibold text-sm">
        {icon === 'calendar' ? (
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md"><Plus size={18} /></div>
        ) : (
          <div className="p-1.5 bg-red-50 text-red-500 rounded-md"><Info size={18} /></div>
        )}
        {label}
      </div>
      <div className={`w-10 h-6 rounded-full flex items-center p-1 transition-colors ${isActive ? 'bg-blue-700' : 'bg-slate-200'}`}>
        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${isActive ? 'translate-x-4' : 'translate-x-0'}`}></div>
      </div>
    </div>
  );
}

function AlertCard({ alert }: { alert: any }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm relative overflow-hidden">
      {alert.actionRequired && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>}
      
      <h4 className="font-bold text-slate-800 text-sm mb-1">{alert.title}</h4>
      <p className="text-xs text-slate-500 leading-relaxed mb-4">{alert.description}</p>
      
      {alert.actionRequired && (
        <div className="flex justify-between items-center text-[10px] font-bold mt-2 pt-3 border-t border-slate-100">
          <span className="text-red-500 tracking-wider">ACTION REQ</span>
          <button className="text-blue-700 hover:text-blue-800 tracking-wider">{alert.actionText}</button>
        </div>
      )}
    </div>
  );
}

function EventChip({ event }: { event: any }) {
  let styles = "";
  
  if (event.style === "solid") {
    styles = event.type === "corrective" ? "bg-red-600 text-white border border-red-700" : "bg-blue-600 text-white border border-blue-700";
  } else if (event.style === "outline") {
    styles = "bg-white text-blue-700 border-l-2 border-l-blue-600 border border-slate-200 shadow-sm";
  } else if (event.style === "soft-blue") {
    styles = "bg-[#E5EDF6] text-blue-800 border border-blue-100";
  } else if (event.style === "outline-brown") {
    styles = "bg-amber-50 text-amber-800 border-l-2 border-l-amber-700 border border-amber-100 shadow-sm";
  }

  return (
    <div className={`text-[10px] font-bold px-1.5 py-1 rounded-sm truncate ${styles}`}>
      {event.title}
    </div>
  );
}

function LegendItem({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 ${color} rounded-sm`}></div>
      <span className="text-[9px] font-bold text-slate-500 tracking-widest">{label}</span>
    </div>
  );
}