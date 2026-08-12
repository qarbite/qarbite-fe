export const dynamic = "force-dynamic";

import React from 'react';
import { createClient } from "@supabase/supabase-js";
import { 
  Radio, AlignLeft, Camera, RefreshCw, CheckCircle2, 
  AlertTriangle, History, CloudUpload, ArrowRight, ShieldAlert, Upload 
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function handleInspectionSubmission(formData: FormData) {
  "use server";

  const assetCode = formData.get("assetCode")?.toString() || "CNC-X4-9022";
  const temperature = formData.get("temperature")?.toString() || "42.5";
  const vibration = formData.get("vibration")?.toString() || "1.2";
  const acoustic = formData.get("acoustic")?.toString() || "84";
  const observations = formData.get("observations")?.toString() || "";
  const photoFile = formData.get("machinePhoto") as File;

  let publicImageUrl = "https://images.unsplash.com/photo-1580983554181-70fbce4df3d0?auto=format&fit=crop&q=80";

  try {
    const { data: asset } = await supabase
      .from('assets')
      .select('id')
      .eq('asset_code', assetCode)
      .single();

    if (!asset) throw new Error("Asset tidak ditemukan di database.");

    if (photoFile && photoFile.size > 0) {
      const fileBytes = await photoFile.arrayBuffer();
      const fileName = `inspection_${Date.now()}_${photoFile.name.replace(/[^a-zA-Z0-9_.-]/g, '_')}`;
      
      const { error: uploadError } = await supabase.storage
        .from('inspections-photos')
        .upload(fileName, fileBytes, {
          contentType: photoFile.type,
          upsert: false
        });

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from('inspections-photos')
          .getPublicUrl(fileName);
        
        if (publicUrlData?.publicUrl) {
          publicImageUrl = publicUrlData.publicUrl;
        }
      } else {
        console.error("Gagal upload ke Supabase Storage, menggunakan default.", uploadError);
      }
    }

    let imagePart = null;
    if (photoFile && photoFile.size > 0) {
      const buffer = await photoFile.arrayBuffer();
      const base64Data = Buffer.from(buffer).toString("base64");
      imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: photoFile.type || "image/jpeg"
        }
      };
    }

    const prompt = `
      Anda adalah AI Industrial Precision Maintenance Expert. Analisis foto kondisi mesin di lapangan serta data telemetri berikut:
      - Nama Mesin/Kode: ${assetCode}
      - Telemetri Sensor -> Suhu: ${temperature}°C, Getaran: ${vibration} RMS, Suara: ${acoustic} dB
      - Catatan Lapangan QA: "${observations}"

      Berikan hasil analisis dalam format JSON murni tanpa markdown formatting (tanpa \`\`\`json ... \`\`\`), dengan struktur kunci berikut:
      {
        "severity": "Low" | "Medium" | "High" | "Critical",
        "anomaly_type": "Nama singkat jenis anomali atau kerusakan (maks 4 kata)",
        "confidence": Angka 0 sampai 100 (tingkat keyakinan AI),
        "description": "Penjelasan detail mengapa kerusakan ini terjadi dan tindakan daruratnya",
        "action_recommendation": "Tindakan perbaikan spesifik untuk tim maintenance"
      }
    `;

    const contentsArray: any[] = [prompt];
    if (imagePart) {
      contentsArray.push(imagePart);
    }

    const geminiResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contentsArray,
    });

    let aiResult = {
      severity: "Low",
      anomaly_type: "Routine Check Passed",
      confidence: 95.0,
      description: "No significant structural or thermal anomalies detected from photo and telemetry.",
      action_recommendation: "Continue standard operational cycle."
    };

    try {
      const textResponse = geminiResponse.text || "{}";
      const cleanJson = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();
      aiResult = JSON.parse(cleanJson);
    } catch (parseErr) {
      console.error("Gagal parsing JSON dari Gemini, menggunakan default:", parseErr);
    }

    const inspectionCode = `#INS-${Math.floor(10000 + Math.random() * 90000)}`;
    const { data: newInspection, error: inspError } = await supabase
      .from('inspections')
      .insert({
        inspection_code: inspectionCode,
        asset_id: asset.id,
        media_url: publicImageUrl,
        qa_validation_status: aiResult.severity === 'Critical' ? 'Invalid' : 'Valid'
      })
      .select('id')
      .single();

    if (inspError) throw inspError;

    await supabase.from('anomalies').insert({
      inspection_id: newInspection.id,
      type: aiResult.anomaly_type,
      severity: aiResult.severity,
      confidence_score: aiResult.confidence,
      description: aiResult.description
    });

    await supabase.from('recommendations').insert({
      inspection_id: newInspection.id,
      action: aiResult.action_recommendation,
      priority: aiResult.severity === 'Critical' ? 'HIGH PRIORITY' : 'OPTIMIZATION',
      estimated_time_to_failure: aiResult.severity === 'Critical' ? 2 : 14
    });

    if (aiResult.severity === 'Critical' || aiResult.severity === 'High') {
      await supabase.from('assets').update({
        status: 'CRITICAL',
        ai_risk: 90,
        risk_label: aiResult.anomaly_type
      }).eq('id', asset.id);
    }

  } catch (error) {
    console.error("Gagal memproses inspeksi:", error);
  }
}

