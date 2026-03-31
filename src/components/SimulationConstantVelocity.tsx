import React, { useState, useMemo } from 'react';
import { InlineMath } from 'react-katex';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

export function SimulationConstantVelocity() {
  const [x0, setX0] = useState(0);
  const [v, setV] = useState(5);

  const data = useMemo(() => {
    const points = [];
    for (let t = 0; t <= 10; t += 0.2) {
      const x = x0 + v * t;
      points.push({
        time: Number(t.toFixed(1)),
        position: Number(x.toFixed(2)),
        velocity: Number(v.toFixed(2)),
      });
    }
    return points;
  }, [x0, v]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
      <h3 className="text-xl font-semibold text-slate-800 mb-6">Constant Velocity Simulation</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Initial Position (<InlineMath math="x_0" />): {x0} m
          </label>
          <input 
            type="range" 
            min="-50" 
            max="50" 
            step="1"
            value={x0} 
            onChange={(e) => setX0(Number(e.target.value))}
            className="w-full accent-indigo-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Velocity (<InlineMath math="v" />): {v} m/s
          </label>
          <input 
            type="range" 
            min="-30" 
            max="30" 
            step="1"
            value={v} 
            onChange={(e) => setV(Number(e.target.value))}
            className="w-full accent-indigo-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 w-full bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h4 className="text-center font-medium text-slate-700 mb-2">Position vs. Time</h4>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" type="number" domain={[0, 10]} tickCount={11} label={{ value: 'Time (s)', position: 'insideBottom', offset: -10 }} />
              <YAxis label={{ value: 'Position (m)', angle: -90, position: 'insideLeft', offset: 10 }} />
              <Tooltip formatter={(value: number) => [`${value} m`, 'Position']} labelFormatter={(label: number) => `Time: ${label} s`} />
              <ReferenceLine y={0} stroke="#94a3b8" />
              <Line type="monotone" dataKey="position" stroke="#4f46e5" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="h-80 w-full bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h4 className="text-center font-medium text-slate-700 mb-2">Velocity vs. Time</h4>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" type="number" domain={[0, 10]} tickCount={11} label={{ value: 'Time (s)', position: 'insideBottom', offset: -10 }} />
              <YAxis domain={[-35, 35]} label={{ value: 'Velocity (m/s)', angle: -90, position: 'insideLeft', offset: 10 }} />
              <Tooltip formatter={(value: number) => [`${value} m/s`, 'Velocity']} labelFormatter={(label: number) => `Time: ${label} s`} />
              <ReferenceLine y={0} stroke="#94a3b8" />
              <Line type="monotone" dataKey="velocity" stroke="#f97316" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
