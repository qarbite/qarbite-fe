import React from 'react';
import { 
  ArrowRight, CheckCircle2, Clock, AlertTriangle, 
  Plus
} from 'lucide-react';

// ============================================================================
// 1. SIMULASI FETCH DATA DARI SUPABASE
// ============================================================================
async function getAnalyticsData() {
  // Simulasi delay jaringan
  await new Promise(resolve => setTimeout(resolve, 400));

  return {
    rulData: [
      { id: "CNC-01", days: 12, status: "Critical", x: 15, y: 70 },
      { id: "HYD-04", days: 142, status: "Operational", x: 35, y: 20 },
      { id: "LATH-09", days: 98, status: "Operational", x: 55, y: 40 },
      { id: "MIL-42", days: 42, status: "Warning", x: 75, y: 60 },
      { id: "PRSS-14", days: 114, status: "Operational", x: 90, y: 30 },
    ],
    insights: [
      {
        id: "INS-1",
        type: "HIGH PRIORITY",
        title: "Service CNC-01 immediately",
        description: "Vibration signatures indicate imminent bearing failure in spindle unit B-4.",
        color: "red"
      },
      {
        id: "INS-2",
        type: "OPTIMIZATION",
        title: "Reduce hydraulic pressure on HYD-04",
        description: "Lowering PSI by 5% will extend component life by an estimated 22 days without affecting output.",
        color: "blue"
      },
      {
        id: "INS-3",
        type: "INVENTORY ALERT",
        title: "Restock LATH-09 Seal Kits",
        description: "Predictive model suggests maintenance window opening in 14 days. 0 kits in stock.",
        color: "amber"
      }
    ],
    matrix: {
      days: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
      shifts: [
        { name: "Shift A (06:00)", data: [1, 1, 2, 1, 1, 0, 0] },
        { name: "Shift B (14:00)", data: [2, 2, 3, 2, 2, 1, 1] },
        { name: "Shift C (22:00)", data: [1, 1, 1, 1, 1, 0, 0] },
      ]
    },
    kpis: {
      reliability: { value: "98.4%", trend: "↑ 1.2%", desc: "from last quarter", status: "good" },
      repairTime: { value: "3.2 Hrs", trend: "↓ 15m", desc: "decrease with AI routing", status: "warning" },
      downtime: { value: "0.5%", trend: "Low", desc: "within optimal range", status: "critical" },
    }
  };
}

