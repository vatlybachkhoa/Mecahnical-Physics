import React, { useState, useEffect, useRef } from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import { Play, Pause, RotateCcw } from 'lucide-react';

const SHAPES = {
  solid_sphere: { name: 'Solid Sphere', c: 2/5, color: '#ef4444' },
  hollow_sphere: { name: 'Hollow Sphere', c: 2/3, color: '#f97316' },
  solid_cylinder: { name: 'Solid Cylinder', c: 1/2, color: '#3b82f6' },
  hollow_cylinder: { name: 'Hollow Cylinder', c: 1, color: '#8b5cf6' },
  disk: { name: 'Flat Disk', c: 1/2, color: '#10b981' },
};

type ShapeKey = keyof typeof SHAPES;

export function SimulationRolling() {
  const [selectedShapes, setSelectedShapes] = useState<ShapeKey[]>(['solid_sphere', 'hollow_cylinder']);
  const [mass, setMass] = useState(1); // kg
  const [diameter, setDiameter] = useState(0.5); // m
  const [angle, setAngle] = useState(30); // degrees
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useState(0);

  const reqRef = useRef(0);
  const lastTimeRef = useRef(0);

  const reset = () => {
    setIsPlaying(false);
    setTime(0);
    lastTimeRef.current = 0;
  };

  useEffect(() => {
    reset();
  }, [selectedShapes, mass, diameter, angle]);

  // Physics calculations
  const g = 9.81;
  const theta = (angle * Math.PI) / 180;
  const radius = diameter / 2;
  
  const activeShapes = selectedShapes.map(key => {
    const shape = SHAPES[key];
    const c = shape.c;
    const acceleration = (g * Math.sin(theta)) / (1 + c);
    const t_bottom = Math.sqrt((2 * 10) / acceleration); // 10 is rampLength
    return { key, ...shape, c, acceleration, t_bottom };
  });

  const max_t_bottom = activeShapes.length > 0 ? Math.max(...activeShapes.map(s => s.t_bottom)) : 0;
  
  // Visual coordinates
  const scale = 35; // pixels per meter
  const rampLength = 10; // meters
  const startX = 50;
  const startY = 30;
  const rampPixelLength = rampLength * scale;
  
  useEffect(() => {
    if (isPlaying && activeShapes.length > 0) {
      const animate = (t: number) => {
        if (!lastTimeRef.current) lastTimeRef.current = t;
        const dt = (t - lastTimeRef.current) / 1000;
        lastTimeRef.current = t;

        setTime(prev => {
          const newTime = prev + dt;
          if (newTime >= max_t_bottom) {
            setIsPlaying(false);
            return max_t_bottom;
          }
          return newTime;
        });

        reqRef.current = requestAnimationFrame(animate);
      };
      reqRef.current = requestAnimationFrame(animate);
    } else {
      lastTimeRef.current = 0;
    }
    return () => cancelAnimationFrame(reqRef.current);
  }, [isPlaying, max_t_bottom, activeShapes.length]);

  const endX = startX + rampPixelLength * Math.cos(theta);
  const endY = startY + rampPixelLength * Math.sin(theta);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 my-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h3 className="text-xl font-semibold text-slate-800">Interactive: Rolling Down an Incline</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-6">
          <p className="text-sm text-slate-600">
            Observe how the moment of inertia affects the rolling motion. Notice that mass and diameter do not affect the acceleration!
          </p>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Select Objects to Race
            </label>
            <div className="space-y-2 bg-white p-3 border border-slate-200 rounded-lg">
              {Object.entries(SHAPES).map(([key, { name, color }]) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={selectedShapes.includes(key as ShapeKey)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedShapes([...selectedShapes, key as ShapeKey]);
                      } else {
                        setSelectedShapes(selectedShapes.filter(s => s !== key));
                      }
                    }}
                    className="w-4 h-4 rounded border-slate-300"
                    style={{ accentColor: color }}
                  />
                  <span className="text-sm font-medium" style={{ color }}>{name}</span>
                </label>
              ))}
            </div>
            {selectedShapes.length === 0 && (
              <p className="text-xs text-red-500 mt-1">Please select at least one object.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Mass (<InlineMath math="M" />): {mass} kg
            </label>
            <input type="range" min="0.1" max="10" step="0.1" value={mass} onChange={(e) => setMass(Number(e.target.value))} className="w-full accent-blue-600" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Diameter (<InlineMath math="D" />): {diameter.toFixed(2)} m
            </label>
            <input type="range" min="0.2" max="2" step="0.1" value={diameter} onChange={(e) => setDiameter(Number(e.target.value))} className="w-full accent-blue-600" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Incline Angle (<InlineMath math="\theta" />): {angle}°
            </label>
            <input type="range" min="5" max="60" step="1" value={angle} onChange={(e) => setAngle(Number(e.target.value))} className="w-full accent-blue-600" />
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => setIsPlaying(!isPlaying)} 
              disabled={selectedShapes.length === 0}
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button 
              onClick={reset} 
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors border border-slate-200"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm space-y-3">
            <h4 className="font-semibold text-slate-800 border-b border-slate-200 pb-2">Real-time Data</h4>
            <div className="flex justify-between mb-2">
              <span className="text-slate-600">Time (<InlineMath math="t" />):</span>
              <span className="font-mono font-bold text-blue-600">{time.toFixed(2)} s</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="pb-1 font-medium">Shape</th>
                    <th className="pb-1 font-medium text-right">a (m/s²)</th>
                    <th className="pb-1 font-medium text-right">v (m/s)</th>
                  </tr>
                </thead>
                <tbody>
                  {activeShapes.sort((a, b) => b.acceleration - a.acceleration).map(s => {
                    const currentV = s.acceleration * Math.min(time, s.t_bottom);
                    return (
                      <tr key={s.key} className="border-b border-slate-100 last:border-0" style={{ color: s.color }}>
                        <td className="py-1 font-medium">{s.name.split(' ')[0]} {s.name.split(' ')[1]}</td>
                        <td className="py-1 text-right font-mono">{s.acceleration.toFixed(2)}</td>
                        <td className="py-1 text-right font-mono">{currentV.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="pt-2 border-t border-slate-200 text-xs text-slate-500">
              <BlockMath math="a = \frac{g \sin\theta}{1 + c}" />
            </div>
          </div>
        </div>

        {/* Visualization */}
        <div className="lg:col-span-2 bg-slate-50 rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center relative min-h-[400px]">
          <svg width="100%" height="100%" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid meet" className="w-full h-full">
            {/* Ground */}
            <line x1="0" y1={endY} x2="600" y2={endY} stroke="#94a3b8" strokeWidth="4" />
            
            {/* Ramp */}
            <polygon 
              points={`${startX},${startY} ${endX},${endY} ${startX},${endY}`} 
              fill="#cbd5e1" 
              stroke="#64748b" 
              strokeWidth="2" 
            />
            
            {/* Angle Arc */}
            <path 
              d={`M ${endX - 40} ${endY} A 40 40 0 0 1 ${endX - 40 * Math.cos(theta)} ${endY - 40 * Math.sin(theta)}`} 
              fill="none" 
              stroke="#64748b" 
              strokeWidth="2" 
            />
            <text x={endX - 45} y={endY - 10} fontSize="12" fill="#64748b" textAnchor="end">{angle}°</text>

            {/* Rolling Objects */}
            {activeShapes.map((shapeData, index) => {
              // Calculate current position for this specific shape
              const distance = Math.min(0.5 * shapeData.acceleration * time * time, rampLength);
              const objDistancePx = distance * scale;
              const cx = startX + objDistancePx * Math.cos(theta) + (radius * scale) * Math.sin(theta);
              const cy = startY + objDistancePx * Math.sin(theta) - (radius * scale) * Math.cos(theta);
              const rotationAngle = distance / radius; // radians
              
              const isHollow = shapeData.key.includes('hollow');
              
              return (
                <g key={shapeData.key} transform={`translate(${cx}, ${cy}) rotate(${rotationAngle * 180 / Math.PI})`}>
                  <circle 
                    cx="0" 
                    cy="0" 
                    r={radius * scale} 
                    fill={isHollow ? 'transparent' : shapeData.color} 
                    stroke={shapeData.color} 
                    strokeWidth={isHollow ? 4 : 2} 
                    opacity="0.8"
                  />
                  {/* Reference line to show rotation */}
                  <line x1="0" y1="0" x2={radius * scale} y2="0" stroke={isHollow ? shapeData.color : '#fff'} strokeWidth="2" />
                  <circle cx="0" cy="0" r="3" fill={isHollow ? shapeData.color : '#fff'} />
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
