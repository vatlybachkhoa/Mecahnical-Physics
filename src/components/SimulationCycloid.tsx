import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, Info, Settings2, Activity, Eye, EyeOff } from 'lucide-react';
import { BlockMath, InlineMath } from 'react-katex';

interface CycloidState {
  time: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  ax: number;
  ay: number;
}

export function SimulationCycloid() {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [radius, setRadius] = useState(40);
  const [omega, setOmega] = useState(2);
  const [showVectors, setShowVectors] = useState(true);
  const [showWheel, setShowWheel] = useState(true);
  const [showTrace, setShowTrace] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const traceRef = useRef<{ x: number; y: number }[]>([]);

  const R = radius;
  const w = omega;
  const offsetX = 50;

  const calculateState = (t: number): CycloidState => {
    const x = R * (w * t - Math.sin(w * t));
    const y = R * (1 - Math.cos(w * t));
    const vx = R * w * (1 - Math.cos(w * t));
    const vy = R * w * Math.sin(w * t);
    const ax = R * w * w * Math.sin(w * t);
    const ay = R * w * w * Math.cos(w * t);
    return { time: t, x, y, vx, vy, ax, ay };
  };

  const draw = (currentTime: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const groundY = height - 60;

    ctx.clearRect(0, 0, width, height);

    // Draw Ground
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(width, groundY);
    ctx.stroke();

    // Draw Grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 100) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    const current = calculateState(currentTime);
    const px = offsetX + current.x;
    const py = groundY - current.y;

    // Draw Trace
    if (showTrace && traceRef.current.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 3;
      ctx.lineJoin = 'round';
      ctx.moveTo(traceRef.current[0].x, traceRef.current[0].y);
      for (let i = 1; i < traceRef.current.length; i++) {
        ctx.lineTo(traceRef.current[i].x, traceRef.current[i].y);
      }
      ctx.stroke();
    }

    // Draw Wheel
    if (showWheel) {
      const centerX = offsetX + R * w * currentTime;
      const centerY = groundY - R;

      ctx.beginPath();
      ctx.arc(centerX, centerY, R, 0, Math.PI * 2);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw Spokes
      for (let i = 0; i < 8; i++) {
        const angle = i * Math.PI / 4 + w * currentTime;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + R * Math.cos(angle), centerY + R * Math.sin(angle));
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Highlight Spoke to the point
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(px, py);
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw Center
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw Particle
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#4f46e5';
    ctx.fillStyle = '#4f46e5';
    ctx.beginPath();
    ctx.arc(px, py, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw Vectors
    if (showVectors) {
      const vectorScale = 0.5;
      const accelScale = 0.2;

      // Velocity Vector (Green)
      drawVector(ctx, px, py, current.vx * vectorScale, -current.vy * vectorScale, '#22c55e', 'v');
      
      // Acceleration Vector (Red)
      drawVector(ctx, px, py, current.ax * accelScale, -current.ay * accelScale, '#ef4444', 'a');
    }
  };

  const drawVector = (ctx: CanvasRenderingContext2D, x: number, y: number, dx: number, dy: number, color: string, label: string) => {
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
    
    const headlen = 10;
    const angle = Math.atan2(dy, dx);
    
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 3;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + dx, y + dy);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(x + dx, y + dy);
    ctx.lineTo(x + dx - headlen * Math.cos(angle - Math.PI / 6), y + dy - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x + dx - headlen * Math.cos(angle + Math.PI / 6), y + dy - headlen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();

    ctx.font = 'bold 14px Inter';
    ctx.fillText(label, x + dx + 8 * Math.cos(angle), y + dy + 8 * Math.sin(angle));
  };

  useEffect(() => {
    const animate = (t: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = t;
      }
      const dt = (t - lastTimeRef.current) / 1000;
      lastTimeRef.current = t;

      let nextTime = time;
      if (isRunning) {
        nextTime = time + dt;
        
        // Update Trace
        const state = calculateState(nextTime);
        const px = offsetX + state.x;
        const py = (canvasRef.current?.height || 300) - 60 - state.y;
        
        traceRef.current.push({ x: px, y: py });
        if (traceRef.current.length > 2000) traceRef.current.shift();

        // Loop if it goes off screen
        if (offsetX + R * w * nextTime > (canvasRef.current?.width || 800) + R) {
          traceRef.current = [];
          nextTime = 0;
        }
        setTime(nextTime);
      }
      
      draw(nextTime);
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isRunning, radius, omega, showWheel, showTrace, showVectors, time]);

  const reset = () => {
    setTime(0);
    setIsRunning(false);
    lastTimeRef.current = 0;
    traceRef.current = [];
    draw(0);
  };

  const current = calculateState(time);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 rounded-2xl p-6 shadow-2xl overflow-hidden relative border border-slate-800">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg">
              <Activity className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Cycloid Trajectory</h3>
              <p className="text-slate-400 text-xs">Rolling wheel point motion</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowInfo(!showInfo)}
              className={`p-2 rounded-lg transition-colors ${showInfo ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
              <Info className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsRunning(!isRunning)}
              className={`p-2 rounded-lg transition-colors ${isRunning ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'}`}
            >
              {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button 
              onClick={reset}
              className="p-2 bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>

        <canvas 
          ref={canvasRef}
          width={800}
          height={300}
          className="w-full bg-slate-950 rounded-xl border border-slate-800 cursor-crosshair"
        />

        {/* Real-time Data Overlay - Moved to top */}
        <div className="absolute top-20 left-6 right-6 grid grid-cols-2 md:grid-cols-4 gap-3 pointer-events-none z-10">
          <div className="bg-slate-900/90 backdrop-blur-md p-2 rounded-lg border border-slate-700 shadow-lg">
            <p className="text-slate-500 text-[9px] uppercase tracking-wider font-bold">Position (x, y)</p>
            <p className="text-white font-mono text-xs">({current.x.toFixed(1)}, {current.y.toFixed(1)})</p>
          </div>
          <div className="bg-slate-900/90 backdrop-blur-md p-2 rounded-lg border border-slate-700 shadow-lg">
            <p className="text-slate-500 text-[9px] uppercase tracking-wider font-bold">Velocity (v)</p>
            <p className="text-emerald-400 font-mono text-xs">{Math.sqrt(current.vx**2 + current.vy**2).toFixed(1)} m/s</p>
          </div>
          <div className="bg-slate-900/90 backdrop-blur-md p-2 rounded-lg border border-slate-700 shadow-lg">
            <p className="text-slate-500 text-[9px] uppercase tracking-wider font-bold">Acceleration (a)</p>
            <p className="text-rose-400 font-mono text-xs">{Math.sqrt(current.ax**2 + current.ay**2).toFixed(1)} m/s²</p>
          </div>
          <div className="bg-slate-900/90 backdrop-blur-md p-2 rounded-lg border border-slate-700 shadow-lg">
            <p className="text-slate-500 text-[9px] uppercase tracking-wider font-bold">Time (t)</p>
            <p className="text-indigo-400 font-mono text-xs">{time.toFixed(2)} s</p>
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
                <label className="text-xs font-medium text-slate-600">Wheel Radius (R)</label>
                <span className="text-xs font-mono text-indigo-600 font-bold">{radius} m</span>
              </div>
              <input 
                type="range" min="10" max="60" value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs font-medium text-slate-600">Angular Velocity (ω)</label>
                <span className="text-xs font-mono text-indigo-600 font-bold">{omega} rad/s</span>
              </div>
              <input 
                type="range" min="0.5" max="5" step="0.1" value={omega}
                onChange={(e) => setOmega(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Critical Points</h5>
              <div className="grid grid-cols-1 gap-2">
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-[10px] font-bold text-indigo-600 uppercase">Highest Point (Peak)</p>
                  <p className="text-[11px] text-slate-600 mt-1">
                    <InlineMath math="t = \pi/\omega" /> ≈ {(Math.PI / omega).toFixed(2)} s
                  </p>
                  <p className="text-[11px] text-slate-600">
                    <InlineMath math="(x, y) = (R\pi, 2R)" />
                  </p>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-[10px] font-bold text-rose-600 uppercase">Rest Point (Cusp)</p>
                  <p className="text-[11px] text-slate-600 mt-1">
                    <InlineMath math="t = 2\pi/\omega" /> ≈ {(2 * Math.PI / omega).toFixed(2)} s
                  </p>
                  <p className="text-[11px] text-slate-600">
                    <InlineMath math="(x, y) = (2R\pi, 0)" />
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-1">
              <button 
                onClick={() => setShowWheel(!showWheel)}
                className="w-full flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <span className="text-xs text-slate-600">Show Rolling Wheel</span>
                {showWheel ? <Eye className="w-4 h-4 text-indigo-500" /> : <EyeOff className="w-4 h-4 text-slate-300" />}
              </button>
              <button 
                onClick={() => setShowTrace(!showTrace)}
                className="w-full flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <span className="text-xs text-slate-600">Show Trajectory Trace</span>
                {showTrace ? <Eye className="w-4 h-4 text-indigo-500" /> : <EyeOff className="w-4 h-4 text-slate-300" />}
              </button>
              <button 
                onClick={() => setShowVectors(!showVectors)}
                className="w-full flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <span className="text-xs text-slate-600">Show Velocity/Accel Vectors</span>
                {showVectors ? <Eye className="w-4 h-4 text-indigo-500" /> : <EyeOff className="w-4 h-4 text-slate-300" />}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <AnimatePresence mode="wait">
            {showInfo ? (
              <motion.div 
                key="info"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="prose prose-slate max-w-none"
              >
                <h4 className="text-lg font-bold text-slate-800 mb-4">Cycloid Analysis</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="text-sm font-bold text-indigo-600 uppercase mb-2">Kinematics</h5>
                    <div className="text-sm space-y-2">
                      <p><strong>Velocity:</strong></p>
                      <BlockMath math="v_x = R\omega(1 - \cos \omega t)" />
                      <BlockMath math="v_y = R\omega \sin \omega t" />
                      <p><strong>Acceleration:</strong></p>
                      <BlockMath math="a_x = R\omega^2 \sin \omega t" />
                      <BlockMath math="a_y = R\omega^2 \cos \omega t" />
                    </div>
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-rose-600 uppercase mb-2">Key Findings</h5>
                    <ul className="text-sm space-y-2 list-disc pl-4">
                      <li><strong>Rest Points:</strong> Particle is at rest when <InlineMath math="\omega t = 2n\pi" />. These are the cusps on the ground.</li>
                      <li><strong>Acceleration Magnitude:</strong> <InlineMath math="|a| = R\omega^2" />. It is constant in magnitude!</li>
                      <li><strong>Comparison:</strong> Like uniform circular motion, the acceleration magnitude is constant, but its direction rotates as the wheel rolls.</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="equations"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <h4 className="text-lg font-bold text-slate-800 mb-4">Equations of Motion</h4>
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 space-y-6">
                  <div>
                    <p className="text-sm text-slate-500 mb-3 font-medium">Parametric Position Equations:</p>
                    <div className="flex flex-col gap-4">
                      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                        <BlockMath math="x(t) = R(\omega t - \sin \omega t)" />
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                        <BlockMath math="y(t) = R(1 - \cos \omega t)" />
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 italic">
                    This traces the path of a point on the rim of a wheel of radius R rolling with constant angular velocity ω.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
