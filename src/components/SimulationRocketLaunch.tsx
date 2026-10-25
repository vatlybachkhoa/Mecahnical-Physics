import React, { useState, useEffect, useRef } from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import { Play, Pause, RotateCcw, Info } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from 'recharts';

export function SimulationRocketLaunch() {
  const [T, setT] = useState(2); // Engine burn time (s)
  const [g, setG] = useState(9.8); // Gravity (m/s^2)
  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [vectorSettings, setVectorSettings] = useState({
    v: true,
    vx: false,
    vy: false,
    a0: true,
    g: true
  });
  
  const angleDeg = 53.1;
  const angleRad = (angleDeg * Math.PI) / 180;
  const cosTheta = Math.cos(angleRad); // ~0.6
  const sinTheta = Math.sin(angleRad); // ~0.8

  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Derived values at t = T
  const v_xT = 0.6 * g * T;
  const v_yT = 0.8 * g * T;
  const x_T = 0.3 * g * T * T;
  const y_T = 0.4 * g * T * T;

  // Total flight time calculation
  // y(t) = y_T + v_yT * deltaT - 0.5 * g * deltaT^2 = 0
  // 0.4 g T^2 + 0.8 g T * deltaT - 0.5 g * deltaT^2 = 0
  // 0.5 * deltaT^2 - 0.8 T * deltaT - 0.4 T^2 = 0
  // deltaT = (0.8 T + sqrt(0.64 T^2 + 0.8 T^2)) / 1 = 0.8 T + 1.2 T = 2.0 T
  const totalTime = T + 2.0 * T; // 3.0 T
  const maxAltitude = 0.72 * g * T * T;
  const range = 1.5 * g * T * T;

  const getPhysics = (t: number) => {
    if (t <= T) {
      const ax = g * cosTheta;
      const ay = g * sinTheta;
      const vx = ax * t;
      const vy = ay * t;
      const x = 0.5 * ax * t * t;
      const y = 0.5 * ay * t * t;
      return { x, y, vx, vy, ax, ay };
    } else {
      const dt = t - T;
      const ax = 0;
      const ay = -g;
      const vx = v_xT;
      const vy = v_yT - g * dt;
      const x = x_T + v_xT * dt;
      const y = y_T + v_yT * dt - 0.5 * g * dt * dt;
      return { x, y, vx, vy, ax, ay };
    }
  };

  useEffect(() => {
    if (!isPlaying) return;

    const animate = (now: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = now;
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      setTime((prevTime) => {
        const nextTime = prevTime + dt;
        if (nextTime >= totalTime) {
          setIsPlaying(false);
          return totalTime;
        }
        return nextTime;
      });

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, totalTime]);

  const handleReset = () => {
    setIsPlaying(false);
    setTime(0);
    lastTimeRef.current = 0;
  };

  const handleCanvasInteraction = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;

    // Scaling (must match drawing logic)
    const maxX = range * 1.1;
    const maxY = maxAltitude * 1.2;
    const scaleX = (width - 2 * padding) / maxX;
    const scaleY = (height - 2 * padding) / maxY;
    const scale = Math.min(scaleX, scaleY);

    // Find nearest time t
    let bestT = 0;
    let minSqDist = Infinity;

    // Sample trajectory to find nearest point
    for (let i = 0; i <= 200; i++) {
      const t = (i / 200) * totalTime;
      const pos = getPhysics(t);
      const px = padding + pos.x * scale;
      const py = height - padding - pos.y * scale;
      
      const dx = mouseX - (px * (canvas.clientWidth / width));
      const dy = mouseY - (py * (canvas.clientHeight / height));
      const sqDist = dx * dx + dy * dy;

      if (sqDist < minSqDist) {
        minSqDist = sqDist;
        bestT = t;
      }
    }

    // Only snap if close enough (e.g., 50px)
    if (minSqDist < 2500) {
      setIsPlaying(false);
      setTime(bestT);
    }
  };

  // Generate graph data
  const graphData = [];
  const steps = 100;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * totalTime;
    const { vx, vy } = getPhysics(t);
    graphData.push({
      time: t.toFixed(2),
      vx: vx,
      vy: vy,
    });
  }

  // Canvas drawing
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;

    // Scaling
    const maxX = range * 1.1;
    const maxY = maxAltitude * 1.2;
    const scaleX = (width - 2 * padding) / maxX;
    const scaleY = (height - 2 * padding) / maxY;
    const scale = Math.min(scaleX, scaleY);

    ctx.clearRect(0, 0, width, height);

    // Draw axes
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(padding, padding);
    ctx.stroke();

    // Draw trajectory
    ctx.strokeStyle = '#cbd5e1';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    for (let i = 0; i <= 100; i++) {
      const t = (i / 100) * totalTime;
      const { x, y } = getPhysics(t);
      const px = padding + x * scale;
      const py = height - padding - y * scale;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw powered phase highlight
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i <= 50; i++) {
      const t = (i / 50) * T;
      const { x, y } = getPhysics(t);
      const px = padding + x * scale;
      const py = height - padding - y * scale;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Draw current position
    const current = getPhysics(time);
    const cx = padding + current.x * scale;
    const cy = height - padding - current.y * scale;

    // Draw rocket
    ctx.save();
    ctx.translate(cx, cy);
    const angle = Math.atan2(-current.vy, current.vx);
    ctx.rotate(angle + Math.PI / 2);
    
    // Rocket body
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(0, -15);
    ctx.lineTo(7, 5);
    ctx.lineTo(-7, 5);
    ctx.closePath();
    ctx.fill();
    
    // Flame if engine is on
    if (time <= T && isPlaying) {
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(-4, 5);
      ctx.lineTo(0, 15 + Math.random() * 5);
      ctx.lineTo(4, 5);
      ctx.fill();
    }
    ctx.restore();

    // Draw vectors
    const vectorScale = 1.2; // Increased from 0.5
    const accelScale = vectorScale * 8; // Increased from vectorScale * 5
    
    // 1. Initial Acceleration a0 (Blue) - Only shown during powered phase or as a reference
    if (vectorSettings.a0 && time <= T) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2.5;
      const ax0 = g * cosTheta;
      const ay0 = g * sinTheta;
      drawVector(ctx, cx, cy, ax0 * accelScale, -ay0 * accelScale, '#3b82f6', 'a₀');
    }

    // 2. Gravity g (Red/Orange)
    if (vectorSettings.g) {
      drawVector(ctx, cx, cy, 0, g * accelScale, '#ef4444', 'g');
    }

    // 3. Total Velocity v (Green)
    if (vectorSettings.v) {
      drawVector(ctx, cx, cy, current.vx * vectorScale, -current.vy * vectorScale, '#22c55e', 'v');
    }

    // 4. Horizontal Velocity vx (Emerald)
    if (vectorSettings.vx) {
      drawVector(ctx, cx, cy, current.vx * vectorScale, 0, '#10b981', 'vₓ');
    }

    // 5. Vertical Velocity vy (Cyan)
    if (vectorSettings.vy) {
      drawVector(ctx, cx, cy, 0, -current.vy * vectorScale, '#06b6d4', 'vᵧ');
    }

  }, [time, T, g, vectorSettings, isPlaying, range, maxAltitude, totalTime]);

  // Helper to draw vectors with arrowheads
  function drawVector(ctx: CanvasRenderingContext2D, x: number, y: number, dx: number, dy: number, color: string, label?: string) {
    if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) return;
    
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 3; // Increased from 2
    
    const headLength = 12; // Increased from 10
    const angle = Math.atan2(dy, dx);
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + dx, y + dy);
    ctx.stroke();
    
    // Arrow head
    ctx.beginPath();
    ctx.moveTo(x + dx, y + dy);
    ctx.lineTo(x + dx - headLength * Math.cos(angle - Math.PI / 6), y + dy - headLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x + dx - headLength * Math.cos(angle + Math.PI / 6), y + dy - headLength * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();

    if (label) {
      ctx.font = 'bold 14px Inter, sans-serif'; // Increased from 12px
      const labelOffset = 15;
      ctx.fillText(label, x + dx + labelOffset * Math.cos(angle), y + dy + labelOffset * Math.sin(angle));
    }
  }

  return (
    <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-2xl font-semibold text-slate-800 mb-2">Rocket Launch Simulation</h2>
        <p className="text-slate-600">
          A rocket accelerates at <InlineMath math="g" /> at <InlineMath math="53.1^\circ" /> for time <InlineMath math="T" />, then enters projectile motion.
        </p>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls and Info */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Engine Burn Time (<InlineMath math="T" />): {T} s
            </label>
            <input 
              type="range" min="1" max="5" step="0.1" value={T} 
              onChange={(e) => { setT(Number(e.target.value)); handleReset(); }}
              className="w-full accent-indigo-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Gravity (<InlineMath math="g" />): {g} m/s²
            </label>
            <input 
              type="range" min="5" max="20" step="0.1" value={g} 
              onChange={(e) => { setG(Number(e.target.value)); handleReset(); }}
              className="w-full accent-indigo-600"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              {isPlaying ? 'Pause' : 'Launch'}
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <RotateCcw size={20} />
              Reset
            </button>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
            <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Info size={16} className="text-indigo-600" />
              Vector Display
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 text-xs cursor-pointer hover:bg-white p-1 rounded transition-colors">
                <input type="checkbox" checked={vectorSettings.v} onChange={() => setVectorSettings(prev => ({ ...prev, v: !prev.v }))} className="accent-green-500" />
                <span className="text-slate-600">Velocity <InlineMath math="\vec{v}" /></span>
              </label>
              <label className="flex items-center gap-2 text-xs cursor-pointer hover:bg-white p-1 rounded transition-colors">
                <input type="checkbox" checked={vectorSettings.vx} onChange={() => setVectorSettings(prev => ({ ...prev, vx: !prev.vx }))} className="accent-emerald-500" />
                <span className="text-slate-600">Component <InlineMath math="v_x" /></span>
              </label>
              <label className="flex items-center gap-2 text-xs cursor-pointer hover:bg-white p-1 rounded transition-colors">
                <input type="checkbox" checked={vectorSettings.vy} onChange={() => setVectorSettings(prev => ({ ...prev, vy: !prev.vy }))} className="accent-cyan-500" />
                <span className="text-slate-600">Component <InlineMath math="v_y" /></span>
              </label>
              <label className="flex items-center gap-2 text-xs cursor-pointer hover:bg-white p-1 rounded transition-colors">
                <input type="checkbox" checked={vectorSettings.a0} onChange={() => setVectorSettings(prev => ({ ...prev, a0: !prev.a0 }))} className="accent-blue-500" />
                <span className="text-slate-600">Accel <InlineMath math="\vec{a}_0" /></span>
              </label>
              <label className="flex items-center gap-2 text-xs cursor-pointer hover:bg-white p-1 rounded transition-colors">
                <input type="checkbox" checked={vectorSettings.g} onChange={() => setVectorSettings(prev => ({ ...prev, g: !prev.g }))} className="accent-red-500" />
                <span className="text-slate-600">Gravity <InlineMath math="\vec{g}" /></span>
              </label>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3 text-sm">
            <h4 className="font-semibold text-slate-800 border-b border-slate-200 pb-2">Calculated Results</h4>
            <div className="flex justify-between">
              <span className="text-slate-600">Max Altitude:</span>
              <span className="font-mono font-bold text-indigo-600">{maxAltitude.toFixed(2)} m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Total Range:</span>
              <span className="font-mono font-bold text-indigo-600">{range.toFixed(2)} m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Total Flight Time:</span>
              <span className="font-mono font-bold text-indigo-600">{totalTime.toFixed(2)} s</span>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-200">
              <p className="text-xs text-slate-500 italic">
                Max Altitude = <InlineMath math="0.72 g T^2" />
              </p>
              <p className="text-xs text-slate-500 italic">
                Range = <InlineMath math="1.5 g T^2" />
              </p>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-slate-600">Velocity Vector</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-slate-600">Acceleration Vector</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
              <span className="text-slate-600">Powered Phase (Engine On)</span>
            </div>
          </div>
        </div>

        {/* Trajectory Canvas */}
        <div className="lg:col-span-2 space-y-8">
          <div className="relative bg-slate-50 rounded-xl border border-slate-200 overflow-hidden cursor-crosshair group">
            <canvas 
              ref={canvasRef} 
              width={600} 
              height={400} 
              className="w-full h-auto block"
              onMouseDown={handleCanvasInteraction}
              onMouseMove={(e) => e.buttons === 1 && handleCanvasInteraction(e)}
              onTouchMove={handleCanvasInteraction}
            />
            <div className="absolute top-4 left-4 bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Click or drag trajectory to scrub time
            </div>
            <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded border border-slate-200 text-xs font-mono">
              Time: {time.toFixed(2)}s / {totalTime.toFixed(2)}s
            </div>
          </div>

          {/* Velocity Graphs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-72">
            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <h4 className="text-sm font-semibold text-slate-600 mb-4 text-center">Horizontal Velocity (vₓ vs t)</h4>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={graphData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="time" 
                    type="number" 
                    domain={[0, totalTime]} 
                    ticks={[0, Number(T.toFixed(2)), Number(totalTime.toFixed(2))]}
                    tick={{ fontSize: 10 }}
                    label={{ value: 'Time (s)', position: 'bottom', offset: 0, fontSize: 10 }}
                  />
                  <YAxis tick={{ fontSize: 10 }} label={{ value: 'vₓ (m/s)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                  <Tooltip 
                    formatter={(value: number) => [value.toFixed(2) + ' m/s', 'vₓ']}
                    labelFormatter={(label) => 'Time: ' + label + 's'}
                  />
                  <ReferenceLine x={T} stroke="#f59e0b" strokeDasharray="3 3" label={{ position: 'top', value: 't=T', fontSize: 10, fill: '#f59e0b', fontWeight: 'bold' }} />
                  <ReferenceLine y={v_xT} stroke="#22c55e" strokeDasharray="3 3" opacity={0.3} />
                  <Line type="monotone" dataKey="vx" stroke="#22c55e" dot={false} strokeWidth={3} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <h4 className="text-sm font-semibold text-slate-600 mb-4 text-center">Vertical Velocity (vᵧ vs t)</h4>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={graphData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="time" 
                    type="number" 
                    domain={[0, totalTime]} 
                    ticks={[0, Number(T.toFixed(2)), Number((1.8 * T).toFixed(2)), Number(totalTime.toFixed(2))]}
                    tick={{ fontSize: 10 }}
                    label={{ value: 'Time (s)', position: 'bottom', offset: 0, fontSize: 10 }}
                  />
                  <YAxis tick={{ fontSize: 10 }} label={{ value: 'vᵧ (m/s)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                  <Tooltip 
                    formatter={(value: number) => [value.toFixed(2) + ' m/s', 'vᵧ']}
                    labelFormatter={(label) => 'Time: ' + label + 's'}
                  />
                  <ReferenceLine x={T} stroke="#f59e0b" strokeDasharray="3 3" label={{ position: 'top', value: 't=T', fontSize: 10, fill: '#f59e0b', fontWeight: 'bold' }} />
                  <ReferenceLine x={1.8 * T} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'top', value: '1.8T (Peak)', fontSize: 10, fill: '#ef4444', fontWeight: 'bold' }} />
                  <ReferenceLine x={totalTime} stroke="#94a3b8" strokeDasharray="3 3" label={{ position: 'top', value: '3T (Land)', fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} />
                  <ReferenceLine y={0} stroke="#475569" strokeWidth={1} />
                  <ReferenceLine y={v_yT} stroke="#3b82f6" strokeDasharray="3 3" opacity={0.3} />
                  <Line type="monotone" dataKey="vy" stroke="#3b82f6" dot={false} strokeWidth={3} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
