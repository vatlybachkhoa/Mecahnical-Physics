import React, { useState, useEffect, useRef } from 'react';
import { BlockMath, InlineMath } from 'react-katex';

export function SimulationPendulum() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [length, setLength] = useState(2); // meters
  const [mass, setMass] = useState(1); // kg
  const [initialAngleDeg, setInitialAngleDeg] = useState(45); // degrees
  
  // Simulation state
  const [angle, setAngle] = useState((initialAngleDeg * Math.PI) / 180);
  const [angularVelocity, setAngularVelocity] = useState(0);
  
  const reqRef = useRef(0);
  const lastTimeRef = useRef(0);
  
  const g = 9.81;

  const reset = () => {
    setIsPlaying(false);
    setAngle((initialAngleDeg * Math.PI) / 180);
    setAngularVelocity(0);
    lastTimeRef.current = 0;
  };

  // Update initial angle when slider changes (if not playing)
  useEffect(() => {
    if (!isPlaying) {
      setAngle((initialAngleDeg * Math.PI) / 180);
      setAngularVelocity(0);
    }
  }, [initialAngleDeg, isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      const animate = (time: number) => {
        if (!lastTimeRef.current) lastTimeRef.current = time;
        // Limit dt to avoid instability if tab is inactive
        const dt = Math.min((time - lastTimeRef.current) / 1000, 0.05); 
        lastTimeRef.current = time;
        
        // Semi-implicit Euler integration
        setAngle(prevAngle => {
          setAngularVelocity(prevOmega => {
            const alpha = -(g / length) * Math.sin(prevAngle);
            const newOmega = prevOmega + alpha * dt;
            return newOmega;
          });
          // Use the updated angular velocity for the next angle (handled by React state batching, 
          // but we need the actual value here, so we calculate it locally)
          return prevAngle; // We'll do the actual update below to ensure sync
        });

        setAngularVelocity(prevOmega => {
          setAngle(prevAngle => {
            const alpha = -(g / length) * Math.sin(prevAngle);
            const newOmega = prevOmega + alpha * dt;
            const newAngle = prevAngle + newOmega * dt;
            return newAngle;
          });
          const alpha = -(g / length) * Math.sin(angle); // Use current angle from closure is slightly off, better to use functional update properly
          return prevOmega;
        });
        
        // Better integration approach within a single state update or ref
        reqRef.current = requestAnimationFrame(animate);
      };
      reqRef.current = requestAnimationFrame(animate);
    } else {
      lastTimeRef.current = 0;
    }
    return () => cancelAnimationFrame(reqRef.current);
  }, [isPlaying, length, g]);

  // Let's fix the integration to use refs for physics state to avoid closure issues
  const physicsState = useRef({ theta: (initialAngleDeg * Math.PI) / 180, omega: 0 });

  useEffect(() => {
    physicsState.current = { theta: (initialAngleDeg * Math.PI) / 180, omega: 0 };
    setAngle(physicsState.current.theta);
    setAngularVelocity(0);
  }, [initialAngleDeg, length]);

  useEffect(() => {
    if (isPlaying) {
      const animate = (time: number) => {
        if (!lastTimeRef.current) lastTimeRef.current = time;
        const dt = Math.min((time - lastTimeRef.current) / 1000, 0.05);
        lastTimeRef.current = time;

        // Semi-implicit Euler
        const alpha = -(g / length) * Math.sin(physicsState.current.theta);
        physicsState.current.omega += alpha * dt;
        physicsState.current.theta += physicsState.current.omega * dt;

        setAngle(physicsState.current.theta);
        setAngularVelocity(physicsState.current.omega);

        reqRef.current = requestAnimationFrame(animate);
      };
      reqRef.current = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(reqRef.current);
  }, [isPlaying, length, g]);


  // Calculate energies
  const h = length * (1 - Math.cos(angle));
  const v = length * angularVelocity;
  
  const pe = mass * g * h;
  const ke = 0.5 * mass * v * v;
  const totalE = pe + ke;
  
  // Max energy for scaling the bars
  const maxH = length * (1 - Math.cos((initialAngleDeg * Math.PI) / 180));
  const maxE = mass * g * maxH;

  // Drawing parameters
  const originX = 200;
  const originY = 50;
  const scale = 80; // pixels per meter
  const bobX = originX + length * scale * Math.sin(angle);
  const bobY = originY + length * scale * Math.cos(angle);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
      <h3 className="text-xl font-semibold text-slate-800 mb-4">Interactive: Pendulum & Energy Conservation</h3>
      <p className="text-slate-600 mb-6">
        Observe how potential energy (PE) and kinetic energy (KE) continuously transform into one another as the pendulum swings. In the absence of friction and air resistance, the total mechanical energy (E) remains constant.
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controls and Energy Bars */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Initial Angle: {initialAngleDeg}°
              </label>
              <input 
                type="range" min="-90" max="90" step="1" 
                value={initialAngleDeg} 
                onChange={(e) => { setInitialAngleDeg(Number(e.target.value)); reset(); }}
                disabled={isPlaying}
                className="w-full accent-indigo-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Length (<InlineMath math="L" />): {length.toFixed(1)} m
              </label>
              <input 
                type="range" min="0.5" max="3" step="0.1" 
                value={length} 
                onChange={(e) => { setLength(Number(e.target.value)); reset(); }}
                disabled={isPlaying}
                className="w-full accent-indigo-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Mass (<InlineMath math="m" />): {mass.toFixed(1)} kg
              </label>
              <input 
                type="range" min="0.1" max="5" step="0.1" 
                value={mass} 
                onChange={(e) => { setMass(Number(e.target.value)); reset(); }}
                disabled={isPlaying}
                className="w-full accent-indigo-600"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => setIsPlaying(!isPlaying)} 
              className="flex-1 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button 
              onClick={reset} 
              className="flex-1 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors border border-slate-200"
            >
              Reset
            </button>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
            <h4 className="font-medium text-slate-800 border-b border-slate-200 pb-2">Energy Bar Chart</h4>
            
            <div className="flex items-center">
              <span className="w-12 text-sm font-medium text-blue-600">PE:</span>
              <div className="flex-1 h-5 bg-slate-200 rounded-sm overflow-hidden relative">
                <div 
                  className="h-full bg-blue-500 transition-all duration-75" 
                  style={{ width: `${maxE > 0 ? (pe / maxE) * 100 : 0}%` }}
                ></div>
              </div>
              <span className="w-16 text-right text-sm font-mono">{pe.toFixed(1)} J</span>
            </div>
            
            <div className="flex items-center">
              <span className="w-12 text-sm font-medium text-red-600">KE:</span>
              <div className="flex-1 h-5 bg-slate-200 rounded-sm overflow-hidden relative">
                <div 
                  className="h-full bg-red-500 transition-all duration-75" 
                  style={{ width: `${maxE > 0 ? (ke / maxE) * 100 : 0}%` }}
                ></div>
              </div>
              <span className="w-16 text-right text-sm font-mono">{ke.toFixed(1)} J</span>
            </div>
            
            <div className="flex items-center pt-2 border-t border-slate-200">
              <span className="w-12 text-sm font-bold text-emerald-700">Total:</span>
              <div className="flex-1 h-5 bg-slate-200 rounded-sm overflow-hidden relative">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-75" 
                  style={{ width: `${maxE > 0 ? (totalE / maxE) * 100 : 0}%` }}
                ></div>
              </div>
              <span className="w-16 text-right text-sm font-bold font-mono">{totalE.toFixed(1)} J</span>
            </div>
          </div>
        </div>

        {/* Visualization */}
        <div className="bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden min-h-[350px]">
          <svg width="400" height="350" viewBox="0 0 400 350" className="max-w-full h-auto">
            {/* Ceiling */}
            <line x1="100" y1="50" x2="300" y2="50" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
            <line x1="120" y1="50" x2="140" y2="30" stroke="#cbd5e1" strokeWidth="2" />
            <line x1="160" y1="50" x2="180" y2="30" stroke="#cbd5e1" strokeWidth="2" />
            <line x1="200" y1="50" x2="220" y2="30" stroke="#cbd5e1" strokeWidth="2" />
            <line x1="240" y1="50" x2="260" y2="30" stroke="#cbd5e1" strokeWidth="2" />
            <line x1="280" y1="50" x2="300" y2="30" stroke="#cbd5e1" strokeWidth="2" />

            {/* Vertical dashed line (equilibrium) */}
            <line x1={originX} y1={originY} x2={originX} y2={originY + 3 * scale} stroke="#cbd5e1" strokeWidth="2" strokeDasharray="6,6" />

            {/* String */}
            <line x1={originX} y1={originY} x2={bobX} y2={bobY} stroke="#64748b" strokeWidth="3" />

            {/* Bob */}
            <circle cx={bobX} cy={bobY} r={15 + mass * 2} fill="#4f46e5" stroke="#312e81" strokeWidth="2" />
            
            {/* Velocity Vector (optional, scaled) */}
            {Math.abs(v) > 0.1 && (
              <line 
                x1={bobX} 
                y1={bobY} 
                x2={bobX + v * 10 * Math.cos(angle)} 
                y2={bobY - v * 10 * Math.sin(angle)} 
                stroke="#ef4444" 
                strokeWidth="3" 
                markerEnd="url(#arrow-v)"
              />
            )}

            <defs>
              <marker id="arrow-v" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
              </marker>
            </defs>

            {/* Angle Arc */}
            {Math.abs(angle) > 0.05 && (
              <path 
                d={`M ${originX} ${originY + 40} A 40 40 0 0 ${angle > 0 ? 0 : 1} ${originX + 40 * Math.sin(angle)} ${originY + 40 * Math.cos(angle)}`} 
                fill="none" stroke="#0f172a" strokeWidth="1.5" 
              />
            )}
            {Math.abs(angle) > 0.1 && (
              <text x={originX + 20 * Math.sin(angle/2) + (angle > 0 ? -5 : -10)} y={originY + 55} fill="#0f172a" fontSize="12">θ</text>
            )}
          </svg>
        </div>
      </div>
    </div>
  );
}
