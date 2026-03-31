import React, { useState, useEffect, useRef } from 'react';
import { InlineMath } from 'react-katex';
import { Play, Pause, RotateCcw } from 'lucide-react';

export function SimulationMovingCart() {
  const [cartVelocity, setCartVelocity] = useState(15); // m/s
  const [launchVelocity, setLaunchVelocity] = useState(20); // m/s
  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useState(0);

  const reqRef = useRef(0);
  const lastTimeRef = useRef(0);
  const g = 9.81;

  const timeOfFlight = (2 * launchVelocity) / g;

  const reset = () => {
    setIsPlaying(false);
    setTime(0);
    lastTimeRef.current = 0;
  };

  useEffect(() => {
    if (isPlaying) {
      const animate = (t: number) => {
        if (!lastTimeRef.current) lastTimeRef.current = t;
        const dt = (t - lastTimeRef.current) / 1000;
        lastTimeRef.current = t;

        setTime(prev => {
          const newTime = prev + dt;
          if (newTime >= timeOfFlight) {
            setIsPlaying(false);
            return timeOfFlight;
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
  }, [isPlaying, timeOfFlight]);

  // Drawing parameters
  const scale = 5; 
  const groundY = 300;
  const startX = 40;

  const currentCartX = startX + cartVelocity * time * scale;
  const currentProjX = startX + cartVelocity * time * scale;
  const currentProjY = groundY - (launchVelocity * time - 0.5 * g * time * time) * scale;

  // Generate path
  let pathD = `M ${startX} ${groundY}`;
  for (let t = 0; t <= time; t += 0.05) {
    const px = startX + cartVelocity * t * scale;
    const py = groundY - (launchVelocity * t - 0.5 * g * t * t) * scale;
    pathD += ` L ${px} ${py}`;
  }
  // Ensure the last point is exactly at current time
  pathD += ` L ${currentProjX} ${currentProjY}`;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 my-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h3 className="text-xl font-semibold text-slate-800">Interactive: The Moving Cart & Rocket</h3>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <p className="text-sm text-slate-600">
            A cart moves horizontally with constant velocity <InlineMath math="v_0" />. It fires a rocket straight up (relative to the cart) with velocity <InlineMath math="v_{y0}" />. Notice how the rocket always stays directly above the cart and lands back in it!
          </p>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Cart Velocity (<InlineMath math="v_0" />): {cartVelocity} m/s
            </label>
            <input 
              type="range" min="0" max="30" step="1" 
              value={cartVelocity} 
              onChange={(e) => { setCartVelocity(Number(e.target.value)); reset(); }}
              className="w-full accent-indigo-600"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Launch Velocity (<InlineMath math="v_{y0}" />): {launchVelocity} m/s
            </label>
            <input 
              type="range" min="5" max="25" step="1" 
              value={launchVelocity} 
              onChange={(e) => { setLaunchVelocity(Number(e.target.value)); reset(); }}
              className="w-full accent-red-500"
            />
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => {
                if (time >= timeOfFlight) setTime(0);
                setIsPlaying(!isPlaying);
              }} 
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

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-600">Time (<InlineMath math="t" />):</span>
              <span className="font-mono font-medium">{time.toFixed(2)} s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Cart Position (<InlineMath math="x" />):</span>
              <span className="font-mono font-medium text-indigo-700">{(cartVelocity * time).toFixed(1)} m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Rocket Height (<InlineMath math="y" />):</span>
              <span className="font-mono font-medium text-red-600">{Math.max(0, launchVelocity * time - 0.5 * g * time * time).toFixed(1)} m</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-slate-50 rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center relative min-h-[350px]">
          <svg width="800" height="350" viewBox="0 0 800 350" className="w-full h-full">
            <defs>
              <marker id="arrow-v" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#4f46e5" />
              </marker>
            </defs>
            
            {/* Ground */}
            <line x1="0" y1={groundY + 15} x2="800" y2={groundY + 15} stroke="#cbd5e1" strokeWidth="4" />
            
            {/* Trajectory Path */}
            {time > 0 && (
              <path d={pathD} fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
            )}
            
            {/* Vertical alignment line */}
            <line 
              x1={currentCartX} y1={currentProjY} 
              x2={currentCartX} y2={groundY} 
              stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4,4" 
            />

            {/* Cart */}
            <g transform={`translate(${currentCartX}, ${groundY})`}>
              <rect x="-20" y="-10" width="40" height="15" fill="#64748b" rx="2" />
              <circle cx="-10" cy="10" r="5" fill="#1e293b" />
              <circle cx="10" cy="10" r="5" fill="#1e293b" />
              {/* Cart Velocity Vector */}
              {cartVelocity > 0 && (
                <line x1="25" y1="-2" x2="55" y2="-2" stroke="#4f46e5" strokeWidth="2" markerEnd="url(#arrow-v)" />
              )}
              {cartVelocity > 0 && (
                <text x="35" y="-15" fill="#4f46e5" fontSize="12" fontWeight="bold">v₀</text>
              )}
            </g>

            {/* Rocket */}
            <g transform={`translate(${currentProjX}, ${currentProjY})`}>
              <path d="M -5 0 L 0 -15 L 5 0 Z" fill="#ef4444" />
              <rect x="-3" y="0" width="6" height="10" fill="#f87171" />
              {/* Flame */}
              {(time > 0 && time < timeOfFlight) && (
                <path d="M -3 10 Q 0 20 3 10 Z" fill="#fbbf24" />
              )}
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
