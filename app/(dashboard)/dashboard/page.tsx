import { AlertCircle, Activity, Thermometer, Zap, Settings as SettingsIcon, Wrench } from "lucide-react";

// 1. SIMULASI FETCH DATA DARI SUPABASE
async function getDashboardData() {
  // Dalam realita, di sini Anda memanggil: await supabase.from('...').select('*')
  return {
    kpis: {
      activeMachines: { value: 124, trend: "+3 since last shift", status: "good" },
      pendingMaint: { value: "08", trend: "2 Critical Priority", status: "warning" },
      systemAlerts: { value: 12, trend: "3 unresolved anomalies", status: "critical" },
      avgEfficiency: { value: "94.2%", trend: "Within optimal range", status: "good" },
    },
    anomalies: [
      { id: 1, title: "Hydraulic Pressure Spike", unit: "Unit #TX-890 • Hydraulic Station A", time: "JUST NOW", level: "CRITICAL" },
      { id: 2, title: "Harmonic Variance", unit: "Unit #LX-102 • Milling Section", time: "12 MIN AGO", level: "WARNING" },
      { id: 3, title: "Thermal Threshold Warning", unit: "Unit #MX-450 • Assembly Line 4", time: "45 MIN AGO", level: "INFO" },
    ]
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="flex flex-col gap-6">
      
      {/* ROW 1: KPI CARDS */}
      <div className="grid grid-cols-4 gap-6">
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

      {/* ROW 2: CHARTS */}
      <div className="grid grid-cols-3 gap-6">
        {/* Main Chart (Placeholder for Recharts/Chart.js) */}
        <div className="col-span-2 bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-bold text-slate-800">Performance Matrix</h3>
              <p className="text-xs text-slate-500">Real-time correlation: Temperature (°C) vs Vibration (Hz)</p>
            </div>
            <div className="flex gap-4 text-xs font-bold">
              <span className="flex items-center gap-2 text-blue-600"><span className="w-3 h-1 bg-blue-600 rounded-full"></span> TEMP</span>
              <span className="flex items-center gap-2 text-amber-700"><span className="w-3 h-1 bg-amber-700 rounded-full border-dashed border-t"></span> VIBRATION</span>
            </div>
          </div>
          <div className="h-64 w-full bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center text-slate-400 text-sm">
            [ Area untuk Komponen Grafik Garis (Gunakan Recharts) ]
          </div>
        </div>

        {/* Fleet Distribution */}
        <div className="col-span-1 bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-6">Fleet Distribution</h3>
          <div className="flex justify-center mb-8">
             <div className="w-32 h-32 rounded-lg border-[16px] border-blue-600 border-r-blue-100 border-b-slate-200 border-l-red-500 flex flex-col items-center justify-center">
               <span className="text-2xl font-bold">124</span>
               <span className="text-xs text-slate-500 font-bold">TOTAL</span>
             </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-600"></span> Operational</p>
              <p className="font-bold pl-4">88%</p>
            </div>
            <div>
              <p className="text-slate-500 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-700"></span> Idle</p>
              <p className="font-bold pl-4">7%</p>
            </div>
            <div>
              <p className="text-slate-500 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500"></span> Offline</p>
              <p className="font-bold pl-4">5%</p>
            </div>
            <div>
              <p className="text-slate-500 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-slate-300"></span> Maint.</p>
              <p className="font-bold pl-4">3%</p>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 3: LISTS & MAP */}
      <div className="grid grid-cols-3 gap-6">
        {/* Live Anomaly Feed */}
        <div className="col-span-2 bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span> LIVE ANOMALY FEED
            </h3>
            <button className="text-blue-600 text-sm font-semibold hover:underline">Clear History</button>
          </div>
          <div className="space-y-4">
            {data.anomalies.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-4 rounded-lg border border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${item.level === 'CRITICAL' ? 'bg-red-100 text-red-500' : item.level === 'WARNING' ? 'bg-orange-100 text-orange-500' : 'bg-slate-200 text-slate-500'}`}>
                    {item.level === 'CRITICAL' ? <AlertCircle size={20} /> : item.level === 'WARNING' ? <Activity size={20} /> : <Thermometer size={20} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{item.title}</h4>
                    <p className="text-xs text-slate-500">{item.unit}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-800 mb-1">{item.time}</p>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${item.level === 'CRITICAL' ? 'bg-red-100 text-red-600' : item.level === 'WARNING' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600'}`}>
                    {item.level}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Floor Status */}
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
              <div className="bg-blue-600 h-1.5 rounded-full w-[85%]"></div>
            </div>
          </div>
          <div className="flex justify-between items-center mb-6 text-xs">
            <span className="text-slate-500">Sensor Mesh</span>
            <span className="text-blue-600 font-bold">Active (99.8%)</span>
          </div>
          <button className="w-full mt-auto bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-lg text-sm transition-colors">
            OPEN SITE MANAGER
          </button>
        </div>
      </div>

    </div>
  );
}

// 2. KOMPONEN KECIL: REUSABLE KPI CARD
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