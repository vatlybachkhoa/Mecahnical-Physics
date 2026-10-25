import React, { useState, useEffect, useRef } from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import { Play, Pause, RotateCcw, CheckSquare, Square } from 'lucide-react';

export function SimulationRotatingDisk() {
  const [alpha, setAlpha] = useState(0.5); // rad/s^2 (Angular acceleration)
  const [mu, setMu] = useState(0.4); // Coefficient of friction
  const [radius, setRadius] = useState(1.5); // m (Distance from center)
  const [showForces, setShowForces] = useState(true);
  
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasSlipped, setHasSlipped] = useState(false);

  const reqRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const g = 9.8;
  
  // Calculate time when slipping starts
  // Slipping condition: F_qt_total > F_ms_max
  // F_qt_total = m * sqrt(a_n^2 + a_t^2) = m * r * sqrt(omega^4 + alpha^2)
  // omega = alpha * t
  // m * r * sqrt((alpha * t)^4 + alpha^2) > mu * m * g
  // (alpha * t)^4 + alpha^2 > (mu * g / r)^2
  const limitSq = Math.pow(mu * g / radius, 2);
  let t_slip = 0;
  if (limitSq > alpha * alpha) {
    t_slip = Math.pow((limitSq - alpha * alpha) / Math.pow(alpha, 4), 0.25);
  } else {
    t_slip = 0; // Slips immediately
  }

  useEffect(() => {
    if (!isPlaying) return;

    const animate = (now: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = now;
      const dt = ((now - lastTimeRef.current) / 1000) * 0.5; // Slow down for better observation
      lastTimeRef.current = now;

      setTime((prevTime) => {
        const nextTime = prevTime + dt;
        if (nextTime >= t_slip && !hasSlipped) {
          setHasSlipped(true);
        }
        // Stop simulation after flying off for a while
        if (nextTime > t_slip + 1.5) {
          setIsPlaying(false);
          return prevTime;
        }
        return nextTime;
      });

      reqRef.current = requestAnimationFrame(animate);
    };

    reqRef.current = requestAnimationFrame(animate);
    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, [isPlaying, t_slip, hasSlipped]);

  const handleReset = () => {
    setIsPlaying(false);
    setHasSlipped(false);
    setTime(0);
    lastTimeRef.current = 0;
  };

  // Drawing parameters
  const scale = 60; // px/m
  const cx = 300;
  const cy = 200;

  // Calculate positions
  let blockX = 0;
  let blockY = 0;
  let diskTheta = 0;
  let omega = 0;

  if (time <= t_slip) {
    // Before slipping: Object rotates with disk
    diskTheta = 0.5 * alpha * time * time;
    omega = alpha * time;
    blockX = radius * scale * Math.cos(diskTheta);
    blockY = radius * scale * Math.sin(diskTheta);
  } else {
    // After slipping: Disk continues rotating, object flies off tangentially
    diskTheta = 0.5 * alpha * time * time;
    const theta_slip = 0.5 * alpha * t_slip * t_slip;
    const omega_slip = alpha * t_slip;
    
    // Position at the moment of slipping
    const x_slip = radius * scale * Math.cos(theta_slip);
    const y_slip = radius * scale * Math.sin(theta_slip);
    
    // Tangential velocity at slipping (px/s)
    const vx = -radius * scale * omega_slip * Math.sin(theta_slip);
    const vy = radius * scale * omega_slip * Math.cos(theta_slip);
    
    const dt_after = time - t_slip;
    blockX = x_slip + vx * dt_after;
    blockY = y_slip + vy * dt_after;
    omega = omega_slip;
  }

  // Acceleration in the rotating reference frame (only calculated before slipping)
  const a_n = omega * omega * radius; // Centripetal acceleration (causes centrifugal pseudo force)
  const a_t = alpha * radius; // Tangential acceleration (causes Euler pseudo force)
  const isSlippingNow = time >= t_slip;

  return (
    <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-2xl font-semibold text-slate-800 mb-2">Interactive: Object on a Rotating Disk (Centrifugal Force)</h2>
        <p className="text-slate-600">
          Simulation of an object placed on an accelerating rotating disk. When the angular velocity is high enough, the centrifugal force overcomes friction, causing the object to fly off.
        </p>
      </div>

      <div className="p-6 flex flex-col lg:flex-row gap-8">
        {/* Controls */}
        <div className="flex-1 space-y-6">
          
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-slate-700">Angular Acceleration (<InlineMath math="\alpha" />)</label>
              <span className="text-sm font-mono text-slate-600">{alpha.toFixed(2)} rad/s²</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="2.0"
              step="0.1"
              value={alpha}
              onChange={(e) => { setAlpha(Number(e.target.value)); handleReset(); }}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-slate-700">Distance from Center (<InlineMath math="r" />)</label>
              <span className="text-sm font-mono text-slate-600">{radius.toFixed(2)} m</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={radius}
              onChange={(e) => { setRadius(Number(e.target.value)); handleReset(); }}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-slate-700">Friction Coefficient (<InlineMath math="\mu" />)</label>
              <span className="text-sm font-mono text-slate-600">{mu.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={mu}
              onChange={(e) => { setMu(Number(e.target.value)); handleReset(); }}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setShowForces(!showForces)}>
            {showForces ? <CheckSquare className="w-5 h-5 text-indigo-600" /> : <Square className="w-5 h-5 text-slate-400" />}
            <span className="text-sm font-medium text-slate-700">Show Forces (in Rotating Frame)</span>
          </div>

          <div className="flex gap-4 pt-2">
            <button
              onClick={() => {
                if (hasSlipped) handleReset();
                setIsPlaying(!isPlaying);
              }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              {isPlaying ? 'Pause' : (hasSlipped ? 'Replay' : 'Play')}
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
              <span className="text-slate-600">Theoretical Slip Time:</span>
              <span className="font-mono font-medium text-slate-800">{t_slip > 0 ? `${t_slip.toFixed(2)} s` : 'Slips immediately!'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Current Angular Velocity (<InlineMath math="\omega" />):</span>
              <span className="font-mono font-medium text-slate-800">{omega.toFixed(2)} rad/s</span>
            </div>
            {hasSlipped && (
              <div className="text-red-600 font-bold text-center mt-2 pt-2 border-t border-red-100">
                Object has flown off the disk!
              </div>
            )}
          </div>
        </div>

        {/* Visualization */}
        <div className="flex-[1.5] flex flex-col gap-4">
          <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden relative" style={{ height: '400px' }}>
            <svg width="100%" height="100%" viewBox="0 0 600 400">
              {/* Disk */}
              <g transform={`translate(${cx}, ${cy}) rotate(${diskTheta * 180 / Math.PI})`}>
                <circle cx="0" cy="0" r={2.5 * scale} fill="#cbd5e1" stroke="#94a3b8" strokeWidth="4" />
                <circle cx="0" cy="0" r="5" fill="#334155" />
                {/* Radial lines to show rotation */}
                <line x1="0" y1="0" x2={2.5 * scale} y2="0" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5 5" />
                <line x1="0" y1="0" x2={-2.5 * scale} y2="0" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5 5" />
                <line x1="0" y1="0" x2="0" y2={2.5 * scale} stroke="#94a3b8" strokeWidth="2" strokeDasharray="5 5" />
                <line x1="0" y1="0" x2="0" y2={-2.5 * scale} stroke="#94a3b8" strokeWidth="2" strokeDasharray="5 5" />
              </g>

              {/* Block */}
              <g transform={`translate(${cx + blockX}, ${cy + blockY})`}>
                <rect x="-10" y="-10" width="20" height="20" fill="#f59e0b" stroke="#d97706" strokeWidth="2" />
                
                {/* Forces (only show before slipping) */}
                {showForces && !isSlippingNow && (
                  <g transform={`rotate(${diskTheta * 180 / Math.PI})`}>
                    {/* Centrifugal Force (Outward, +x) */}
                    <line x1="0" y1="0" x2={a_n * 10} y2="0" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 2" markerEnd="url(#arrow-force)" />
                    <text x={a_n * 10 + 10} y="5" fontSize="12" fill="#ef4444" fontWeight="bold">F_centrifugal</text>
                    
                    {/* Euler Force (Tangential, -y) */}
                    <line x1="0" y1="0" x2="0" y2={-a_t * 10} stroke="#ec4899" strokeWidth="2" strokeDasharray="4 2" markerEnd="url(#arrow-force)" />
                    <text x="5" y={-a_t * 10 - 5} fontSize="12" fill="#ec4899" fontWeight="bold">F_euler</text>

                    {/* Friction (Opposes total pseudo force) */}
                    <line x1="0" y1="0" x2={-a_n * 10} y2={a_t * 10} stroke="#f97316" strokeWidth="3" markerEnd="url(#arrow-force)" />
                    <text x={-a_n * 10 - 25} y={a_t * 10 + 15} fontSize="12" fill="#ea580c" fontWeight="bold">F_friction</text>
                  </g>
                )}
              </g>

              <defs>
                <marker id="arrow-force" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke" />
                </marker>
              </defs>
            </svg>
          </div>

          {/* Explanation */}
          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-sm text-indigo-900 space-y-2">
            <p>
              <strong>Physics Explanation (In the Rotating Frame):</strong>
            </p>
            <p>
              The object experiences two pseudo forces:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Centrifugal Force (<InlineMath math="F_{centrifugal}" />):</strong> Directed outward from the center, magnitude <InlineMath math="F_{centrifugal} = m \omega^2 r" />. This force increases as the disk spins faster.</li>
              <li><strong>Euler Force (Tangential):</strong> Opposite to the direction of rotation, magnitude <InlineMath math="F_{euler} = m \alpha r" />. This force is constant if angular acceleration is constant.</li>
            </ul>
            <p>
              Static friction (<InlineMath math="F_{friction}" />) must balance the resultant of these two pseudo forces. When the total pseudo force exceeds the maximum static friction (<InlineMath math="\mu m g" />), the object slips and flies off the disk tangentially (in the stationary frame).
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
