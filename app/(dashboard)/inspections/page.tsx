import React from 'react';
import { 
  Radio, AlignLeft, Camera, RefreshCw, CheckCircle2, 
  AlertTriangle, History, CloudUpload, ArrowRight 
} from 'lucide-react';

// ============================================================================
// 1. SIMULASI FETCH DATA DARI SUPABASE
// ============================================================================
async function getInspectionData() {
  // Simulasi delay jaringan
  await new Promise(resolve => setTimeout(resolve, 300));

  return {
    task: {
      id: "#INS-88422",
      machineName: "AX-700 Turbo Compressor",
      type: "Scheduled AI-Assisted Structural & Telemetry Audit",
      healthIndex: 94.2,
      nextService: 14,
    },
    telemetry: [
      { id: "temp", label: "TEMPERATURE (°C)", value: "42.5", normal: "38-45" },
      { id: "vib", label: "VIBRATION (RMS)", value: "1.2", normal: "< 2.0" },
      { id: "acou", label: "ACOUSTIC SOUND (DB)", value: "84", normal: "80-88" },
    ],
    aiVisual: {
      imageUrl: "https://images.unsplash.com/photo-1580983554181-70fbce4df3d0?auto=format&fit=crop&q=80", // Dummy gambar mesin
      resolution: "8K UHD SCAN",
      focalPoint: "Bearing Housing B",
      anomalies: [
        {
          id: "CRACK_DET_01",
          type: "danger", // red
          confidence: "98% Confidence",
          detail: "Type: Fatigue hairline",
          position: { top: "35%", left: "45%" }
        },
        {
          id: "JOINT_OK",
          type: "success", // blue
          confidence: "100% Intact",
          detail: "",
          position: { top: "60%", left: "75%" }
        }
      ],
      summaries: [
        { icon: "alert", title: "Anomalies Detected", desc: "01 Structural Crack", color: "text-red-500" },
        { icon: "check", title: "Surface Condition", desc: "Optimal Lubrication", color: "text-blue-600" },
        { icon: "history", title: "Last Visual Audit", desc: "48h ago (Passed)", color: "text-amber-700" }
      ]
    }
  };
}

