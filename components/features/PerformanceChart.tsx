"use client";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface TelemetryData {
  time: string;
  temperature: number;
  vibration: number;
}

export default function PerformanceChart({ data }: { data: TelemetryData[] }) {
  return (
    <div className="h-64 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          {/* Garis bantu background */}
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          
          <XAxis 
            dataKey="time" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: "#94a3b8" }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: "#94a3b8" }} 
          />
          
          {/* Tooltip saat di-hover */}
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
          />
          
          {/* Garis Grafik Suhu (Biru) */}
          <Line 
            type="monotone" 
            dataKey="temperature" 
            name="Temperature (°C)"
            stroke="#2563eb" 
            strokeWidth={3} 
            dot={false}
            activeDot={{ r: 6, fill: "#2563eb", stroke: "#fff", strokeWidth: 2 }}
          />
          
          {/* Garis Grafik Getaran (Coklat/Amber dashed) */}
          <Line 
            type="monotone" 
            dataKey="vibration" 
            name="Vibration (Hz)"
            stroke="#b45309" 
            strokeWidth={2} 
            strokeDasharray="5 5"
            dot={false}
            activeDot={{ r: 6, fill: "#b45309", stroke: "#fff", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}