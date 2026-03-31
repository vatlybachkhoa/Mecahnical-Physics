import React, { useState, useEffect, useRef } from 'react';
import { InlineMath, BlockMath } from 'react-katex';

interface SimulationPulleyProps {
  showPulleyMass?: boolean;
}

export function SimulationPulley({ showPulleyMass = true }: SimulationPulleyProps) {
  const [mode, setMode] = useState<'fixed' | 'movable'>('fixed');
  const [m1, setM1] = useState(5);
  const [m2, setM2] = useState(3);
  
  const [considerPulleyMass, setConsiderPulleyMass] = useState(false);
  const [pulleyMassInput, setPulleyMassInput] = useState(2);
  const [showForces, setShowForces] = useState(false);
  
  const pulleyMass = considerPulleyMass ? pulleyMassInput : 0;
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useState(0);
  
  const reqRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const g = 9.81;

  // Calculations
  let a1 = 0, a2 = 0, T1 = 0, T2 = 0, T3 = 0;
  
  if (mode === 'fixed') {
    // Atwood machine
    const a = g * (m1 - m2) / (m1 + m2 + 0.5 * pulleyMass);
    a1 = a; // m1 acceleration (down is positive)
    a2 = -a; // m2 acceleration (down is positive, so -a means up)
    T1 = m1 * (g - a1);
    T2 = m2 * (g - a2); // g - (-a) = g + a
  } else {
    // Movable pulley system
    // m1 pulls down, m2 is lifted by movable pulley
    // Assume both fixed and movable pulleys have mass = pulleyMass
    const M_load = m2 + pulleyMass;
    const numerator = m1 - 0.5 * M_load;
    const denominator = 2 * m1 + pulleyMass + 0.5 * M_load + 0.25 * pulleyMass;
    a2 = g * numerator / denominator; // upward acceleration of m2
    a1 = 2 * a2; // downward acceleration of m1
    
    T1 = m1 * (g - a1);
    T2 = T1 - pulleyMass * a2;
    T3 = T2 - 0.5 * pulleyMass * a2;
  }

  const reset = () => {
    setIsPlaying(false);
    setTime(0);
  };

  useEffect(() => {
    reset();
  }, [mode, m1, m2, pulleyMass]);

  useEffect(() => {
    if (isPlaying) {
      const animate = (now: number) => {
        if (!lastTimeRef.current) lastTimeRef.current = now;
        const dt = (now - lastTimeRef.current) / 1000;
        lastTimeRef.current = now;
        
        setTime(t => {
          const newTime = t + dt;
          // Stop if masses go out of bounds (approx 3 seconds or 4 meters)
          if (newTime > 3) {
            setIsPlaying(false);
            return 3;
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
  }, [isPlaying]);

  // Drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const scale = 40; // pixels per meter
    const R = 20; // pulley radius in pixels
    
    const drawArrow = (x: number, y: number, dx: number, dy: number, color: string, label: string, align: 'left' | 'right' = 'right') => {
      const headlen = 8;
      const angle = Math.atan2(dy, dx);
      const endX = x + dx;
      const endY = y + dy;
      
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(endX - headlen * Math.cos(angle - Math.PI / 6), endY - headlen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(endX - headlen * Math.cos(angle + Math.PI / 6), endY - headlen * Math.sin(angle + Math.PI / 6));
      ctx.fillStyle = color;
      ctx.fill();
      
      if (label) {
        ctx.fillStyle = color;
        ctx.font = '12px sans-serif';
        ctx.textAlign = align;
        const offsetX = align === 'right' ? 8 : -8;
        ctx.fillText(label, endX + offsetX, endY + 4);
      }
    };

    // Calculate displacements
    const y1_disp = 0.5 * a1 * time * time * scale;
    let y2_disp = 0;
    if (mode === 'fixed') {
      y2_disp = 0.5 * a2 * time * time * scale; // a2 is negative if m1 > m2, so it moves up
    } else {
      y2_disp = -0.5 * a2 * time * time * scale; // a2 is upward, so negative y displacement
    }

    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;

    if (mode === 'fixed') {
      const cx = canvas.width / 2;
      const cy = 60;
      
      // Ceiling
      ctx.beginPath();
      ctx.moveTo(cx - 40, 20);
      ctx.lineTo(cx + 40, 20);
      ctx.stroke();
      
      // Pulley support
      ctx.beginPath();
      ctx.moveTo(cx, 20);
      ctx.lineTo(cx, cy);
      ctx.stroke();
      
      // Pulley
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, 2 * Math.PI);
      ctx.fillStyle = '#e2e8f0';
      ctx.fill();
      ctx.stroke();
      
      // Strings
      const leftX = cx - R;
      const rightX = cx + R;
      const m1Y = cy + 100 + y1_disp;
      const m2Y = cy + 100 + y2_disp;
      
      ctx.beginPath();
      ctx.moveTo(leftX, cy);
      ctx.lineTo(leftX, m1Y);
      ctx.moveTo(rightX, cy);
      ctx.lineTo(rightX, m2Y);
      ctx.stroke();
      
      // Masses
      ctx.fillStyle = '#ef4444'; // m1 red
      ctx.fillRect(leftX - 15, m1Y, 30, 30);
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.fillText('m1', leftX, m1Y + 20);
      
      ctx.fillStyle = '#3b82f6'; // m2 blue
      ctx.fillRect(rightX - 15, m2Y, 30, 30);
      ctx.fillStyle = 'white';
      ctx.fillText('m2', rightX, m2Y + 20);
      
      // Forces
      if (showForces) {
        const fScale = 1.5; // pixels per Newton
        // On m1
        drawArrow(leftX, m1Y + 15, 0, m1 * g * fScale, '#ef4444', 'P₁', 'right');
        drawArrow(leftX, m1Y, 0, -T1 * fScale, '#f59e0b', 'T₁', 'right');
        // On m2
        drawArrow(rightX, m2Y + 15, 0, m2 * g * fScale, '#3b82f6', 'P₂', 'left');
        drawArrow(rightX, m2Y, 0, -T2 * fScale, '#f59e0b', 'T₂', 'left');
        // On Pulley
        drawArrow(leftX, cy, 0, T1 * fScale, '#f59e0b', 'T₁\'', 'left');
        drawArrow(rightX, cy, 0, T2 * fScale, '#f59e0b', 'T₂\'', 'right');
      }
      
    } else {
      // Movable pulley
      const cx_fixed = canvas.width / 2 + 40;
      const cy_fixed = 60;
      
      // Ceiling
      ctx.beginPath();
      ctx.moveTo(cx_fixed - 100, 20);
      ctx.lineTo(cx_fixed + 40, 20);
      ctx.stroke();
      
      // Fixed Pulley support
      ctx.beginPath();
      ctx.moveTo(cx_fixed, 20);
      ctx.lineTo(cx_fixed, cy_fixed);
      ctx.stroke();
      
      // Fixed Pulley
      ctx.beginPath();
      ctx.arc(cx_fixed, cy_fixed, R, 0, 2 * Math.PI);
      ctx.fillStyle = '#e2e8f0';
      ctx.fill();
      ctx.stroke();
      
      // Movable Pulley initial Y
      const cy_movable_init = cy_fixed + 120;
      const cy_movable = cy_movable_init + y2_disp;
      const cx_movable = cx_fixed - 2 * R;
      
      // Strings
      const rightX = cx_fixed + R; // m1 string
      const midX = cx_fixed - R; // between pulleys
      const leftX = cx_movable - R; // fixed to ceiling
      
      const m1Y = cy_fixed + 100 + y1_disp;
      
      ctx.beginPath();
      // m1 string
      ctx.moveTo(rightX, cy_fixed);
      ctx.lineTo(rightX, m1Y);
      // between pulleys
      ctx.moveTo(midX, cy_fixed);
      ctx.lineTo(midX, cy_movable);
      // movable to ceiling
      ctx.moveTo(leftX, cy_movable);
      ctx.lineTo(leftX, 20);
      ctx.stroke();
      
      // Movable Pulley
      ctx.beginPath();
      ctx.arc(cx_movable, cy_movable, R, 0, 2 * Math.PI);
      ctx.fillStyle = '#e2e8f0';
      ctx.fill();
      ctx.stroke();
      
      // Movable Pulley support to m2
      ctx.beginPath();
      ctx.moveTo(cx_movable, cy_movable + R);
      ctx.lineTo(cx_movable, cy_movable + R + 20);
      ctx.stroke();
      
      // Masses
      ctx.fillStyle = '#ef4444'; // m1 red
      ctx.fillRect(rightX - 15, m1Y, 30, 30);
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.fillText('m1', rightX, m1Y + 20);
      
      ctx.fillStyle = '#3b82f6'; // m2 blue
      const m2Y = cy_movable + R + 20;
      ctx.fillRect(cx_movable - 15, m2Y, 30, 30);
      ctx.fillStyle = 'white';
      ctx.fillText('m2', cx_movable, m2Y + 20);

      // Forces
      if (showForces) {
        const fScale = 1.5;
        // On m1
        drawArrow(rightX, m1Y + 15, 0, m1 * g * fScale, '#ef4444', 'P₁', 'left');
        drawArrow(rightX, m1Y, 0, -T1 * fScale, '#f59e0b', 'T₁', 'left');
        // On m2 + movable pulley
        drawArrow(cx_movable, m2Y + 15, 0, (m2 + pulleyMass) * g * fScale, '#3b82f6', 'P₂', 'right');
        drawArrow(midX, cy_movable, 0, -T2 * fScale, '#f59e0b', 'T₂', 'right');
        drawArrow(leftX, cy_movable, 0, -T3 * fScale, '#f59e0b', 'T₃', 'left');
        // On Fixed Pulley
        drawArrow(rightX, cy_fixed, 0, T1 * fScale, '#f59e0b', 'T₁\'', 'left');
        drawArrow(midX, cy_fixed, 0, T2 * fScale, '#f59e0b', 'T₂\'', 'right');
      }
    }
  }, [mode, time, a1, a2, showForces, considerPulleyMass, pulleyMassInput]);

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm my-6">
      <h4 className="text-lg font-semibold text-slate-800 mb-4">Interactive: Pulley Systems</h4>
      
      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => setMode('fixed')} 
          className={`px-4 py-2 rounded-md font-medium transition-colors ${mode === 'fixed' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
        >
          Fixed Pulley (Atwood)
        </button>
        <button 
          onClick={() => setMode('movable')} 
          className={`px-4 py-2 rounded-md font-medium transition-colors ${mode === 'movable' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
        >
          Movable Pulley
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mass 1 (m₁ - pulling): {m1} kg</label>
              <input type="range" min="1" max="10" step="0.5" value={m1} onChange={e => setM1(Number(e.target.value))} className="w-full accent-red-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mass 2 (m₂ - load): {m2} kg</label>
              <input type="range" min="1" max="10" step="0.5" value={m2} onChange={e => setM2(Number(e.target.value))} className="w-full accent-blue-500" />
            </div>
            
            <div className="pt-2 border-t border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer mb-3">
                <input 
                  type="checkbox" 
                  checked={considerPulleyMass} 
                  onChange={(e) => setConsiderPulleyMass(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-slate-700">Consider Pulley Mass & Inertia</span>
              </label>
              
              {considerPulleyMass && (
                <div className="pl-6">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Pulley Mass (M): {pulleyMassInput} kg</label>
                  <input type="range" min="0.5" max="5" step="0.5" value={pulleyMassInput} onChange={e => setPulleyMassInput(Number(e.target.value))} className="w-full accent-slate-500" />
                  <p className="text-xs text-slate-500 mt-1">A massive pulley requires torque to rotate, causing tension differences (<InlineMath math="T_1 \neq T_2" />).</p>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={showForces} 
                  onChange={(e) => setShowForces(e.target.checked)}
                  className="w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-500"
                />
                <span className="text-sm font-medium text-slate-700">Show Force Vectors (FBD)</span>
              </label>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <button onClick={() => setIsPlaying(!isPlaying)} className="px-6 py-2 bg-emerald-600 text-white font-medium rounded hover:bg-emerald-700 transition-colors">
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button onClick={reset} className="px-6 py-2 bg-slate-200 text-slate-700 font-medium rounded hover:bg-slate-300 transition-colors">
              Reset
            </button>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm space-y-3">
            <h5 className="font-semibold text-slate-800 border-b border-slate-200 pb-2">Real-time Data</h5>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-slate-500">Acceleration (m₁)</span>
                <span className="font-mono font-medium text-red-600">{Math.abs(a1).toFixed(2)} m/s² {a1 >= 0 ? '↓' : '↑'}</span>
              </div>
              <div>
                <span className="block text-slate-500">Acceleration (m₂)</span>
                <span className="font-mono font-medium text-blue-600">{Math.abs(a2).toFixed(2)} m/s² {mode === 'fixed' ? (a2 >= 0 ? '↓' : '↑') : (a2 >= 0 ? '↑' : '↓')}</span>
              </div>
              <div>
                <span className="block text-slate-500">Tension (T₁)</span>
                <span className="font-mono font-medium">{T1.toFixed(2)} N</span>
              </div>
              <div>
                <span className="block text-slate-500">Tension (T₂)</span>
                <span className="font-mono font-medium">{T2.toFixed(2)} N</span>
              </div>
            </div>
            {mode === 'movable' && (
              <div className="pt-2 border-t border-slate-200">
                <span className="block text-slate-500">Mechanical Advantage</span>
                <span className="font-mono font-medium text-indigo-600">Ideal: 2 | Actual: {(m2 * g / T1).toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center items-center bg-slate-50 rounded-lg border border-slate-200 overflow-hidden h-[400px]">
          <canvas ref={canvasRef} width={300} height={400} className="block" />
        </div>
      </div>
    </div>
  );
}