// ============================================================================
// 2. HALAMAN UTAMA (SERVER COMPONENT)
// ============================================================================
export default async function InspectionsPage() {
  const data = await getInspectionData();

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-[1500px] mx-auto relative pb-24">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded tracking-widest uppercase">
              Technician View
            </span>
            <span className="text-[11px] font-bold text-slate-400 tracking-wider">
              Task ID: {data.task.id}
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{data.task.machineName}</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">{data.task.type}</p>
        </div>
        
        <div className="flex gap-4">
          <TopKpiBox label="HEALTH INDEX" value={`${data.task.healthIndex}%`} borderColor="border-l-blue-600" valueColor="text-blue-600" />
          <TopKpiBox label="NEXT SERVICE" value={`${data.task.nextService} Days`} borderColor="border-l-amber-700" valueColor="text-amber-700" />
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-12 gap-6 flex-1 overflow-hidden">
        
        {/* LEFT COLUMN: FORMS (Span 4) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2 pb-4">
          
          {/* Telemetry Input */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Radio size={18} className="text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">Telemetry Input</h3>
            </div>
            <div className="space-y-5">
              {data.telemetry.map((item) => (
                <TelemetryInput key={item.id} label={item.label} defaultValue={item.value} normalRange={item.normal} />
              ))}
            </div>
          </div>

          {/* Observations */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex-1 flex flex-col min-h-[200px]">
            <div className="flex items-center gap-2 mb-4">
              <AlignLeft size={18} className="text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">Observations</h3>
            </div>
            <textarea 
              className="w-full flex-1 bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Document any unusual smells, visual leaks, or audible anomalies not captured by sensors..."
            ></textarea>
          </div>
        </div>

        {/* RIGHT COLUMN: AI VISUAL INSPECTION (Span 8) */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          
          {/* Header Visual */}
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div className="flex items-center gap-2 text-slate-800">
              <Camera size={18} className="text-blue-600" />
              <h3 className="font-bold text-sm">AI Visual Structural Inspection</h3>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded transition-colors">
                <RefreshCw size={12} /> Re-scan
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 text-white text-xs font-bold rounded shadow-sm">
                <CheckCircle2 size={12} /> AI Active
              </button>
            </div>
          </div>

          {/* Image Area with AI Overlays */}
          <div className="relative flex-1 bg-slate-900 overflow-hidden min-h-[400px]">
            {/* The Image */}
            <img 
              src={data.aiVisual.imageUrl} 
              alt="Structural Inspection" 
              className="w-full h-full object-cover opacity-80"
            />

            {/* AI Scanning Line (Simulated CSS Animation) */}
            <div className="absolute top-1/2 left-0 w-full h-px bg-blue-400 shadow-[0_0_8px_2px_rgba(96,165,250,0.5)] z-10"></div>

            {/* Bounding Boxes */}
            {data.aiVisual.anomalies.map((anomaly, idx) => (
              <AiBoundingBox key={idx} data={anomaly} />
            ))}

            {/* Bottom Left Camera Meta Overlay */}
            <div className="absolute bottom-4 left-4 flex gap-2">
              <div className="bg-black/80 backdrop-blur-sm text-white p-2 rounded border border-white/10">
                <p className="text-[8px] font-bold text-slate-400 tracking-widest uppercase mb-0.5">Resolution</p>
                <p className="text-xs font-bold">{data.aiVisual.resolution}</p>
              </div>
              <div className="bg-black/80 backdrop-blur-sm text-white p-2 rounded border border-white/10">
                <p className="text-[8px] font-bold text-slate-400 tracking-widest uppercase mb-0.5">Focal Point</p>
                <p className="text-xs font-bold">{data.aiVisual.focalPoint}</p>
              </div>
            </div>
          </div>

          {/* Visual Summary Footer */}
          <div className="grid grid-cols-3 border-t border-slate-200">
            {data.aiVisual.summaries.map((summary, idx) => (
              <div key={idx} className={`p-4 flex items-start gap-3 ${idx !== 2 ? 'border-r border-slate-100' : ''}`}>
                {summary.icon === 'alert' && <AlertTriangle size={20} className={summary.color} />}
                {summary.icon === 'check' && <CheckCircle2 size={20} className={summary.color} />}
                {summary.icon === 'history' && <History size={20} className={summary.color} />}
                <div>
                  <h4 className="text-[10px] font-bold text-slate-900 mb-0.5">{summary.title}</h4>
                  <p className="text-xs text-slate-500">{summary.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* FLOATING ACTION BAR (Submission) */}
      <div className="absolute bottom-0 left-0 right-0 bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-lg flex justify-between items-center z-20">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm text-blue-600">
            <CloudUpload size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Ready for submission</h3>
            <p className="text-xs text-slate-500">All required fields populated. AI report attached.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-slate-600 font-bold text-sm hover:text-slate-900 px-4">
            Save Draft
          </button>
          <button className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-6 rounded-lg text-sm shadow-md transition-colors">
            Submit Inspection <ArrowRight size={16} />
          </button>
        </div>
      </div>

    </div>
  );
}

// ============================================================================
// 3. REUSABLE MICRO-COMPONENTS
// ============================================================================

// Komponen Kotak KPI di sudut kanan atas
function TopKpiBox({ label, value, borderColor, valueColor }: { label: string, value: string, borderColor: string, valueColor: string }) {
  return (
    <div className={`bg-white px-4 py-2 rounded-lg border border-slate-200 border-l-4 ${borderColor} shadow-sm min-w-[120px]`}>
      <p className="text-[9px] font-bold text-slate-400 tracking-widest uppercase mb-1">{label}</p>
      <p className={`text-xl font-black ${valueColor}`}>{value}</p>
    </div>
  );
}

// Komponen Input Field untuk Data Telemetri
function TelemetryInput({ label, defaultValue, normalRange }: { label: string, defaultValue: string, normalRange: string }) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-2">
        {label}
      </label>
      <div className="relative flex items-center">
        <input 
          type="text" 
          defaultValue={defaultValue}
          className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 px-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
        />
        <span className="absolute right-3 text-[10px] font-bold text-slate-400">
          Normal: {normalRange}
        </span>
      </div>
    </div>
  );
}

// Komponen Bounding Box untuk AI Visual (Kotak Merah/Biru)
function AiBoundingBox({ data }: { data: any }) {
  const isDanger = data.type === 'danger';
  const colorClass = isDanger ? 'border-red-500 bg-red-500/20' : 'border-blue-500 bg-blue-500/20';
  const tagClass = isDanger ? 'bg-red-600 text-white' : 'bg-blue-600 text-white';

  return (
    <div 
      className={`absolute border-2 ${colorClass} rounded-lg flex items-center justify-center`}
      style={{ 
        top: data.position.top, 
        left: data.position.left, 
        width: '120px', 
        height: '120px',
        transform: 'translate(-50%, -50%)' // Center anchor
      }}
    >
      {/* Label Tooltip diletakkan di dalam/tengah bounding box */}
      <div className="flex flex-col items-center justify-center text-center p-1">
        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider mb-1 ${tagClass}`}>
          {data.id}
        </span>
        <span className={`text-[10px] font-bold ${isDanger ? 'text-red-400' : 'text-blue-400'} drop-shadow-md`}>
          {data.confidence}
        </span>
        {data.detail && (
          <span className="text-[8px] text-white/80">
            {data.detail}
          </span>
        )}
      </div>
    </div>
  );
}