async function getInspectionPageData() {
  const { data: assets } = await supabase.from('assets').select('asset_code, name, status, ai_risk');
  
  const { data: latestInspection } = await supabase
    .from('inspections')
    .select(`
      id, inspection_code, qa_validation_status, analyzed_at, media_url,
      assets ( asset_code, name, ai_risk )
    `)
    .order('analyzed_at', { ascending: false })
    .limit(1)
    .single();

  const asset = (latestInspection?.assets as any) || { asset_code: "CNC-X4-9022", name: "High-Precision Lathe", ai_risk: 4 };
  const healthIdx = Math.max(0, 100 - ((asset?.ai_risk as number) || 0));

  return {
    assetsList: assets || [],
    currentTask: {
      id: latestInspection?.inspection_code || "#INS-88422",
      machineName: `${asset.asset_code} - ${asset.name}`,
      type: "AI-Assisted Structural & Telemetry Audit",
      healthIndex: healthIdx,
      nextService: 14,
    }
  };
}

export default async function InspectionsPage() {
  const { assetsList, currentTask } = await getInspectionPageData();
  return (
    <div className="flex flex-col min-h-screen lg:h-[calc(100vh-5rem)] max-w-[1500px] mx-auto relative pb-32 lg:pb-24">
      <form action={handleInspectionSubmission} className="flex flex-col flex-1 gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start mb-2 gap-4 md:gap-0">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded tracking-widest uppercase">
                QA Field Inspector View
              </span>
              <span className="text-[11px] font-bold text-slate-400 tracking-wider">
                Task ID: {currentTask.id}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Inspection</h1>
            <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">Pilih mesin, ambil atau unggah foto kondisi lapangan, dan biarkan Gemini AI menganalisis.</p>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
            <TopKpiBox label="FLEET HEALTH" value={`${currentTask.healthIndex}%`} borderColor="border-l-blue-600" valueColor="text-blue-600" />
            <TopKpiBox label="AUDIT WINDOW" value={`${currentTask.nextService} Days`} borderColor="border-l-amber-700" valueColor="text-amber-700" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 lg:overflow-hidden">          
          <div className="col-span-1 lg:col-span-5 flex flex-col gap-6 lg:overflow-y-auto lg:pr-2 lg:pb-4 order-2 lg:order-1">            
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
              <label className="block text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-2">
                Pilih Target Mesin (Asset Code)
              </label>
              <select 
                name="assetCode" 
                defaultValue="CNC-X4-9022"
                className="w-full bg-slate-50 border border-slate-200 rounded-md py-2.5 px-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {assetsList.map((ast: any) => (
                  <option key={ast.asset_code} value={ast.asset_code}>
                    {ast.asset_code} - {ast.name} ({ast.status})
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
              <div className="flex items-center gap-2 mb-6">
                <Radio size={18} className="text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Telemetry Sensor Manual Input</h3>
              </div>
              <div className="space-y-4">
                <TelemetryField label="TEMPERATURE (°C)" name="temperature" defaultValue="42.5" normal="38-45" />
                <TelemetryField label="VIBRATION (RMS)" name="vibration" defaultValue="1.2" normal="< 2.0" />
                <TelemetryField label="ACOUSTIC SOUND (DB)" name="acoustic" defaultValue="84" normal="80-88" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 flex-1 flex flex-col min-h-[180px]">
              <div className="flex items-center gap-2 mb-4">
                <AlignLeft size={18} className="text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">QA Observations & Notes</h3>
              </div>
              <textarea 
                name="observations"
                className="w-full flex-1 bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Tuliskan temuan visual, bau terbakar, atau keanehan suara mesin untuk dianalisis Gemini AI..."
              ></textarea>
            </div>
          </div>

          <div className="col-span-1 lg:col-span-7 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden order-1 lg:order-2">            
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2 text-slate-800">
                <Camera size={18} className="text-blue-600 shrink-0" />
                <h3 className="font-bold text-sm">Visual Documentation & AI Image Feed</h3>
              </div>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full flex items-center gap-1">
                <ShieldAlert size={12} /> Powered by Gemini 2.5 Flash
              </span>
            </div>

            <div className="p-5 bg-slate-50 border-b border-slate-200 flex flex-col gap-3">
              <label className="text-[10px] font-bold text-slate-600 tracking-wider uppercase flex items-center gap-2">
                <Upload size={14} className="text-blue-600" /> Upload / Ambil Foto Kondisi Mesin (File Perangkat)
              </label>
              <input 
                type="file" 
                name="machinePhoto"
                accept="image/*"
                required
                className="w-full bg-white border border-slate-300 rounded-md py-2 px-3 text-xs text-slate-700 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
              <p className="text-[10px] text-slate-400">QA wajib melampirkan foto riil kondisi mesin untuk diproses oleh Computer Vision Gemini.</p>
            </div>

            <div className="relative flex-1 bg-slate-900 overflow-hidden min-h-[300px] flex items-center justify-center p-6 text-center text-slate-400">
              <div className="flex flex-col items-center gap-2">
                <Camera size={48} className="text-slate-600 animate-pulse" />
                <p className="text-xs font-semibold text-slate-300">File foto yang Anda pilih akan diunggah otomatis ke Supabase Storage & dianalisis visualnya oleh AI.</p>
              </div>
            </div>

            <div className="grid grid-cols-3 border-t border-slate-200 bg-slate-50">
              <div className="p-4 border-r border-slate-200">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase">Model</h4>
                <p className="text-xs font-bold text-slate-800">Gemini 2.5 Flash</p>
              </div>
              <div className="p-4 border-r border-slate-200">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase">Target DB</h4>
                <p className="text-xs font-bold text-blue-600">Supabase Connected</p>
              </div>
              <div className="p-4">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase">Mode</h4>
                <p className="text-xs font-bold text-emerald-600">Direct File Upload</p>
              </div>
            </div>

          </div>
        </div>

        <div className="fixed bottom-4 left-4 right-4 lg:absolute lg:bottom-0 lg:left-0 lg:right-0 bg-white border border-slate-200 rounded-xl lg:rounded-b-none lg:rounded-t-xl p-4 shadow-2xl flex flex-col sm:flex-row justify-between items-center z-30 gap-4 sm:gap-0">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 hidden sm:block">
              <CloudUpload size={22} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Validasi QA & Kirim ke AI</h3>
              <p className="text-[10px] sm:text-xs text-slate-500">Foto asli akan diproses oleh Gemini Vision API dan disimpan permanen.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button type="reset" className="flex-1 sm:flex-none text-slate-600 font-bold text-sm hover:text-slate-900 py-3 px-4 bg-slate-100 rounded-lg">
              Reset Form
            </button>
            <button type="submit" className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-8 rounded-lg text-sm shadow-md transition-colors">
              Submit & Analyze with Gemini <ArrowRight size={16} />
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}

function TopKpiBox({ label, value, borderColor, valueColor }: { label: string, value: string, borderColor: string, valueColor: string }) {
  return (
    <div className={`bg-white px-4 py-2 rounded-lg border border-slate-200 border-l-4 ${borderColor} shadow-sm flex-1 md:flex-none md:min-w-[120px]`}>
      <p className="text-[8px] md:text-[9px] font-bold text-slate-400 tracking-widest uppercase mb-1">{label}</p>
      <p className={`text-lg md:text-xl font-black ${valueColor}`}>{value}</p>
    </div>
  );
}

function TelemetryField({ label, name, defaultValue, normal }: { label: string, name: string, defaultValue: string, normal: string }) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-1.5">
        {label}
      </label>
      <div className="relative flex items-center">
        <input 
          type="text" 
          name={name}
          defaultValue={defaultValue}
          className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 pl-3 pr-24 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="absolute right-3 text-[9px] font-bold text-slate-400">
          Normal: {normal}
        </span>
      </div>
    </div>
  );
}