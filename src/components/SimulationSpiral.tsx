import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Settings2, Info, Eye, EyeOff } from 'lucide-react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

export function SimulationSpiral() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [radius, setRadius] = useState(8.0);
  const [period, setPeriod] = useState(5.0);
  const [vy, setVy] = useState(3.0); // y is vertical
  const [showTrace, setShowTrace] = useState(true);
  const [vectorSettings, setVectorSettings] = useState({
    v: true,
    vx: false,
    vy: false,
    a: true,
    ax: false,
    ay: false
  });
  
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const traceRef = useRef<{ x: number; y: number; z: number }[]>([]);

  // Constants & Calculations
  const omega = (2 * Math.PI) / period;
  const vh = omega * radius; // horizontal speed
  const vTotal = Math.sqrt(vh ** 2 + vy ** 2);
  const accelMag = (omega ** 2) * radius;
  const angleDeg = (Math.atan2(vy, vh) * 180) / Math.PI;

  const calculatePosition = (t: number) => {
    return {
      x: radius * Math.cos(omega * t),
      z: radius * Math.sin(omega * t), // z is the other horizontal axis
      y: vy * t, // y is vertical
      vx: -radius * omega * Math.sin(omega * t),
      vz: radius * omega * Math.cos(omega * t),
      vy: vy,
      ax: -radius * (omega ** 2) * Math.cos(omega * t),
      az: -radius * (omega ** 2) * Math.sin(omega * t),
      ay: 0
    };
  };

  const project = (x: number, y: number, z: number, width: number, height: number) => {
    // Isometric-like projection where Y is vertical
    const scale = 12;
    const centerX = width / 2;
    const centerY = height * 0.85;
    
    // x and z are horizontal, y is vertical
    const px = centerX + (x - z * 0.5) * scale;
    const py = centerY - (y * scale) + (z * 0.3) * scale;
    
    return { x: px, y: py };
  };

  const draw = (t: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    // Draw Ground Grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let i = -3; i <= 3; i++) {
      const p1 = project(-30, 0, i * 10, width, height);
      const p2 = project(30, 0, i * 10, width, height);
      ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();

      const p3 = project(i * 10, 0, -30, width, height);
      const p4 = project(i * 10, 0, 30, width, height);
      ctx.beginPath(); ctx.moveTo(p3.x, p3.y); ctx.lineTo(p4.x, p4.y); ctx.stroke();
    }

    // Draw Trace
    if (showTrace && traceRef.current.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
      ctx.lineWidth = 2;
      const start = project(traceRef.current[0].x, traceRef.current[0].y, traceRef.current[0].z, width, height);
      ctx.moveTo(start.x, start.y);
      for (let i = 1; i < traceRef.current.length; i++) {
        const p = project(traceRef.current[i].x, traceRef.current[i].y, traceRef.current[i].z, width, height);
        ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }

    // Current State
    const state = calculatePosition(t);
    const pos = project(state.x, state.y, state.z, width, height);

    // Draw Bird
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#6366f1';
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw Coordinates near particle
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px JetBrains Mono';
    ctx.fillText(`x: ${state.x.toFixed(1)}`, pos.x + 12, pos.y - 5);
    ctx.fillText(`y: ${state.y.toFixed(1)}`, pos.x + 12, pos.y + 7);

    // Draw Vectors - Shortened scale
    const vScale = 1.5; 
    const aScale = 0.8; 

    if (vectorSettings.v) {
      drawVector(ctx, pos, state.vx, state.vy, state.vz, vScale, '#10b981', 'v', width, height, t);
    }
    if (vectorSettings.vx) {
      drawVector(ctx, pos, state.vx, 0, 0, vScale, '#34d399', 'vx', width, height, t);
    }
    if (vectorSettings.vy) {
      drawVector(ctx, pos, 0, state.vy, 0, vScale, '#059669', 'vy', width, height, t);
    }
    if (vectorSettings.a) {
      drawVector(ctx, pos, state.ax, state.ay, state.az, aScale, '#ef4444', 'a', width, height, t);
    }
    if (vectorSettings.ax) {
      drawVector(ctx, pos, state.ax, 0, 0, aScale, '#f87171', 'ax', width, height, t);
    }
    if (vectorSettings.ay) {
      drawVector(ctx, pos, 0, state.ay, 0, aScale, '#b91c1c', 'ay', width, height, t);
    }
  };

  const drawVector = (ctx: CanvasRenderingContext2D, startPos: {x: number, y: number}, dx: number, dy: number, dz: number, scale: number, color: string, label: string, width: number, height: number, t: number) => {
    const state = calculatePosition(t);
    const end = project(state.x + dx * scale, state.y + dy * scale, state.z + dz * scale, width, height);
    
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 3;
    ctx.moveTo(startPos.x, startPos.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    
    const angle = Math.atan2(end.y - startPos.y, end.x - startPos.x);
    const headlen = 8;
    ctx.beginPath();
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(end.x - headlen * Math.cos(angle - Math.PI / 6), end.y - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(end.x - headlen * Math.cos(angle + Math.PI / 6), end.y - headlen * Math.sin(angle + Math.PI / 6));
    ctx.fill();

    ctx.font = 'bold 12px Inter';
    ctx.fillText(label, end.x + 5 * Math.cos(angle), end.y + 5 * Math.sin(angle));
  };

  useEffect(() => {
    const animate = (t: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = t;
      const dt = (t - lastTimeRef.current) / 1000;
      lastTimeRef.current = t;

      let nextTime = time;
      if (isRunning) {
        nextTime = time + dt;
        const state = calculatePosition(nextTime);
        traceRef.current.push({ x: state.x, y: state.y, z: state.z });
        if (traceRef.current.length > 1000) traceRef.current.shift();
        if (state.y > 40) { // Reset height loop
          traceRef.current = [];
          nextTime = 0;
        }
        setTime(nextTime);
      }
      draw(nextTime);
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [isRunning, radius, period, vy, showTrace, vectorSettings, time]);

  const reset = () => {
    setTime(0);
    setIsRunning(false);
    lastTimeRef.current = 0;
    traceRef.current = [];
    draw(0);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 rounded-2xl p-6 shadow-2xl overflow-hidden relative border border-slate-800">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              Spiraling Up: Bird on a Thermal
            </h3>
            <p className="text-slate-400 text-sm">Circular motion with constant upward velocity (Y is vertical)</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setIsRunning(!isRunning)}
              className={`p-3 rounded-full transition-all ${isRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'} text-white shadow-lg`}
            >
              {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
            <button 
              onClick={reset}
              className="p-3 rounded-full bg-slate-700 hover:bg-slate-600 text-white transition-all shadow-lg"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
          </div>
        </div>

        <canvas 
          ref={canvasRef} 
          width={800} 
          height={500} 
          className="w-full bg-slate-950 rounded-xl border border-slate-800"
        />

        {/* Data Overlay */}
        <div className="absolute top-24 left-10 right-10 grid grid-cols-2 md:grid-cols-4 gap-3 pointer-events-none z-10">
          <div className="bg-slate-900/90 backdrop-blur-md p-2 rounded-lg border border-slate-700 shadow-lg">
            <p className="text-slate-500 text-[9px] uppercase tracking-wider font-bold">Position (x, y, z)</p>
            <p className="text-white font-mono text-xs">({calculatePosition(time).x.toFixed(1)}, {calculatePosition(time).y.toFixed(1)}, {calculatePosition(time).z.toFixed(1)})</p>
          </div>
          <div className="bg-slate-900/90 backdrop-blur-md p-2 rounded-lg border border-slate-700 shadow-lg">
            <p className="text-slate-500 text-[9px] uppercase tracking-wider font-bold">Total Speed (v)</p>
            <p className="text-emerald-400 font-mono text-xs">{vTotal.toFixed(2)} m/s</p>
          </div>
          <div className="bg-slate-900/90 backdrop-blur-md p-2 rounded-lg border border-slate-700 shadow-lg">
            <p className="text-slate-500 text-[9px] uppercase tracking-wider font-bold">Acceleration (a)</p>
            <p className="text-rose-400 font-mono text-xs">{accelMag.toFixed(2)} m/s²</p>
          </div>
          <div className="bg-slate-900/90 backdrop-blur-md p-2 rounded-lg border border-slate-700 shadow-lg">
            <p className="text-slate-500 text-[9px] uppercase tracking-wider font-bold">Angle (θ)</p>
            <p className="text-indigo-400 font-mono text-xs">{angleDeg.toFixed(1)}°</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Settings2 className="w-5 h-5 text-slate-400" />
            <h4 className="font-semibold text-slate-800">Parameters</h4>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs font-medium text-slate-600">Radius (R)</label>
                <span className="text-xs font-mono text-indigo-600 font-bold">{radius.toFixed(2)} m</span>
              </div>
              <input 
                type="range" min="2" max="20" step="0.5" value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs font-medium text-slate-600">Period (T)</label>
                <span className="text-xs font-mono text-indigo-600 font-bold">{period.toFixed(2)} s</span>
              </div>
              <input 
                type="range" min="1" max="10" step="0.1" value={period}
                onChange={(e) => setPeriod(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs font-medium text-slate-600">Vertical Speed (v_y)</label>
                <span className="text-xs font-mono text-indigo-600 font-bold">{vy.toFixed(2)} m/s</span>
              </div>
              <input 
                type="range" min="0" max="10" step="0.1" value={vy}
                onChange={(e) => setVy(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Vector Display</h5>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 text-xs cursor-pointer hover:bg-slate-50 p-1 rounded">
                  <input type="checkbox" checked={vectorSettings.v} onChange={() => setVectorSettings(p => ({...p, v: !p.v}))} className="accent-emerald-500" />
                  <span>v</span>
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer hover:bg-slate-50 p-1 rounded">
                  <input type="checkbox" checked={vectorSettings.vx} onChange={() => setVectorSettings(p => ({...p, vx: !p.vx}))} className="accent-emerald-400" />
                  <span>v_x</span>
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer hover:bg-slate-50 p-1 rounded">
                  <input type="checkbox" checked={vectorSettings.vy} onChange={() => setVectorSettings(p => ({...p, vy: !p.vy}))} className="accent-emerald-600" />
                  <span>v_y</span>
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer hover:bg-slate-50 p-1 rounded">
                  <input type="checkbox" checked={vectorSettings.a} onChange={() => setVectorSettings(p => ({...p, a: !p.a}))} className="accent-rose-500" />
                  <span>a</span>
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer hover:bg-slate-50 p-1 rounded">
                  <input type="checkbox" checked={vectorSettings.ax} onChange={() => setVectorSettings(p => ({...p, ax: !p.ax}))} className="accent-rose-400" />
                  <span>a_x</span>
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer hover:bg-slate-50 p-1 rounded">
                  <input type="checkbox" checked={vectorSettings.ay} onChange={() => setVectorSettings(p => ({...p, ay: !p.ay}))} className="accent-rose-700" />
                  <span>a_y</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-indigo-500" />
            <h4 className="font-semibold text-slate-800">Physics Analysis</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-600">
            <div className="space-y-4">
              <div>
                <p className="font-bold text-slate-800 mb-1">(a) Speed relative to ground</p>
                <p>Horizontal speed: <InlineMath math="v_h = \omega R = \frac{2\pi R}{T}" /></p>
                <p>Total speed: <InlineMath math="v = \sqrt{v_x^2 + v_y^2 + v_z^2}" /></p>
                <p className="font-bold text-emerald-600 mt-1">Result: {vTotal.toFixed(2)} m/s</p>
              </div>
              
              <div>
                <p className="font-bold text-slate-800 mb-1">(b) Acceleration</p>
                <p>Vertical acceleration <InlineMath math="a_y = 0" />.</p>
                <p>Horizontal acceleration: <InlineMath math="a_h = \omega^2 R" /></p>
                <p className="font-bold text-rose-600 mt-1">Result: {accelMag.toFixed(2)} m/s²</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="font-bold text-slate-800 mb-1">(c) Angle with horizontal</p>
                <p>The angle <InlineMath math="\theta" /> is given by:</p>
                <BlockMath math="\tan \theta = \frac{v_y}{v_h}" />
                <p className="font-bold text-indigo-600 mt-1">Result: {angleDeg.toFixed(1)}°</p>
              </div>

              <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <p className="text-xs font-bold text-indigo-800 uppercase mb-2">Coordinate System</p>
                <ul className="list-disc list-inside space-y-1 text-[10px] text-indigo-700">
                  <li><strong>Y-axis:</strong> Vertical (Height)</li>
                  <li><strong>X-axis:</strong> Horizontal (East-West)</li>
                  <li><strong>Z-axis:</strong> Horizontal (North-South)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
