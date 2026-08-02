import React from 'react';
import { 
  CheckCircle2, Circle, Lock, CloudUpload, 
  Eye, Camera, MonitorPlay, AlignLeft 
} from 'lucide-react';

// ============================================================================
// 1. SIMULASI FETCH DATA DARI SUPABASE
// ============================================================================
async function getQaFormData() {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulasi network delay
  
  return {
    telemetry: [
      { id: "hyd", label: "HYDRAULIC PRESSURE", value: "2,450", unit: "PSI", progress: 80, color: "bg-blue-600" },
      { id: "temp", label: "CORE TEMP", value: "68.4", unit: "°C", progress: 65, color: "bg-orange-500" }
    ],
    checklist: [
      { id: 1, title: "Exterior Casing Integrity", status: "completed" },
      { id: 2, title: "Sealant Uniformity Scan", status: "active" },
      { id: 3, title: "Mounting Bolt Torque", status: "locked" }
    ],
    camera: {
      fps: "60.0",
      latency: "14ms",
      resolution: "4K UHD"
    },
    anomaly: {
      detected: true,
      label: "Sealant Cap: 0.4mm",
      boxPosition: { top: "40%", left: "55%", width: "180px", height: "150px" }
    }
  };
}

// ============================================================================
// 2. HALAMAN UTAMA (SERVER COMPONENT)
// ============================================================================
export default async function QaFormTabletPage() {
  const data = await getQaFormData();

  return (
    <div className="flex h-full w-full">
      
      {/* LEFT PANEL: FORM & DATA (Fixed Width) */}
      <div className="w-[320px] bg-slate-50 flex flex-col border-r border-slate-200 overflow-y-auto">
        <div className="p-5 flex flex-col gap-6 flex-1">
          
          {/* Real-time Telemetry */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-[9px] font-bold text-slate-500 tracking-widest uppercase">Real-time Telemetry</h3>
              <span className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-100 text-blue-600 text-[9px] font-bold rounded-full uppercase tracking-wider">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></div> Live Stream
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {data.telemetry.map((item) => (
                <div key={item.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                  <p className="text-[8px] font-bold text-slate-500 tracking-widest uppercase mb-1">{item.label}</p>
                  <p className="text-xl font-black text-slate-900 mb-2">
                    {item.value} <span className="text-[10px] text-slate-400 font-bold">{item.unit}</span>
                  </p>
                  <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.progress}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Inspection Checklist */}
          <div>
            <h3 className="text-[9px] font-bold text-slate-500 tracking-widest uppercase mb-3">Inspection Checklist</h3>
            <div className="flex flex-col gap-2">
              {data.checklist.map((item) => (
                <ChecklistItem key={item.id} item={item} />
              ))}
            </div>
          </div>

          {/* Technical Remarks */}
          <div className="flex-1 flex flex-col min-h-[150px]">
            <h3 className="text-[9px] font-bold text-slate-500 tracking-widest uppercase mb-3">Technical Remarks</h3>
            <div className="flex-1 bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col overflow-hidden">
              <div className="bg-slate-100 border-b border-slate-200 p-2 flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-600">FIELD NOTES</span>
                <AlignLeft size={12} className="text-slate-400" />
              </div>
              <textarea 
                className="flex-1 w-full p-3 text-xs text-slate-700 focus:outline-none resize-none"
                placeholder="Enter findings or observations regarding component wear and tear..."
              ></textarea>
            </div>
          </div>

        </div>

        {/* Submit Button (Sticky Bottom) */}
        <div className="p-5 pt-0 bg-slate-50">
          <button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md transition-colors text-xs">
            <CloudUpload size={16} /> SUBMIT INSPECTION
          </button>
        </div>
      </div>

      {/* RIGHT PANEL: AI VISION CAMERA (Flexible Width) */}
      <div className="flex-1 relative bg-slate-900 overflow-hidden">
        
        {/* Live Background Image */}
        <img 
          src="https://images.unsplash.com/photo-1565439390117-915998a63273?auto=format&fit=crop&q=80" 
          alt="Machine Live Feed" 
          className="absolute inset-0 w-full h-full object-cover opacity-90"
        />

        {/* Top Left AI Badge */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg flex items-center gap-3 shadow-lg border border-white/20">
          <div className="p-1.5 bg-blue-100 text-blue-600 rounded">
            <Eye size={16} />
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-500 tracking-widest uppercase mb-0.5">Computer Vision</p>
            <p className="text-[10px] font-black text-slate-900">AI ANALYSIS ACTIVE</p>
          </div>
        </div>

        {/* Bounding Box & Anomaly Popup */}
        {data.anomaly.detected && (
          <div 
            className="absolute border-2 border-blue-500 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.3)]"
            style={{ 
              top: data.anomaly.boxPosition.top, 
              left: data.anomaly.boxPosition.left, 
              width: data.anomaly.boxPosition.width, 
              height: data.anomaly.boxPosition.height 
            }}
          >
            {/* Corner Accents (Optional UI flourish) */}
            <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-blue-600"></div>
            <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-blue-600"></div>
            <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-blue-600"></div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-blue-600"></div>

            {/* Popup Dialog */}
            <div className="absolute top-1/2 -right-4 translate-x-full -translate-y-1/2 bg-white/90 backdrop-blur-md border border-slate-200 p-3 rounded-lg shadow-xl w-48 z-10">
              <h4 className="text-[9px] font-black text-red-600 tracking-widest uppercase mb-1">Anomaly Detected</h4>
              <p className="text-xs font-bold text-slate-900 mb-3">{data.anomaly.label}</p>
              <div className="flex gap-2">
                <button className="flex-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold py-1.5 rounded shadow-sm">FLAG</button>
                <button className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold py-1.5 rounded">IGNORE</button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Left Camera Stats */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg flex gap-6 shadow-lg border border-white/20">
          <div>
            <p className="text-[8px] font-bold text-slate-500 tracking-widest uppercase">FPS</p>
            <p className="text-xs font-black text-slate-900">{data.camera.fps}</p>
          </div>
          <div>
            <p className="text-[8px] font-bold text-blue-600 tracking-widest uppercase">LATENCY</p>
            <p className="text-xs font-black text-slate-900">{data.camera.latency}</p>
          </div>
          <div>
            <p className="text-[8px] font-bold text-slate-500 tracking-widest uppercase">RESOLUTION</p>
            <p className="text-xs font-black text-slate-900">{data.camera.resolution}</p>
          </div>
        </div>

        {/* Bottom Right Controls */}
        <div className="absolute bottom-4 right-4 flex bg-black/50 backdrop-blur-md rounded-lg p-1.5 gap-1 border border-white/10">
          <button className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors">
            <Circle size={20} />
          </button>
          <button className="w-10 h-10 flex items-center justify-center bg-white text-slate-900 rounded shadow-md">
            <Camera size={20} />
          </button>
          <button className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors bg-blue-600">
            <MonitorPlay size={20} />
          </button>
        </div>

      </div>
    </div>
  );
}

// ============================================================================
// 3. REUSABLE MICRO-COMPONENTS
// ============================================================================

// Komponen Checklist Item (Kiri)
function ChecklistItem({ item }: { item: any }) {
  let wrapperClass = "bg-white border-slate-200 text-slate-600";
  let icon = <Circle size={16} className="text-slate-300" />;
  let rightElement = null;

  if (item.status === "completed") {
    icon = <CheckCircle2 size={16} className="text-blue-600" />;
    rightElement = <span className="text-[10px] text-slate-300">{'>'}</span>;
  } else if (item.status === "active") {
    wrapperClass = "bg-white border-blue-600 shadow-sm border-l-4";
    icon = <Circle size={16} className="text-blue-600" />;
    rightElement = <span className="text-[9px] font-bold text-blue-600 tracking-widest uppercase">Active</span>;
  } else if (item.status === "locked") {
    wrapperClass = "bg-slate-100 border-slate-200 text-slate-400";
    icon = <Circle size={16} className="text-slate-300" />;
    rightElement = <Lock size={14} className="text-slate-300" />;
  }

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border ${wrapperClass}`}>
      <div className="flex items-center gap-3">
        {icon}
        <span className={`text-xs font-bold ${item.status === 'locked' ? 'text-slate-400' : 'text-slate-800'}`}>
          {item.title}
        </span>
      </div>
      {rightElement}
    </div>
  );
}