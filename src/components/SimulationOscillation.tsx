import React, { useState, useMemo, useEffect, useRef } from 'react';
import { InlineMath } from 'react-katex';
import { Play, Pause, RotateCcw } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot
} from 'recharts';

export function SimulationOscillation() {
  const [amplitude, setAmplitude] = useState(2);
  const [mass, setMass] = useState(1);
  const [springConstant, setSpringConstant] = useState(10);
  const [damping, setDamping] = useState(0); // b coefficient
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const omega_n = Math.sqrt(springConstant / mass);
  const criticalDamping = 2 * Math.sqrt(mass * springConstant);
  const zeta = damping / criticalDamping;
  
  // Calculate period for graph domain (use undamped period as reference)
  const period = 2 * Math.PI / omega_n;

  const getPosition = (t: number) => {
    if (zeta === 0) {
      // Undamped
      return amplitude * Math.cos(omega_n * t);
    } else if (zeta < 1) {
      // Underdamped
      const omega_d = omega_n * Math.sqrt(1 - zeta * zeta);
      const phi = Math.atan(-zeta / Math.sqrt(1 - zeta * zeta));
      const A = amplitude / Math.cos(phi);
      return A * Math.exp(-zeta * omega_n * t) * Math.cos(omega_d * t + phi);
    } else if (zeta === 1) {
      // Critically damped
      return amplitude * (1 + omega_n * t) * Math.exp(-omega_n * t);
    } else {
      // Overdamped
      const r1 = omega_n * (-zeta + Math.sqrt(zeta * zeta - 1));
      const r2 = omega_n * (-zeta - Math.sqrt(zeta * zeta - 1));
      const C1 = (amplitude * r2) / (r2 - r1);
      const C2 = (-amplitude * r1) / (r2 - r1);
      return C1 * Math.exp(r1 * t) + C2 * Math.exp(r2 * t);
    }
  };

  const data = useMemo(() => {
    const points = [];
    for (let t = 0; t <= Math.max(10, period * 3); t += 0.1) {
      points.push({
        time: Number(t.toFixed(1)),
        position: Number(getPosition(t).toFixed(3))
      });
    }
    return points;
  }, [amplitude, mass, springConstant, damping, period]);

  useEffect(() => {
    const animate = (currentTime: number) => {
      if (!isPlaying) {
        lastTimeRef.current = currentTime;
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      const dt = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;
      setTime(prev => prev + dt);
      animationRef.current = requestAnimationFrame(animate);
    };
    lastTimeRef.current = performance.now();
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying]);

  const currentPosition = getPosition(time);

  // Canvas drawing for spring and mass
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = 40; // pixels per meter

    // Draw wall
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(0, centerY - 40, 20, 80);

    // Draw spring
    const springStartX = 20;
    const blockX = centerX + currentPosition * scale;
    
    ctx.beginPath();
    ctx.moveTo(springStartX, centerY);
    
    const numCoils = 15;
    const springWidth = blockX - springStartX;
    const coilWidth = springWidth / numCoils;
    
    for (let i = 0; i < numCoils; i++) {
      ctx.lineTo(springStartX + i * coilWidth + coilWidth / 2, centerY + (i % 2 === 0 ? 15 : -15));
    }
    ctx.lineTo(blockX, centerY);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw block
    const blockSize = 50;
    ctx.fillStyle = '#4f46e5';
    ctx.fillRect(blockX, centerY - blockSize/2, blockSize, blockSize);
    ctx.strokeStyle = '#312e81';
    ctx.lineWidth = 2;
    ctx.strokeRect(blockX, centerY - blockSize/2, blockSize, blockSize);
    
    // Equilibrium line
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 60);
    ctx.lineTo(centerX, centerY + 60);
    ctx.strokeStyle = '#cbd5e1';
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
    
    ctx.fillStyle = '#64748b';
    ctx.font = '12px Inter';
    ctx.fillText('x = 0', centerX - 12, centerY + 75);

  }, [currentPosition]);

  const getDampingType = () => {
    if (zeta === 0) return "Undamped";
    if (zeta < 1) return "Underdamped";
    if (zeta === 1) return "Critically Damped";
    return "Overdamped";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h3 className="text-xl font-semibold text-slate-800">Damped Harmonic Motion</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium border ${
          zeta === 0 ? 'bg-slate-100 text-slate-700 border-slate-200' :
          zeta < 1 ? 'bg-blue-50 text-blue-700 border-blue-200' :
          zeta === 1 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
          'bg-orange-50 text-orange-700 border-orange-200'
        }`}>
          {getDampingType()} (ζ = {zeta.toFixed(2)})
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Amplitude (<InlineMath math="A_0" />): {amplitude} m
          </label>
          <input type="range" min="0.5" max="4" step="0.1" value={amplitude} onChange={(e) => setAmplitude(Number(e.target.value))} className="w-full accent-indigo-600" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Mass (<InlineMath math="m" />): {mass} kg
          </label>
          <input type="range" min="0.5" max="5" step="0.5" value={mass} onChange={(e) => setMass(Number(e.target.value))} className="w-full accent-indigo-600" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Spring Constant (<InlineMath math="k" />): {springConstant} N/m
          </label>
          <input type="range" min="2" max="50" step="1" value={springConstant} onChange={(e) => setSpringConstant(Number(e.target.value))} className="w-full accent-indigo-600" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Damping Coeff (<InlineMath math="b" />): {damping.toFixed(1)} N·s/m
          </label>
          <input type="range" min="0" max="20" step="0.1" value={damping} onChange={(e) => setDamping(Number(e.target.value))} className="w-full accent-indigo-600" />
          <div className="text-xs text-slate-500 mt-1">Critical damping: {criticalDamping.toFixed(2)}</div>
        </div>
      </div>

      <div className="w-full bg-slate-50 rounded-lg border border-slate-200 overflow-hidden mb-6 relative">
        <canvas ref={canvasRef} width={800} height={200} className="w-full h-auto block" />
      </div>

      <div className="flex items-center justify-center gap-4 mb-8">
        <button onClick={() => setIsPlaying(!isPlaying)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button onClick={() => { setTime(0); setIsPlaying(false); }} className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-2 rounded-lg font-medium transition-colors">
          <RotateCcw className="w-5 h-5" />
          Reset
        </button>
        <div className="ml-4 text-slate-700 font-mono">
          Time: {time.toFixed(2)} s
        </div>
      </div>

      <div className="h-80 w-full bg-slate-50 p-4 rounded-lg border border-slate-200">
        <h4 className="text-center font-medium text-slate-700 mb-2">Position vs. Time</h4>
        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="time" type="number" domain={[0, 'dataMax']} label={{ value: 'Time (s)', position: 'insideBottom', offset: -10 }} />
            <YAxis domain={[-5, 5]} label={{ value: 'Position (m)', angle: -90, position: 'insideLeft', offset: 10 }} />
            <Tooltip formatter={(value: number) => [`${value} m`, 'Position']} labelFormatter={(label: number) => `Time: ${label} s`} />
            <ReferenceLine y={0} stroke="#94a3b8" />
            <Line type="monotone" dataKey="position" stroke="#4f46e5" strokeWidth={3} dot={false} isAnimationActive={false} />
            <ReferenceDot x={time % Math.max(10, period * 3)} y={currentPosition} r={6} fill="#f97316" stroke="#fff" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
