import React, { useState, useEffect, useRef } from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import { Play, Pause, RotateCcw } from 'lucide-react';

export function SimulationVerticalCircle() {
  const [scenario, setScenario] = useState<'string' | 'bucket'>('string');
  const [startPosition, setStartPosition] = useState<'bottom' | 'top'>('bottom');
  const [radius, setRadius] = useState(1.0); // m
  const [v0, setV0] = useState(7.0); // m/s (initial velocity at bottom)
  const [mass, setMass] = useState(1.0); // kg
  const [T_max, setT_max] = useState(100); // N (maximum tension/force)
  
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Render state
  const [time, setTime] = useState(0);
  const [theta, setTheta] = useState(0); // 0 is bottom, pi is top
  const [omega, setOmega] = useState(0);
  const [motionState, setMotionState] = useState<'circle' | 'slack' | 'broken'>('circle');
  const [x, setX] = useState(0);
  const [y, setY] = useState(1.0); // y is down, so bottom is R
  const [T, setT] = useState(0);
  const [KE, setKE] = useState(0);
  const [PE, setPE] = useState(0);
  const [spilledWater, setSpilledWater] = useState<{x: number, y: number, vx: number, vy: number}[]>([]);

  const reqRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  // Physics state ref for integration
  const physRef = useRef({
    theta: 0,
    omega: 0,
    motionState: 'circle' as 'circle' | 'slack' | 'broken',
    x: 0,
    y: 1.0,
    vx: 0,
    vy: 0,
    spilledWater: [] as {x: number, y: number, vx: number, vy: number}[],
  });

  const g = 9.8;

  // Calculate theoretical limits
  const v_min_bottom_circle = Math.sqrt(5 * g * radius);
  const v_min_top_circle = Math.sqrt(g * radius);
  
  let statusText = "";
  let v_other_text = "";

  if (startPosition === 'bottom') {
    const v_min_top = Math.sqrt(2 * g * radius); // velocity to reach top (but string goes slack before)
    const T_bottom = mass * (v0 * v0 / radius) + mass * g;
    
    if (T_bottom > T_max) {
      statusText = scenario === 'string' ? "String breaks at bottom" : "Bucket breaks at bottom";
    } else if (v0 >= v_min_bottom_circle) {
      statusText = "Completes full circle";
    } else if (v0 >= v_min_top) {
      statusText = scenario === 'string' ? "String goes slack (Free fall)" : "Water spills (Free fall)";
    } else {
      statusText = "Oscillates like a pendulum";
    }
    
    const v_top_sq = v0 * v0 - 4 * g * radius;
    if (v_top_sq >= 0) {
      v_other_text = `${Math.sqrt(v_top_sq).toFixed(2)} m/s`;
    } else {
      v_other_text = "Does not reach top";
    }
  } else {
    const T_top = mass * (v0 * v0 / radius) - mass * g;
    const v_bottom_sq = v0 * v0 + 4 * g * radius;
    const T_bottom = mass * (v_bottom_sq / radius) + mass * g;

    if (T_top > T_max) {
      statusText = scenario === 'string' ? "String breaks at top" : "Bucket breaks at top";
    } else if (v0 < v_min_top_circle) {
      statusText = scenario === 'string' ? "String goes slack immediately" : "Water spills immediately";
    } else if (T_bottom > T_max) {
      statusText = scenario === 'string' ? "String breaks at bottom" : "Bucket breaks at bottom";
    } else {
      statusText = "Completes full circle";
    }
    const v_bottom = Math.sqrt(v_bottom_sq);
    v_other_text = `${v_bottom.toFixed(2)} m/s`;
  }

  const handleReset = () => {
    setIsPlaying(false);
    setTime(0);
    
    // If starting at top with v0=0, add a tiny nudge so it falls
    const initialTheta = startPosition === 'bottom' ? 0 : (Math.PI + 0.0001);
    const initialOmega = v0 / radius;
    const initialX = radius * Math.sin(initialTheta);
    const initialY = radius * Math.cos(initialTheta);
    
    const initialVx = (initialOmega * radius) * Math.cos(initialTheta);
    const initialVy = -(initialOmega * radius) * Math.sin(initialTheta);
    
    physRef.current = {
      theta: initialTheta,
      omega: initialOmega,
      motionState: 'circle',
      x: initialX,
      y: initialY,
      vx: initialVx,
      vy: initialVy,
      spilledWater: [],
    };
    
    setTheta(initialTheta);
    setOmega(initialOmega);
    setMotionState('circle');
    setX(initialX);
    setY(initialY);
    setT(mass * (v0 * v0 / radius) + mass * g * Math.cos(initialTheta));
    setKE(0.5 * mass * v0 * v0);
    setPE(mass * g * (radius - initialY));
    setSpilledWater([]);
    lastTimeRef.current = 0;
  };

  // Reset when parameters change
  useEffect(() => {
    handleReset();
  }, [scenario, radius, v0, mass, startPosition, T_max]);

  useEffect(() => {
    if (!isPlaying) return;

    const animate = (now: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = now;
      const dt = Math.min(((now - lastTimeRef.current) / 1000) * 0.5, 0.02); // Slow motion, cap dt
      lastTimeRef.current = now;

      let { theta, omega, motionState, x, y, vx, vy, spilledWater } = physRef.current;

      if (motionState === 'circle') {
        // Euler-Cromer integration
        const alpha = -(g / radius) * Math.sin(theta);
        omega += alpha * dt;
        theta += omega * dt;

        const v = omega * radius;
        // Tension/Normal force: T - mg*cos(theta) = m*v^2/R => T = m*v^2/R + mg*cos(theta)
        // Wait, at bottom (theta=0), gravity is down, T is up. Net force to center = T - mg = m*v^2/R => T = m*v^2/R + mg
        // At top (theta=pi), gravity is down, T is down. Net force to center = T + mg = m*v^2/R => T = m*v^2/R - mg
        // So T = m*v^2/R + mg*cos(theta) is correct.
        const currentT = mass * (v * v / radius) + mass * g * Math.cos(theta);

        // Check if string breaks (T > T_max)
        if (currentT > T_max) {
          motionState = 'broken';
          x = radius * Math.sin(theta);
          y = radius * Math.cos(theta);
          vx = v * Math.cos(theta);
          vy = -v * Math.sin(theta);

          if (scenario === 'bucket') {
            // Generate water particles when bucket breaks
            for(let i=0; i<20; i++) {
              spilledWater.push({
                x: x + (Math.random()-0.5)*0.3,
                y: y + (Math.random()-0.5)*0.3,
                vx: vx + (Math.random()-0.5)*3,
                vy: vy + (Math.random()-0.5)*3
              });
            }
          }
        } else if (currentT < 0) {
          // Check if string goes slack or water spills (T < 0)
          motionState = 'slack';
          // Convert to Cartesian for projectile motion
          x = radius * Math.sin(theta);
          y = radius * Math.cos(theta);
          vx = v * Math.cos(theta);
          vy = -v * Math.sin(theta);

          if (scenario === 'bucket') {
            // Generate water particles
            for(let i=0; i<20; i++) {
              spilledWater.push({
                x: x + (Math.random()-0.5)*0.3,
                y: y + (Math.random()-0.5)*0.3,
                vx: vx + (Math.random()-0.5)*3,
                vy: vy + (Math.random()-0.5)*3
              });
            }
          }
        } else {
          x = radius * Math.sin(theta);
          y = radius * Math.cos(theta);
        }
      } else if (motionState === 'slack' || motionState === 'broken') {
        // Projectile motion
        vy += g * dt;
        x += vx * dt;
        y += vy * dt;

        // Update spilled water
        spilledWater.forEach(p => {
          p.vy += g * dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
        });
      }

      // Update ref
      physRef.current = { theta, omega, motionState, x, y, vx, vy, spilledWater };

      // Calculate energies for display
      const currentPE = mass * g * (radius - y);
      const currentKE = motionState === 'circle' 
        ? 0.5 * mass * (omega * radius) * (omega * radius)
        : 0.5 * mass * (vx * vx + vy * vy);
      const currentT = motionState === 'circle' 
        ? mass * (omega * radius * omega * radius / radius) + mass * g * Math.cos(theta)
        : 0;

      // Update React state
      setTime(prev => prev + dt);
      setTheta(theta);
      setOmega(omega);
      setMotionState(motionState);
      setX(x);
      setY(y);
      setT(currentT);
      setKE(currentKE);
      setPE(currentPE);
      setSpilledWater([...spilledWater]);

      reqRef.current = requestAnimationFrame(animate);
    };

    reqRef.current = requestAnimationFrame(animate);
    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, [isPlaying, radius, mass, scenario, T_max]);

  // Visual parameters
  const scale = 80; // px/m
  const cx = 300;
  const cy = 200;

  const initialY_exact = startPosition === 'bottom' ? radius : -radius;
  const totalE = 0.5 * mass * v0 * v0 + mass * g * (radius - initialY_exact);
  const safeTotalE = totalE > 0 ? totalE : 1;

  return (
    <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8 mt-8">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-2xl font-semibold text-slate-800 mb-2">Interactive: Vertical Circular Motion</h2>
        <p className="text-slate-600">
          Simulate energy conservation: An object tied to a string or a bucket of water rotating in a vertical circle. Explore the conditions required to complete a full circle or prevent water from spilling.
        </p>
      </div>

      <div className="p-6 flex flex-col lg:flex-row gap-8">
        {/* Controls */}
        <div className="flex-1 space-y-6">
          
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <label className="block text-sm font-medium text-slate-700 mb-3">Simulation Scenario</label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="scenario" 
                  value="string" 
                  checked={scenario === 'string'} 
                  onChange={() => setScenario('string')} 
                  className="w-4 h-4 text-indigo-600"
                />
                <span className="text-sm font-medium text-slate-700">Object on a String</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="scenario" 
                  value="bucket" 
                  checked={scenario === 'bucket'} 
                  onChange={() => setScenario('bucket')} 
                  className="w-4 h-4 text-indigo-600"
                />
                <span className="text-sm font-medium text-slate-700">Bucket of Water</span>
              </label>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <label className="block text-sm font-medium text-slate-700 mb-3">Starting Position</label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="startPosition" 
                  value="bottom" 
                  checked={startPosition === 'bottom'} 
                  onChange={() => setStartPosition('bottom')} 
                  className="w-4 h-4 text-indigo-600"
                />
                <span className="text-sm font-medium text-slate-700">Bottom</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="startPosition" 
                  value="top" 
                  checked={startPosition === 'top'} 
                  onChange={() => setStartPosition('top')} 
                  className="w-4 h-4 text-indigo-600"
                />
                <span className="text-sm font-medium text-slate-700">Top</span>
              </label>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-slate-700">Initial Velocity at {startPosition === 'bottom' ? 'Bottom' : 'Top'} (<InlineMath math="v_0" />)</label>
              <span className="text-sm font-mono text-slate-600">{v0.toFixed(1)} m/s</span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              step="0.1"
              value={v0}
              onChange={(e) => setV0(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-slate-700">Radius (<InlineMath math="R" />)</label>
              <span className="text-sm font-mono text-slate-600">{radius.toFixed(1)} m</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-slate-700">Mass (<InlineMath math="m" />)</label>
              <span className="text-sm font-mono text-slate-600">{mass.toFixed(1)} kg</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="5.0"
              step="0.1"
              value={mass}
              onChange={(e) => setMass(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-slate-700">Max Force Capacity of {scenario === 'string' ? 'String' : 'Bucket'} (<InlineMath math="T_{max}" />)</label>
              <span className="text-sm font-mono text-slate-600">{T_max.toFixed(1)} N</span>
            </div>
            <input
              type="range"
              min="10"
              max="200"
              step="1"
              value={T_max}
              onChange={(e) => setT_max(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          <div className="flex gap-4 pt-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
            >
              <RotateCcw className="w-5 h-5" />
              Reset
            </button>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-600">Velocity at {startPosition === 'bottom' ? 'Top' : 'Bottom'} (Theoretical):</span>
              <span className="font-mono font-medium text-slate-800">{v_other_text}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Min Velocity to {startPosition === 'bottom' ? 'Complete Circle' : 'Prevent Spilling'} ({startPosition === 'bottom' ? <InlineMath math="\sqrt{5gR}" /> : <InlineMath math="\sqrt{gR}" />}):</span>
              <span className="font-mono font-medium text-slate-800">{startPosition === 'bottom' ? v_min_bottom_circle.toFixed(2) : v_min_top_circle.toFixed(2)} m/s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Predicted State:</span>
              <span className={`font-medium ${statusText.includes('Complete') ? 'text-green-600' : (statusText.includes('Oscillate') ? 'text-amber-600' : 'text-red-600')}`}>
                {statusText}
              </span>
            </div>
          </div>
        </div>

        {/* Visualization & Data */}
        <div className="flex-[1.5] flex flex-col gap-4">
          <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden relative" style={{ height: '400px' }}>
            <svg width="100%" height="100%" viewBox="0 0 600 400">
              {/* Pivot */}
              <circle cx={cx} cy={cy} r="4" fill="#334155" />
              
              {/* Circular Path */}
              <circle cx={cx} cy={cy} r={radius * scale} fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="5 5" />

              {/* String (only if in circle motion) */}
              {motionState === 'circle' && (
                <line 
                  x1={cx} y1={cy} 
                  x2={cx + x * scale} y2={cy + y * scale} 
                  stroke="#64748b" strokeWidth="2" 
                />
              )}
              {/* Slack string */}
              {motionState === 'slack' && (
                <path 
                  d={`M ${cx} ${cy} Q ${cx + x*scale/2} ${cy + y*scale/2 + 20} ${cx + x * scale} ${cy + y * scale}`} 
                  fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" 
                />
              )}

              {/* Object */}
              {motionState !== 'broken' || scenario === 'string' ? (
                <g transform={`translate(${cx + x * scale}, ${cy + y * scale})`}>
                  {scenario === 'string' ? (
                    <circle cx="0" cy="0" r="12" fill="#f59e0b" stroke="#d97706" strokeWidth="2" />
                  ) : (
                    <g transform={`rotate(${motionState === 'circle' ? -theta * 180 / Math.PI : 0})`}>
                      {/* Bucket shape */}
                      <path d="M -15 -15 L 15 -15 L 10 15 L -10 15 Z" fill="#94a3b8" stroke="#475569" strokeWidth="2" />
                      {/* Water inside (only if not spilled) */}
                      {motionState === 'circle' && (
                        <path d="M -13 -5 L 13 -5 L 9 13 L -9 13 Z" fill="#3b82f6" opacity="0.8" />
                      )}
                    </g>
                  )}
                </g>
              ) : null}

              {/* Spilled Water Particles */}
              {spilledWater.map((p, i) => (
                <circle 
                  key={i} 
                  cx={cx + p.x * scale} 
                  cy={cy + p.y * scale} 
                  r="3" 
                  fill="#3b82f6" 
                  opacity="0.8" 
                />
              ))}
            </svg>
          </div>

          {/* Energy Bars & Data */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-500 mb-1">
                  <span>Kinetic Energy (KE)</span>
                  <span className="font-mono">{KE.toFixed(1)} J</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 transition-all duration-75" style={{ width: `${Math.min(100, (KE / safeTotalE) * 100)}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-500 mb-1">
                  <span>Potential Energy (PE)</span>
                  <span className="font-mono">{PE.toFixed(1)} J</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 transition-all duration-75" style={{ width: `${Math.min(100, (PE / safeTotalE) * 100)}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-500 mb-1">
                  <span>Total Energy (E)</span>
                  <span className="font-mono">{(KE + PE).toFixed(1)} J</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 transition-all duration-75" style={{ width: '100%' }} />
                </div>
              </div>
            </div>
            
            <div className="flex flex-col justify-center space-y-2">
              <div className="flex justify-between items-center p-2 bg-slate-50 rounded border border-slate-100">
                <span className="text-sm text-slate-600">{scenario === 'string' ? 'Tension (T)' : 'Normal Force (N)'}</span>
                <span className={`font-mono font-medium ${T < 0 || T > T_max ? 'text-red-500' : 'text-slate-800'}`}>
                  {motionState === 'circle' ? T.toFixed(1) : '0.0'} N
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-2">
                * When {scenario === 'string' ? 'T < 0, the string goes slack' : 'N < 0, water spills out'} and the object moves like a projectile.
                <br/>
                * When {scenario === 'string' ? 'T > T_{max}, the string breaks' : 'N > T_{max}, the bucket breaks'} due to excessive force.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
