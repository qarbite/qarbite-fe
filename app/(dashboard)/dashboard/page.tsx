export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";
import { AlertCircle, Activity, Thermometer, Zap, Wrench } from "lucide-react";
import PerformanceChart from "@/components/features/PerformanceChart";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getDashboardData() {
  const { data: assets, error: errAssets } = await supabase
    .from('assets')
    .select('status');

  if (errAssets) console.error("Error Fetch Assets:", errAssets);

  const { data: allAnomalies, error: errAnomalies } = await supabase
    .from('anomalies')
    .select(`
      id, severity, type, created_at,
      inspections (
        assets ( asset_code, name )
      )
    `)
    .order('created_at', { ascending: false });

  if (errAnomalies) console.error("Error Fetch Anomalies:", errAnomalies);

  const { data: telemetry, error: errTelemetry } = await supabase
    .from('telemetry_logs')
    .select('recorded_time, temperature, vibration')
    .order('recorded_time', { ascending: true });

  if (errTelemetry) console.error("Error Fetch Telemetry:", errTelemetry);

  const totalAssets = assets?.length || 1;
  const opCount = assets?.filter(a => a.status.toUpperCase() === 'OPERATIONAL').length || 0;
  const maintCount = assets?.filter(a => a.status.toUpperCase() === 'SERVICE DUE' || a.status.toUpperCase() === 'MAINTENANCE').length || 0;
  const offlineCount = assets?.filter(a => a.status.toUpperCase() === 'CRITICAL').length || 0;
  const idleCount = Math.max(0, totalAssets - opCount - maintCount - offlineCount);
  const totalAlerts = allAnomalies?.length || 0;
  const criticalAlerts = allAnomalies?.filter(a => a.severity === 'Critical').length || 0;

  const recentAnomalies = allAnomalies?.slice(0, 4).map((item: any) => {
    const assetData = Array.isArray(item.inspections) ? item.inspections[0]?.assets : item.inspections?.assets;
    const timeFormatted = new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    return {
      id: item.id,
      title: item.type,
      unit: `Unit #${assetData?.asset_code || 'UNK'} • ${assetData?.name || 'Unknown Asset'}`,
      time: timeFormatted,
      level: item.severity.toUpperCase(),
    };
  }) || [];

  const chartData = telemetry?.map((log: any) => ({
    time: log.recorded_time,
    temperature: Number(log.temperature),
    vibration: Number(log.vibration)
  })) || [];

  return {
    kpis: {
      activeMachines: { value: opCount, trend: "Live status" },
      pendingMaint: { value: maintCount < 10 ? `0${maintCount}` : maintCount, trend: "Scheduled units" },
      systemAlerts: { value: totalAlerts, trend: `${criticalAlerts} critical priorities` },
      avgEfficiency: { value: ((opCount / totalAssets) * 100).toFixed(1) + "%", trend: "Based on fleet status" },
    },
    fleetStats: {
      total: assets?.length || 0,
      opPct: Math.round((opCount / totalAssets) * 100),
      maintPct: Math.round((maintCount / totalAssets) * 100),
      offlinePct: Math.round((offlineCount / totalAssets) * 100),
      idlePct: Math.round((idleCount / totalAssets) * 100),
    },
    anomalies: recentAnomalies,
    telemetryChart: chartData
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto pb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard 
          title="ACTIVE MACHINES" value={data.kpis.activeMachines.value} 
          subtitle={data.kpis.activeMachines.trend} icon={<Activity className="text-blue-500" />} 
          borderColor="border-b-blue-600"
        />
        <KpiCard 
          title="PENDING MAINT." value={data.kpis.pendingMaint.value} 
          subtitle={data.kpis.pendingMaint.trend} icon={<Wrench className="text-slate-500" />} 
          subtitleColor="text-orange-600"
        />
        <KpiCard 
          title="SYSTEM ALERTS" value={data.kpis.systemAlerts.value} 
          subtitle={data.kpis.systemAlerts.trend} icon={<AlertCircle className="text-red-500" />} 
          borderColor="border-b-red-500" subtitleColor="text-red-500"
        />
        <KpiCard 
          title="AVG. EFFICIENCY" value={data.kpis.avgEfficiency.value} 
          subtitle={data.kpis.avgEfficiency.trend} icon={<Zap className="text-slate-500" />} 
          subtitleColor="text-blue-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">        
        <div className="col-span-1 lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <h3 className="font-bold text-slate-800">Performance Matrix</h3>
              <p className="text-xs text-slate-500">Real-time correlation: Temperature (°C) vs Vibration (Hz)</p>
            </div>
            <div className="flex gap-4 text-xs font-bold shrink-0">
              <span className="flex items-center gap-2 text-blue-600"><span className="w-3 h-1 bg-blue-600 rounded-full"></span> TEMP</span>
              <span className="flex items-center gap-2 text-amber-700"><span className="w-3 h-1 bg-amber-700 rounded-full border-dashed border-t"></span> VIBRATION</span>
            </div>
          </div>
          
          <PerformanceChart data={data.telemetryChart} />
        </div>

        <div className="col-span-1 bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-6">Fleet Distribution</h3>
          <div className="flex justify-center mb-8">
             <div className="w-32 h-32 rounded-lg border-[16px] border-blue-600 border-r-blue-100 border-b-slate-200 border-l-red-500 flex flex-col items-center justify-center">
               <span className="text-2xl font-bold">{data.fleetStats.total}</span>
               <span className="text-xs text-slate-500 font-bold">TOTAL</span>
             </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-600"></span> Operational</p>
              <p className="font-bold pl-4">{data.fleetStats.opPct}%</p>
            </div>
            <div>
              <p className="text-slate-500 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-700"></span> Idle</p>
              <p className="font-bold pl-4">{data.fleetStats.idlePct}%</p>
            </div>
            <div>
              <p className="text-slate-500 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500"></span> Offline</p>
              <p className="font-bold pl-4">{data.fleetStats.offlinePct}%</p>
            </div>
            <div>
              <p className="text-slate-500 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-slate-300"></span> Maint.</p>
              <p className="font-bold pl-4">{data.fleetStats.maintPct}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span> LIVE ANOMALY FEED
            </h3>
            <button className="text-blue-600 text-sm font-semibold hover:underline">Clear History</button>
          </div>
          <div className="space-y-4">
            {data.anomalies.length > 0 ? (
              data.anomalies.map((item: any) => (
                <div key={item.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 rounded-lg border border-slate-100 bg-slate-50/50 gap-4 transition-colors hover:bg-slate-50">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg shrink-0 ${item.level === 'CRITICAL' ? 'bg-red-100 text-red-500' : item.level === 'HIGH' ? 'bg-orange-100 text-orange-500' : 'bg-slate-200 text-slate-500'}`}>
                      {item.level === 'CRITICAL' ? <AlertCircle size={20} /> : item.level === 'HIGH' ? <Activity size={20} /> : <Thermometer size={20} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{item.title}</h4>
                      <p className="text-xs text-slate-500">{item.unit}</p>
                    </div>
                  </div>
                  <div className="sm:text-right flex sm:block items-center justify-between">
                    <p className="text-xs font-bold text-slate-800 sm:mb-1">{item.time}</p>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${item.level === 'CRITICAL' ? 'bg-red-100 text-red-600' : item.level === 'HIGH' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600'}`}>
                      {item.level}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-slate-500 py-8 text-sm">No active anomalies detected across the fleet.</div>
            )}
          </div>
        </div>

        <div className="col-span-1 bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex flex-col">
          <div className="h-40 bg-blue-900 rounded-lg mb-4 overflow-hidden relative">
            <img src="https://images.unsplash.com/photo-1565514020179-026b92b84bb6?auto=format&fit=crop&q=80" alt="Factory Floor" className="w-full h-full object-cover opacity-60 mix-blend-overlay" />
          </div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800">FLOOR A STATUS</h3>
            <span className="text-blue-600 text-xs font-bold">LIVE MAP</span>
          </div>
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500">Occupancy</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full">
              <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: data.kpis.avgEfficiency.value }}></div>
            </div>
          </div>
          <div className="flex justify-between items-center mb-6 text-xs">
            <span className="text-slate-500">Active Sensors</span>
            <span className="text-blue-600 font-bold">{data.kpis.activeMachines.value} Node(s)</span>
          </div>
          <button className="w-full mt-auto bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-lg text-sm transition-colors">
            OPEN SITE MANAGER
          </button>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, subtitle, icon, borderColor = "", subtitleColor = "text-blue-600" }: any) {
  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm border border-slate-200 border-b-4 ${borderColor || "border-b-transparent"}`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xs font-bold text-slate-500 tracking-wider">{title}</h3>
        {icon}
      </div>
      <h2 className="text-4xl font-black text-slate-800 mb-2">{value}</h2>
      <p className={`text-xs font-bold ${subtitleColor}`}>{subtitle}</p>
    </div>
  );
}