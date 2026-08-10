export const dynamic = "force-dynamic";

import React from 'react';
import { createClient } from "@supabase/supabase-js";
import { 
  ArrowRight, CheckCircle2, Clock, AlertTriangle, 
  Plus
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getAnalyticsData() {
  const { data: assets, error: errAssets } = await supabase
    .from('assets')
    .select('*');

  if (errAssets) console.error("Error Fetching Assets:", errAssets);
  const safeAssets = assets || [];

  const { data: recommendations, error: errRecs } = await supabase
    .from('recommendations')
    .select(`
      id, action, priority, estimated_time_to_failure,
      inspections (
        assets ( asset_code )
      )
    `)
    .order('created_at', { ascending: false })
    .limit(3);

  if (errRecs) console.error("Error Fetching Recommendations:", errRecs);

  const { data: anomalies, error: errAnomalies } = await supabase
    .from('anomalies')
    .select('created_at');

  if (errAnomalies) console.error("Error Fetching Anomalies:", errAnomalies);

  const rulData = safeAssets.map((asset) => {
    const daysLeft = Math.max(0, Math.round((asset.max_age - asset.service_age) * 365));
    const xPos = Math.min(95, Math.max(5, (asset.service_age / asset.max_age) * 100));
    const yPos = Math.min(90, Math.max(10, 100 - asset.ai_risk));

    let rulStatus = "Operational";
    if (asset.status === 'CRITICAL') rulStatus = "Critical";
    else if (asset.status === 'SERVICE DUE' || asset.status === 'MAINTENANCE') rulStatus = "Warning";

    return {
      id: asset.asset_code,
      days: daysLeft,
      status: rulStatus,
      x: xPos,
      y: yPos
    };
  });

  const insights = recommendations?.map((rec: any) => {
    let color = "blue";
    if (rec.priority === 'HIGH PRIORITY') color = "red";
    else if (rec.priority === 'INVENTORY ALERT') color = "amber";

    const ins = Array.isArray(rec.inspections) ? rec.inspections[0] : rec.inspections;
    const ast = Array.isArray(ins?.assets) ? ins?.assets[0] : ins?.assets;
    const assetCode = ast?.asset_code || 'Fleet';

    return {
      id: rec.id,
      type: rec.priority,
      title: `Action Required: ${assetCode}`,
      description: rec.action,
      color: color
    };
  }) || [];

  let shiftMatrix = [
    { name: "Shift A (06:00)", data: [0, 0, 0, 0, 0, 0, 0] }, // index: Sun(0) -> Sat(6)
    { name: "Shift B (14:00)", data: [0, 0, 0, 0, 0, 0, 0] },
    { name: "Shift C (22:00)", data: [0, 0, 0, 0, 0, 0, 0] },
  ];

  anomalies?.forEach((a) => {
    const d = new Date(a.created_at);
    const dayIdx = d.getDay(); // 0 = Sunday, 1 = Monday
    const hour = d.getHours();
    
    let shiftIdx = 0; // Shift A: 06:00 - 13:59
    if (hour >= 14 && hour < 22) shiftIdx = 1; // Shift B: 14:00 - 21:59
    else if (hour >= 22 || hour < 6) shiftIdx = 2; // Shift C: 22:00 - 05:59

    shiftMatrix[shiftIdx].data[dayIdx] += 1;
  });

  const mappedMatrix = shiftMatrix.map(shift => {
    const mappedData = [
      shift.data[1], // MON
      shift.data[2], // TUE
      shift.data[3], // WED
      shift.data[4], // THU
      shift.data[5], // FRI
      shift.data[6], // SAT
      shift.data[0], // SUN
    ];
    return { name: shift.name, data: mappedData.map(v => Math.min(v, 3)) };
  });

  const totalAssets = safeAssets.length || 1;
  const opCount = safeAssets.filter(a => a.status === 'OPERATIONAL').length;
  const critCount = safeAssets.filter(a => a.status === 'CRITICAL').length;
  const maintCount = safeAssets.filter(a => a.status === 'SERVICE DUE' || a.status === 'MAINTENANCE').length;

  const reliability = ((opCount / totalAssets) * 100).toFixed(1);
  const downtime = ((critCount / totalAssets) * 100).toFixed(1);
  const estimatedRepairHours = maintCount > 0 ? (maintCount * 4.5).toFixed(1) : "0";

  return {
    rulData: rulData,
    insights: insights,
    matrix: {
      days: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
      shifts: mappedMatrix
    },
    kpis: {
      reliability: { value: `${reliability}%`, trend: "Active", desc: "fleet reliability", status: "good" },
      repairTime: { value: `${estimatedRepairHours} Hrs`, trend: "Est.", desc: "maintenance backlog", status: "warning" },
      downtime: { value: `${downtime}%`, trend: critCount > 0 ? "High" : "Optimal", desc: "critical offline rate", status: "critical" },
    }
  };
}

export default async function AnalyticsPage() {
  const data = await getAnalyticsData();

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto pb-12 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-2 gap-4 sm:gap-0">
        <div>
          <h2 className="text-[11px] font-bold text-amber-700 tracking-widest uppercase mb-2">Predictive Maintenance Hub</h2>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">AI Analytics & Insights</h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button className="w-full sm:w-auto px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition-colors text-sm">
            Export Data
          </button>
          <button className="w-full sm:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-md text-sm">
            Run Full Diagnostic
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 flex flex-col overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-3 sm:gap-0">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Remaining Useful Life (RUL)</h3>
              <p className="text-xs text-slate-500">Estimated machine longevity based on database</p>
            </div>
            <div className="flex bg-slate-50 border border-slate-100 rounded-lg p-1 shrink-0">
              <span className="px-3 py-1 text-[10px] font-bold text-red-500 bg-white shadow-sm rounded-md">Critical</span>
              <span className="px-3 py-1 text-[10px] font-bold text-slate-500">Operational</span>
            </div>
          </div>
          
          <div className="flex-1 relative min-h-[250px] border-b border-l border-slate-100 mt-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-10">
            {data.rulData.map((point) => (
              <div 
                key={point.id}
                className="absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-110"
                style={{ left: `${point.x}%`, top: `${point.y}%` }}
              >
                <span className="text-[10px] font-bold text-slate-600">{point.id}</span>
                <span className={`text-xs md:text-sm font-black drop-shadow-sm ${
                  point.status === 'Critical' ? 'text-red-500' : 
                  point.status === 'Warning' ? 'text-amber-600' : 'text-blue-600'
                }`}>
                  {point.days} Days
                </span>
                <div className={`w-2 h-2 rounded-full mt-1 ${
                  point.status === 'Critical' ? 'bg-red-500 animate-pulse' : 
                  point.status === 'Warning' ? 'bg-amber-500' : 'bg-blue-500'
                }`}></div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 flex flex-col">
          <div className="mb-6">
            <h3 className="font-bold text-slate-900 text-lg">AI Strategic Insights</h3>
            <p className="text-xs text-slate-500">Neural engine derived recommendations</p>
          </div>
          
          <div className="flex flex-col gap-4 flex-1">
            {data.insights.length > 0 ? (
              data.insights.map((insight: any) => (
                <InsightCard key={insight.id} data={insight} />
              ))
            ) : (
              <p className="text-sm text-slate-400 text-center py-8">All systems optimal. No immediate actions required.</p>
            )}
          </div>

          <button className="w-full mt-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
            Review Full Strategy <ArrowRight size={14} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-3 sm:gap-0">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Issue Frequency Matrix</h3>
            <p className="text-xs text-slate-500">Temporal density of machine alerts across production shifts</p>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
            <span className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-100 rounded-sm"></div> Low</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-400 rounded-sm"></div> Med</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-700 rounded-sm"></div> High</span>
          </div>
        </div>

        <div className="overflow-x-auto pb-4">
          <div className="flex flex-col gap-2 min-w-[500px]">
            <div className="flex ml-24 gap-2">
              {data.matrix.days.map((day) => (
                <div key={day} className="flex-1 text-center text-[10px] font-bold text-slate-400 tracking-widest">{day}</div>
              ))}
            </div>
            
            {data.matrix.shifts.map((shift, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-24 text-[10px] font-bold text-slate-600 shrink-0">{shift.name}</div>
                <div className="flex flex-1 gap-2">
                  {shift.data.map((intensity, i) => (
                    <MatrixCell key={i} intensity={intensity} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <KpiCard 
          title="ASSET RELIABILITY"
          value={data.kpis.reliability.value}
          trend={data.kpis.reliability.trend}
          desc={data.kpis.reliability.desc}
          icon={<CheckCircle2 size={18} className="text-blue-600" />}
          trendColor="text-blue-600"
        />
        <KpiCard 
          title="AVG REPAIR TIME"
          value={data.kpis.repairTime.value}
          trend={data.kpis.repairTime.trend}
          desc={data.kpis.repairTime.desc}
          icon={<Clock size={18} className="text-amber-600" />}
          trendColor="text-blue-600"
        />
        <KpiCard 
          title="UNPLANNED DOWNTIME"
          value={data.kpis.downtime.value}
          trend={data.kpis.downtime.trend}
          desc={data.kpis.downtime.desc}
          icon={<AlertTriangle size={18} className="text-red-500" />}
          trendColor={data.kpis.downtime.trend === 'High' ? 'text-red-500' : 'text-blue-600'}
          isAlert={data.kpis.downtime.trend === 'High'}
        />
      </div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-4 text-[10px] font-bold tracking-widest text-slate-400 gap-4 md:gap-0">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-6">
          <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div> AI ENGINE: ACTIVE</span>
          <span>DATA REFRESH: LIVE</span>
          <span>FLEET CONNECTIVITY: 100%</span>
        </div>
        <div>
          © 2026 QARBITE INDUSTRIAL PRECISION
        </div>
      </div>
      <button className="fixed bottom-6 right-6 md:absolute md:bottom-0 md:right-0 w-12 h-12 bg-slate-900 text-white rounded-xl shadow-lg flex items-center justify-center hover:bg-slate-800 transition-colors z-30">
        <Plus size={24} />
      </button>
    </div>
  );
}

function InsightCard({ data }: { data: any }) {
  let borderColor = "border-l-blue-500";
  let typeColor = "text-blue-600";

  if (data.color === "red") {
    borderColor = "border-l-red-500";
    typeColor = "text-red-500";
  } else if (data.color === "amber") {
    borderColor = "border-l-amber-500";
    typeColor = "text-amber-600";
  }

  return (
    <div className={`bg-slate-50 rounded-r-lg border border-slate-100 border-l-4 ${borderColor} p-4 shadow-sm`}>
      <p className={`text-[9px] font-black tracking-widest uppercase mb-1 ${typeColor}`}>{data.type}</p>
      <h4 className="text-xs font-bold text-slate-900 mb-2">{data.title}</h4>
      <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2">{data.description}</p>
    </div>
  );
}

function MatrixCell({ intensity }: { intensity: number }) {
  let bgColor = "bg-slate-100"; // 0
  
  if (intensity === 1) bgColor = "bg-[#B3D4F0]"; // Low (Light Blue)
  if (intensity === 2) bgColor = "bg-[#4B90D6]"; // Med (Mid Blue)
  if (intensity >= 3) bgColor = "bg-[#0A58CA]"; // High (Dark Blue)

  return (
    <div className={`flex-1 h-8 sm:h-10 rounded-md ${bgColor} transition-colors hover:opacity-80`}></div>
  );
}

function KpiCard({ title, value, trend, desc, icon, trendColor, isAlert = false }: any) {
  return (
    <div className={`bg-slate-100/50 rounded-xl p-4 md:p-5 border border-slate-200 relative overflow-hidden ${isAlert ? 'bg-red-50 border-red-200' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">{title}</h3>
        {icon}
      </div>
      <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-1">{value}</h2>
      <p className="text-[10px] font-medium text-slate-500">
        <span className={`font-bold ${trendColor} mr-1`}>{trend}</span> 
        {desc}
      </p>
    </div>
  );
}