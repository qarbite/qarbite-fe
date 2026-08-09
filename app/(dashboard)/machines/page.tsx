export const dynamic = "force-dynamic";

import React from 'react';
import { createClient } from "@supabase/supabase-js";
import { 
  Download, Plus, CheckCircle, Wrench, AlertTriangle, Clock, 
  ArrowRight, MoreHorizontal, Settings, Bot, XCircle, Monitor,
  Filter, Activity
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getMachinesData() {
  const { data: machineList, error } = await supabase
    .from('assets')
    .select('*')
    .order('status', { ascending: true });

  if (error) console.error("Error fetching machines:", error);

  const machines = machineList || [];

  const operationalCount = machines.filter(m => m.status === 'OPERATIONAL').length;
  const maintenanceCount = machines.filter(m => m.status === 'MAINTENANCE' || m.status === 'SERVICE DUE').length;
  const criticalCount = machines.filter(m => m.status === 'CRITICAL').length;
  
  const totalMachines = machines.length > 0 ? machines.length : 1;
  const healthIndex = Math.round((operationalCount / totalMachines) * 100);

  const mappedMachines = machines.map((asset) => ({
    id: asset.asset_code, 
    name: asset.name,
    location: asset.location,
    factory: asset.factory, 
    serviceAge: asset.service_age,
    maxAge: asset.max_age,
    status: asset.status,
    aiRisk: asset.ai_risk,
    riskLabel: asset.risk_label,
    icon: asset.icon
  }));

  return {
    stats: {
      healthIndex: healthIndex,
      healthTrend: "-12.5%",
      operational: operationalCount,
      maintenance: maintenanceCount,
      criticalFailures: criticalCount,
      avgResponseTime: "1.2h"
    },
    machines: mappedMachines
  };
}

export default async function MachinesPage() {
  const data = await getMachinesData();

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto pb-8">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-0">
        <div>
          <h2 className="text-xs font-bold text-slate-500 tracking-widest uppercase mb-1">Asset Management</h2>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900">Machine Inventory</h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button className="flex justify-center items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition-colors text-sm w-full sm:w-auto">
            <Download size={16} /> Export Data
          </button>
          <button className="flex justify-center items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg transition-colors text-sm shadow-md w-full sm:w-auto">
            <Plus size={16} /> Register Unit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 relative overflow-hidden flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-600 mb-2 uppercase tracking-wider">Fleet Health Index</h3>
            <p className="text-5xl font-black text-blue-700">{data.stats.healthIndex}%</p>
          </div>
          <div className="mt-8 flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="text-blue-600 flex items-center gap-1">
              ↗ {data.stats.healthTrend}
            </span> 
            vs last maintenance cycle
          </div>
          <div className="absolute top-6 right-6 w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
            <Activity size={24} className="text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 border-l-4 border-l-blue-600 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider">Operational</h3>
            <CheckCircle className="text-blue-600" size={24} />
          </div>
          <div className="mt-4 md:mt-0">
            <p className="text-4xl font-black text-slate-900">{data.stats.operational}</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Units actively running</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 border-l-4 border-l-amber-700 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider">Maintenance</h3>
            <Wrench className="text-amber-700" size={24} />
          </div>
          <div className="mt-4 md:mt-0">
            <p className="text-4xl font-black text-slate-900">{data.stats.maintenance}</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Scheduled for this week</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-red-50 rounded-xl p-4 border border-red-100 flex items-center gap-4">
          <AlertTriangle className="text-red-500" size={32} />
          <div>
            <p className="text-xl font-black text-slate-900">0{data.stats.criticalFailures}</p>
            <p className="text-[10px] font-bold text-red-600 tracking-wider uppercase">Critical Failures</p>
          </div>
        </div>
        <div className="bg-slate-100 rounded-xl p-4 border border-slate-200 flex items-center gap-4">
          <Clock className="text-slate-500" size={32} />
          <div>
            <p className="text-xl font-black text-slate-900">{data.stats.avgResponseTime}</p>
            <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Avg. Response Time</p>
          </div>
        </div>
        <div className="col-span-1 sm:col-span-2 bg-white rounded-xl p-4 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between shadow-sm gap-4 sm:gap-0">
          <div>
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">AI Failure Prediction</p>
            <p className="text-sm text-slate-500 mt-1">Neural models suggest {data.stats.criticalFailures} potential failures across active zones.</p>
          </div>
          <button className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline self-start sm:self-auto shrink-0">
            Review Alert <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-50/50 gap-4 md:gap-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full md:w-auto">
            <h3 className="font-bold text-slate-800">Machinery Fleet</h3>
            <div className="flex bg-slate-200 p-1 rounded-lg w-full sm:w-auto overflow-x-auto">
              <button className="px-4 py-1 text-xs font-bold bg-white shadow-sm rounded-md text-slate-800 whitespace-nowrap">All Units</button>
              <button className="px-4 py-1 text-xs font-bold text-slate-500 hover:text-slate-700 whitespace-nowrap">Robotics</button>
              <button className="px-4 py-1 text-xs font-bold text-slate-500 hover:text-slate-700 whitespace-nowrap">CNC Systems</button>
            </div>
          </div>
          <button className="text-slate-400 hover:text-slate-600 self-end md:self-auto">
            <Filter size={20} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-white border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-4 pl-6">ID / Machine Name</th>
                <th className="p-4">Location</th>
                <th className="p-4">Service Age</th>
                <th className="p-4">Status</th>
                <th className="p-4">AI Failure Risk</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.machines.length > 0 ? (
                data.machines.map((machine) => (
                  <tr key={machine.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 pl-6 flex items-center gap-4">
                      <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                        {machine.icon === 'cnc' && <Settings size={20} />}
                        {machine.icon === 'robot' && <Bot size={20} />}
                        {machine.icon === 'press' && <XCircle size={20} className="text-red-500" />}
                        {machine.icon === 'conveyor' && <Monitor size={20} />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{machine.id}</p>
                        <p className="text-xs text-slate-500">{machine.name}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-medium text-slate-800">{machine.location}</p>
                      <p className="text-xs text-slate-500">{machine.factory}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-bold text-slate-800 mb-1">{machine.serviceAge} Years</p>
                      <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${machine.serviceAge > 7 ? 'bg-red-500' : 'bg-blue-600'}`} 
                          style={{ width: `${(machine.serviceAge / machine.maxAge) * 100}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={machine.status} />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <RiskCircle risk={machine.aiRisk} />
                        <span className={`text-xs font-bold ${machine.aiRisk > 50 ? 'text-red-600' : machine.aiRisk > 20 ? 'text-amber-700' : 'text-slate-500'}`}>
                          {machine.riskLabel}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <button className="text-slate-400 hover:text-slate-700">
                        <MoreHorizontal size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-medium">
                    Tidak ada data mesin. Pastikan Database Supabase Anda telah terisi dan RLS dimatikan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center bg-slate-50/50 gap-4 sm:gap-0">
          <p className="text-xs text-slate-500 font-medium">Showing <strong className="text-slate-800">{data.machines.length}</strong> of <strong>{data.machines.length}</strong> assets</p>
          <div className="flex gap-1">
            <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded text-slate-400 hover:bg-slate-50 text-sm font-bold">{'<'}</button>
            <button className="w-8 h-8 flex items-center justify-center bg-blue-700 text-white rounded text-sm font-bold shadow-sm">1</button>
            <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded text-slate-400 hover:bg-slate-50 text-sm font-bold">{'>'}</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-2 bg-slate-900 rounded-xl overflow-hidden relative shadow-sm h-auto sm:h-64 border border-slate-200 flex flex-col justify-end">
           <img 
            src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80" 
            alt="Factory Floor" 
            className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-black/80 sm:from-white sm:via-white/80 to-transparent"></div>
           
           <div className="relative p-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-0 z-10">
              <div>
                <p className="text-[10px] font-bold text-blue-400 sm:text-blue-600 tracking-widest uppercase mb-1">Real-Time Telemetry</p>
                <h3 className="text-xl font-black text-white sm:text-slate-900">Factory Floor Live Monitor</h3>
              </div>
              <div className="flex gap-6 text-left sm:text-right">
                <div>
                  <p className="text-xs text-slate-300 sm:text-slate-500 font-medium">Active</p>
                  <p className="text-sm font-bold text-amber-500 sm:text-amber-700">{data.stats.operational} Points</p>
                </div>
                <div>
                  <p className="text-xs text-slate-300 sm:text-slate-500 font-medium">Connectivity</p>
                  <p className="text-sm font-bold text-blue-400 sm:text-blue-600">Stable (99%)</p>
                </div>
              </div>
           </div>
        </div>

        <div className="col-span-1 bg-blue-700 rounded-xl p-6 shadow-sm flex flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent bg-[length:10px_10px]"></div>
          
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-4">AI Predictive Maintenance</h3>
            <p className="text-blue-100 text-sm leading-relaxed">
              Our neural engine has analyzed the vibration data from Zone B. Scheduling a check today could prevent 4 hours of downtime next week.
            </p>
          </div>
          <button className="relative z-10 w-full bg-white text-blue-700 font-bold py-3 rounded-lg text-sm mt-6 hover:bg-blue-50 transition-colors shadow-sm flex justify-center items-center gap-2">
            Apply AI Recommendations <ZapIcon size={16}/>
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  let styles = "";
  let dotColor = "";

  if (status === "OPERATIONAL") {
    styles = "text-blue-700 border-blue-200 bg-blue-50";
    dotColor = "bg-blue-600";
  } else if (status === "SERVICE DUE") {
    styles = "text-amber-800 border-amber-200 bg-amber-50";
    dotColor = "bg-amber-600";
  } else if (status === "CRITICAL") {
    styles = "text-red-700 border-red-200 bg-red-50";
    dotColor = "bg-red-600";
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10px] font-bold tracking-wider ${styles}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
      {status}
    </span>
  );
}

function RiskCircle({ risk }: { risk: number }) {
  let color = "text-slate-200"; 
  let textColor = "text-slate-600";

  if (risk > 50) {
    color = "text-red-100";
    textColor = "text-red-600";
  } else if (risk > 20) {
    color = "text-amber-100";
    textColor = "text-amber-700";
  }

  return (
    <div className={`relative flex items-center justify-center shrink-0 w-8 h-8 rounded-full border-2 ${risk > 50 ? 'border-red-200' : risk > 20 ? 'border-amber-200' : 'border-slate-200'} bg-white`}>
      <span className={`text-[10px] font-bold ${textColor}`}>{risk}%</span>
    </div>
  );
}

function ZapIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
    </svg>
  )
}