// ============================================================================
// 2. HALAMAN UTAMA (SERVER COMPONENT)
// ============================================================================
export default async function AnalyticsPage() {
  const data = await getAnalyticsData();

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto pb-12 relative">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-end mb-2">
        <div>
          <h2 className="text-[11px] font-bold text-amber-700 tracking-widest uppercase mb-2">Predictive Maintenance Hub</h2>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">AI Analytics & Insights</h1>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition-colors text-sm">
            Export Data
          </button>
          <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-md text-sm">
            Run Full Diagnostic
          </button>
        </div>
      </div>

      {/* TOP ROW: RUL CHART & INSIGHTS */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* RUL Scatter Chart (Span 8) */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Remaining Useful Life (RUL)</h3>
              <p className="text-xs text-slate-500">Estimated machine longevity across fleet</p>
            </div>
            <div className="flex bg-slate-50 border border-slate-100 rounded-lg p-1">
              <span className="px-3 py-1 text-[10px] font-bold text-blue-600 bg-white shadow-sm rounded-md">Critical</span>
              <span className="px-3 py-1 text-[10px] font-bold text-slate-500">Operational</span>
            </div>
          </div>
          
          {/* Mock Chart Area */}
          <div className="flex-1 relative min-h-[250px] border-b border-l border-slate-100 mt-4">
            {data.rulData.map((point) => (
              <div 
                key={point.id}
                className="absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${point.x}%`, top: `${point.y}%` }}
              >
                <span className="text-[10px] font-bold text-slate-600">{point.id}</span>
                <span className={`text-sm font-black ${
                  point.status === 'Critical' ? 'text-red-500' : 
                  point.status === 'Warning' ? 'text-amber-600' : 'text-blue-600'
                }`}>
                  {point.days} Days
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Strategic Insights (Span 4) */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
          <div className="mb-6">
            <h3 className="font-bold text-slate-900 text-lg">AI Strategic Insights</h3>
            <p className="text-xs text-slate-500">Neural engine derived recommendations</p>
          </div>
          
          <div className="flex flex-col gap-4 flex-1">
            {data.insights.map((insight) => (
              <InsightCard key={insight.id} data={insight} />
            ))}
          </div>

          <button className="w-full mt-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
            Review Full Strategy <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* MIDDLE ROW: ISSUE FREQUENCY MATRIX */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex justify-between items-start mb-8">
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

        <div className="flex flex-col gap-2">
          {/* Header Row (Days) */}
          <div className="flex ml-24 gap-2">
            {data.matrix.days.map((day) => (
              <div key={day} className="flex-1 text-center text-[10px] font-bold text-slate-400 tracking-widest">{day}</div>
            ))}
          </div>
          
          {/* Grid Rows (Shifts) */}
          {data.matrix.shifts.map((shift, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <div className="w-24 text-[10px] font-bold text-slate-600">{shift.name}</div>
              <div className="flex flex-1 gap-2">
                {shift.data.map((intensity, i) => (
                  <MatrixCell key={i} intensity={intensity} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM ROW: KPIS */}
      <div className="grid grid-cols-3 gap-6">
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
          trendColor="text-blue-600"
          isAlert={true}
        />
      </div>

      {/* STATUS FOOTER & FAB */}
      <div className="flex justify-between items-center mt-4 text-[10px] font-bold tracking-widest text-slate-400">
        <div className="flex gap-6">
          <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div> AI ENGINE: ACTIVE</span>
          <span>DATA REFRESH: 2m AGO</span>
          <span>FLEET CONNECTIVITY: 100%</span>
        </div>
        <div>
          © 2024 QARBITE INDUSTRIAL PRECISION
        </div>
      </div>

      {/* Floating Action Button */}
      <button className="absolute bottom-0 right-0 w-12 h-12 bg-slate-900 text-white rounded-xl shadow-lg flex items-center justify-center hover:bg-slate-800 transition-colors">
        <Plus size={24} />
      </button>

    </div>
  );
}

// ============================================================================
// 3. REUSABLE MICRO-COMPONENTS
// ============================================================================

// Komponen Card Insight AI (Kolom Kanan)
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
      <p className="text-[10px] text-slate-500 leading-relaxed">{data.description}</p>
    </div>
  );
}

// Komponen Cell untuk Heatmap (Matrix)
function MatrixCell({ intensity }: { intensity: number }) {
  let bgColor = "bg-slate-100"; // 0
  
  if (intensity === 1) bgColor = "bg-[#B3D4F0]"; // Low (Light Blue)
  if (intensity === 2) bgColor = "bg-[#4B90D6]"; // Med (Mid Blue)
  if (intensity === 3) bgColor = "bg-[#0A58CA]"; // High (Dark Blue)

  return (
    <div className={`flex-1 h-10 rounded-md ${bgColor} transition-colors hover:opacity-80`}></div>
  );
}

// Komponen KPI Card (Baris Bawah)
function KpiCard({ title, value, trend, desc, icon, trendColor, isAlert = false }: any) {
  return (
    <div className={`bg-slate-100/50 rounded-xl p-5 border border-slate-200 relative overflow-hidden ${isAlert ? 'bg-slate-100' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">{title}</h3>
        {icon}
      </div>
      <h2 className="text-3xl font-black text-slate-900 mb-1">{value}</h2>
      <p className="text-[10px] font-medium text-slate-500">
        <span className={`font-bold ${trendColor} mr-1`}>{trend}</span> 
        {desc}
      </p>
    </div>
  );
}