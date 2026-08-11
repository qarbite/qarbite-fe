export const dynamic = "force-dynamic";

import React from 'react';
import { createClient } from "@supabase/supabase-js";
import { Plus, Info, Lock } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getMaintenanceData() {
  const { data: rawAnomalies } = await supabase
    .from('anomalies')
    .select(`
      id, type, description, severity, created_at,
      inspections (
        recommendations ( action ),
        assets ( asset_code, name )
      )
    `)
    .order('created_at', { ascending: false });

  const { data: schedules } = await supabase
    .from('maintenance_schedules')
    .select('id, title, type, scheduled_date, status');

  const { data: assets } = await supabase.from('assets').select('status');
  const alerts = rawAnomalies?.map((anom: any) => {
    const inspection = Array.isArray(anom.inspections) ? anom.inspections[0] : anom.inspections;
    const asset = Array.isArray(inspection?.assets) ? inspection?.assets[0] : inspection?.assets;
    const rec = Array.isArray(inspection?.recommendations) ? inspection?.recommendations[0] : inspection?.recommendations;
    
    const isCritical = anom.severity === 'Critical' || anom.severity === 'High';

    return {
      id: anom.id,
      title: `${asset?.asset_code || 'System'} - ${anom.type}`,
      description: anom.description,
      actionRequired: isCritical,
      actionText: rec?.action || "REVIEW ISSUE"
    };
  }) || [];

  const totalAssets = assets?.length || 1;
  const opAssets = assets?.filter(a => a.status === 'OPERATIONAL').length || 0;
  const effPct = Math.round((opAssets / totalAssets) * 100);

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const calendarDays = [];
  for (let i = 0; i < 35; i++) {
    const currentDate = new Date(year, month, 1 - firstDayOfMonth + i);
    const isCurrentMonth = currentDate.getMonth() === month;
    const dateString = currentDate.toISOString().split('T')[0];
    const dayEvents = schedules?.filter(s => s.scheduled_date === dateString).map(s => {
      let style = "solid";
      if (s.type === 'preventive') style = "outline";
      if (s.type === 'general') style = "soft-blue";
      if (s.type === 'corrective') style = "solid";

      return { id: s.id, title: s.title, type: s.type, style: style };
    }) || [];

    calendarDays.push({
      date: currentDate.getDate(),
      fullDate: currentDate,
      isCurrentMonth: isCurrentMonth,
      events: dayEvents,
      locked: !isCurrentMonth
    });
  }

  return {
    alerts: alerts,
    efficiency: {
      percentage: effPct,
      text: `Fleet reliability is currently at ${effPct}%. Immediate action required on critical nodes to prevent cascading downtime.`,
      label: `${effPct}% TARGET MET`
    },
    calendarDays: calendarDays
  };
}

export default async function MaintenancePage() {
  const data = await getMaintenanceData();
  const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  
  const criticalAlertsCount = data.alerts.filter(a => a.actionRequired).length;

  return (
    <div className="flex flex-col gap-6 max-w-[1500px] mx-auto pb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-4 gap-4 md:gap-0">
        <div>
          <h2 className="text-[10px] font-bold text-amber-700 tracking-widest uppercase mb-1">System Operations</h2>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Maintenance</h1>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 justify-between sm:justify-start">
            <button className="px-4 py-1.5 bg-white shadow-sm rounded-md text-sm font-bold text-slate-800 flex-1 sm:flex-none">Month</button>
            <button className="px-4 py-1.5 text-slate-500 hover:text-slate-800 text-sm font-bold transition-colors flex-1 sm:flex-none">Week</button>
            <button className="px-4 py-1.5 text-slate-500 hover:text-slate-800 text-sm font-bold transition-colors flex-1 sm:flex-none">Day</button>
          </div>
          <button className="flex justify-center items-center gap-2 px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg transition-colors shadow-md text-sm w-full sm:w-auto">
            <Plus size={16} strokeWidth={3} /> Schedule Task
          </button>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-8 order-2 lg:order-1">
          <div>
            <h3 className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-4">View Filters</h3>
            <div className="space-y-4">
              <ToggleRow label="Upcoming Tasks" isActive={true} icon="calendar" />
              <ToggleRow label="Machine Alerts" isActive={false} icon="alert" />
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Active Alerts</h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${criticalAlertsCount > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                {criticalAlertsCount} CRITICAL
              </span>
            </div>
            <div className="space-y-4">
              {data.alerts.length > 0 ? (
                data.alerts.map((alert: any) => (
                  <AlertCard key={alert.id} alert={alert} />
                ))
              ) : (
                <p className="text-sm text-slate-400 border border-dashed border-slate-200 p-4 rounded-lg text-center">All systems nominal.</p>
              )}
            </div>
          </div>
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
        <div className="col-span-12 lg:col-span-9 order-1 lg:order-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">            
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                <div className="grid grid-cols-7 border-b border-slate-100 bg-white">
                  {weekDays.map((day) => (
                    <div key={day} className="py-4 text-center text-[11px] font-bold text-slate-500 tracking-wider">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 auto-rows-[minmax(120px,1fr)] bg-slate-100 gap-px border-b border-slate-100">
                  {data.calendarDays.map((day, idx) => {
                    const isToday = new Date().toDateString() === day.fullDate.toDateString();
                    return (
                      <div 
                        key={idx} 
                        className={`p-2 flex flex-col gap-1 transition-colors ${
                          day.isCurrentMonth 
                            ? isToday ? 'bg-blue-50/50' : 'bg-white' 
                            : 'bg-white text-slate-300'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-xs font-bold ${
                            !day.isCurrentMonth ? 'text-slate-300' : 
                            isToday ? 'text-blue-600' : 'text-slate-600'
                          }`}>
                            {day.date}
                          </span>
                          {day.locked && <Lock size={12} className="text-slate-300" />}
                        </div>
                        
                        <div className="flex flex-col gap-1 mt-1">
                          {day.events.map((event: any) => (
                            <EventChip key={event.id} event={event} />
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
            <div className="p-4 bg-white flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
              <div className="flex flex-wrap gap-4 xl:gap-6">
                <LegendItem color="bg-blue-600" label="PREVENTIVE MAINTENANCE" />
                <LegendItem color="bg-red-600" label="CORRECTIVE REPAIR" />
                <LegendItem color="bg-amber-700" label="GENERAL SERVICE" />
              </div>
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold tracking-wider">
                <Info size={14} />
                LIVE DATABASE SYNC (WIB)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm relative overflow-hidden transition-all hover:border-blue-300">
      {alert.actionRequired && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>}
      
      <h4 className="font-bold text-slate-800 text-sm mb-1">{alert.title}</h4>
      <p className="text-xs text-slate-500 leading-relaxed mb-4">{alert.description}</p>
      
      {alert.actionRequired && (
        <div className="flex justify-between items-center text-[10px] font-bold mt-2 pt-3 border-t border-slate-100">
          <span className="text-red-500 tracking-wider">ACTION REQ</span>
          <button className="text-blue-700 hover:text-blue-800 tracking-wider font-black truncate max-w-[150px]">{alert.actionText}</button>
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