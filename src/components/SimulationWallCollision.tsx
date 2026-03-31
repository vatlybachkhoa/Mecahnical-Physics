import React, { useState, useEffect, useRef } from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import { Play, Pause, RotateCcw } from 'lucide-react';

export function SimulationWallCollision() {
  const [velocity, setVelocity] = useState(10); // m/s
  const [angle, setAngle] = useState(30); // degrees (0 is straight at the wall)
  const [restitution, setRestitution] = useState(0.8); // e (0 to 1)
  
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
  }, [velocity, angle, restitution]);

  // Physics calculations
  const deg2rad = (deg: number) => (deg * Math.PI) / 180;
  const rad2deg = (rad: number) => (rad * 180) / Math.PI;

  const v_ix = velocity * Math.cos(deg2rad(angle));
  const v_iy = velocity * Math.sin(deg2rad(angle));

  // After collision
  const v_fx = -restitution * v_ix;
  const v_fy = v_iy; // Assuming no friction along the wall

  const v_f_mag = Math.sqrt(v_fx**2 + v_fy**2);
  // Angle of reflection relative to the normal (negative x-axis)
  const angle_f = v_fx !== 0 ? rad2deg(Math.atan(Math.abs(v_fy / v_fx))) : 90;

  // Animation parameters
  const scale = 20; // pixels per meter
  const wallX = 450;
  const hitX = wallX - 15; // 15 is ball radius
  const hitY = 200;
  
  // Dynamically adjust distanceX to fit within canvas height
  const maxVerticalDistance = 150; // max distance from hitY (200 +/- 150 = 50 to 350)
  const absTanAngle = Math.abs(Math.tan(deg2rad(angle)));
  const distanceX = absTanAngle > 0 ? Math.min(250, maxVerticalDistance / absTanAngle) : 250;
  
  const startX = hitX - distanceX;
  const startY = hitY - distanceX * Math.tan(deg2rad(angle)); // - because y goes up visually
  
  const t_hit = distanceX / (v_ix * scale);

  useEffect(() => {
    if (isPlaying) {
      const animate = (t: number) => {
        if (!lastTimeRef.current) lastTimeRef.current = t;
        const dt = (t - lastTimeRef.current) / 1000;
        lastTimeRef.current = t;

        setTime(prev => {
          const newTime = prev + dt;
          // Stop animation after it bounces back past the start
          if (newTime > t_hit * 2.5) {
            setIsPlaying(false);
            return t_hit * 2.5;
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
  }, [isPlaying, t_hit]);

  // Current position
  let currentX = startX;
  let currentY = startY;

  if (time <= t_hit) {
    currentX = startX + v_ix * scale * time;
    currentY = startY + v_iy * scale * time;
  } else {
    const timeAfterHit = time - t_hit;
    currentX = hitX + v_fx * scale * timeAfterHit;
    currentY = hitY + v_fy * scale * timeAfterHit;
  }

  // Draw arrow helper
  const drawArrow = (x: number, y: number, dx: number, dy: number, color: string, label: string) => {
    const endX = x + dx;
    const endY = y + dy;
    const arrowAngle = Math.atan2(dy, dx);
    const headlen = 10;
    
    return (
      <g>
        <line x1={x} y1={y} x2={endX} y2={endY} stroke={color} strokeWidth="3" />
        <polygon 
          points={`
            ${endX},${endY} 
            ${endX - headlen * Math.cos(arrowAngle - Math.PI / 6)},${endY - headlen * Math.sin(arrowAngle - Math.PI / 6)} 
            ${endX - headlen * Math.cos(arrowAngle + Math.PI / 6)},${endY - headlen * Math.sin(arrowAngle + Math.PI / 6)}
          `} 
          fill={color} 
        />
        <text 
          x={endX + 15 * Math.cos(arrowAngle)} 
          y={endY + 15 * Math.sin(arrowAngle) + 5} 
          fill={color} 
          fontSize="14" 
          fontWeight="bold"
          textAnchor="middle"
        >
          {label}
        </text>
      </g>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 my-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h3 className="text-xl font-semibold text-slate-800">Interactive: Ball Hitting a Wall</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-6">
          <p className="text-sm text-slate-600">
            A ball hits a vertical wall. The component of velocity perpendicular to the wall is reduced by the coefficient of restitution (<InlineMath math="e" />), while the parallel component remains unchanged.
          </p>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Initial Velocity (<InlineMath math="v_i" />): {velocity} m/s
            </label>
            <input type="range" min="5" max="25" step="1" value={velocity} onChange={(e) => setVelocity(Number(e.target.value))} className="w-full accent-blue-600" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Angle of Incidence (<InlineMath math="\theta_i" />): {angle}°
            </label>
            <input type="range" min="-60" max="60" step="5" value={angle} onChange={(e) => setAngle(Number(e.target.value))} className="w-full accent-blue-600" />
            <p className="text-xs text-slate-500 mt-1">0° means hitting straight on.</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Coefficient of Restitution (<InlineMath math="e" />): {restitution.toFixed(2)}
            </label>
            <input type="range" min="0" max="1" step="0.1" value={restitution} onChange={(e) => setRestitution(Number(e.target.value))} className="w-full accent-emerald-600" />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>0 (Inelastic)</span>
              <span>1 (Elastic)</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => setIsPlaying(!isPlaying)} 
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
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
            <h4 className="font-semibold text-slate-800 border-b border-slate-200 pb-2">After Collision</h4>
            <div className="flex justify-between">
              <span className="text-slate-600">Final Velocity (<InlineMath math="v_f" />):</span>
              <span className="font-mono font-bold text-red-600">{v_f_mag.toFixed(2)} m/s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Angle of Reflection (<InlineMath math="\theta_f" />):</span>
              <span className="font-mono font-bold text-red-600">{angle_f.toFixed(1)}°</span>
            </div>
            <div className="pt-2 border-t border-slate-200">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500"><InlineMath math="v_{fx} = -e \cdot v_{ix}" /></span>
                <span className="font-mono">{v_fx.toFixed(2)} m/s</span>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-slate-500"><InlineMath math="v_{fy} = v_{iy}" /></span>
                <span className="font-mono">{v_fy.toFixed(2)} m/s</span>
              </div>
            </div>
          </div>
        </div>

        {/* Visualization */}
        <div className="lg:col-span-2 bg-slate-50 rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center relative min-h-[400px]">
          <svg width="600" height="400" viewBox="0 0 600 400" className="w-full h-full">
            {/* Wall */}
            <rect x={wallX} y="0" width="20" height="400" fill="#94a3b8" />
            <line x1={wallX} y1="0" x2={wallX} y2="400" stroke="#475569" strokeWidth="4" />
            
            {/* Normal Line */}
            <line x1="0" y1={hitY} x2={wallX} y2={hitY} stroke="#cbd5e1" strokeWidth="2" strokeDasharray="5,5" />

            {/* Trajectory */}
            <line x1={startX} y1={startY} x2={hitX} y2={hitY} stroke="#3b82f6" strokeWidth="2" strokeDasharray="4,4" opacity="0.5" />
            <line x1={hitX} y1={hitY} x2={hitX + v_fx * scale * t_hit * 1.5} y2={hitY + v_fy * scale * t_hit * 1.5} stroke="#ef4444" strokeWidth="2" strokeDasharray="4,4" opacity="0.5" />

            {/* Ball */}
            <circle cx={currentX} cy={currentY} r="15" fill="#f59e0b" stroke="#d97706" strokeWidth="2" />
            
            {/* Velocity Vectors */}
            {time <= t_hit ? (
              // Initial Velocity Vector
              drawArrow(currentX, currentY, v_ix * 4, v_iy * 4, '#2563eb', 'v_i')
            ) : (
              // Final Velocity Vector
              drawArrow(currentX, currentY, v_fx * 4, v_fy * 4, '#dc2626', 'v_f')
            )}
          </svg>
        </div>
      </div>
    </div>
  );
}
