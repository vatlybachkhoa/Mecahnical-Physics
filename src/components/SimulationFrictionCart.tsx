import React, { useState, useEffect, useRef } from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import { Play, Pause, RotateCcw, CheckSquare, Square } from 'lucide-react';

export function SimulationFrictionCart() {
  const [motionType, setMotionType] = useState<'accelerate' | 'brake'>('accelerate');
  const [driveForce, setDriveForce] = useState(5000); // N
  const [brakeForce, setBrakeForce] = useState(8000); // N
  const [truckMass, setTruckMass] = useState(1000); // kg
  const [initialVelocity, setInitialVelocity] = useState(20); // m/s
  const [mass, setMass] = useState(5); // m (kg)
  const [mu, setMu] = useState(0.4); // k (coefficient of friction)
  const [showForces, setShowForces] = useState(true);
  
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasFallen, setHasFallen] = useState(false);

  // Use refs for physics state to allow dynamic updates during animation
  const physRef = useRef({
    v_truck: 0,
    x_truck: 0,
    v_rel: 0,
    x_rel: 0,
  });

  const reqRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  const g = 9.8;
  
  // a_frame is positive when accelerating forward, negative when braking
  const a_frame_mag = motionType === 'accelerate' ? driveForce / truckMass : brakeForce / truckMass;
  const a_frame = motionType === 'accelerate' ? a_frame_mag : -a_frame_mag;
  
  const maxStaticAccel = mu * g;
  const isSlipping = Math.abs(a_frame) > maxStaticAccel;
  
  // Relative acceleration of the block
  const a_rel = isSlipping ? (Math.sign(a_frame) * mu * g - a_frame) : 0;
  
  // Forces for visualization
  const f_qt = -mass * a_frame; // Pseudo force (Lực quán tính)
  const f_ms_max = mu * mass * g; // Max static friction
  
  // Actual friction force
  let f_ms = 0;
  if (isSlipping) {
    f_ms = Math.sign(a_frame) * f_ms_max;
  } else {
    f_ms = mass * a_frame; // Balances pseudo force
  }

  // Visual parameters
  const scale = 40; // pixels per meter
  const truckWidth = 320;
  const blockWidth = 60;
  const blockHeight = 40;
  
  // Render state from refs
  const [renderState, setRenderState] = useState({
    x_rel_px: 0,
    groundOffset: 0,
  });

  useEffect(() => {
    if (!isPlaying) return;

    const animate = (now: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = now;
      const dt = ((now - lastTimeRef.current) / 1000) * 0.5; // Slow motion
      lastTimeRef.current = now;

      let { v_truck, x_truck, v_rel, x_rel } = physRef.current;

      // Integrate truck motion
      v_truck += a_frame * dt;
      x_truck += v_truck * dt;

      // Stop if braking and truck stops
      if (motionType === 'brake' && v_truck <= 0) {
        v_truck = 0;
        setIsPlaying(false);
      }

      // Integrate relative motion
      v_rel += a_rel * dt;
      x_rel += v_rel * dt;

      physRef.current = { v_truck, x_truck, v_rel, x_rel };

      const next_x_rel_px = x_rel * scale;
      const groundOffset = (x_truck * scale) % 40;

      setRenderState({
        x_rel_px: next_x_rel_px,
        groundOffset,
      });

      setTime((prevTime) => prevTime + dt);

      // Check if block falls off
      if (next_x_rel_px < -truckWidth / 2 + blockWidth / 2 + 10 || next_x_rel_px > truckWidth / 2 - blockWidth / 2 - 10) {
        setIsPlaying(false);
        setHasFallen(true);
        return;
      }

      if (isPlaying && (motionType !== 'brake' || v_truck > 0)) {
        reqRef.current = requestAnimationFrame(animate);
      }
    };

    reqRef.current = requestAnimationFrame(animate);
    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, [isPlaying, a_rel, a_frame, motionType, scale, truckWidth, blockWidth]);

  const handleReset = () => {
    setIsPlaying(false);
    setHasFallen(false);
    setTime(0);
    lastTimeRef.current = 0;
    physRef.current = {
      v_truck: motionType === 'brake' ? initialVelocity : 0,
      x_truck: 0,
      v_rel: 0,
      x_rel: 0,
    };
    setRenderState({
      x_rel_px: 0,
      groundOffset: 0,
    });
  };

  // Initialize physics state on mount or when motionType/initialVelocity changes while not playing
  useEffect(() => {
    if (!isPlaying && time === 0) {
      physRef.current.v_truck = motionType === 'brake' ? initialVelocity : 0;
    }
  }, [motionType, initialVelocity, isPlaying, time]);

  const forceScale = 2;

  return (
    <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-2xl font-semibold text-slate-800 mb-2">Interactive: Block on a Truck (Friction & Pseudo Force)</h2>
        <p className="text-slate-600">
          Simulation of an object of mass <InlineMath math="m" /> placed on a truck bed. Investigate slipping when the truck accelerates or brakes hard.
        </p>
      </div>

      <div className="p-6 flex flex-col lg:flex-row gap-8">
        {/* Controls */}
        <div className="flex-1 space-y-6">
          
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <label className="block text-sm font-medium text-slate-700 mb-3">Truck's State of Motion</label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="motionType" 
                  value="accelerate" 
                  checked={motionType === 'accelerate'} 
                  onChange={() => { setMotionType('accelerate'); handleReset(); }} 
                  className="w-4 h-4 text-indigo-600"
                />
                <span className="text-sm font-medium text-slate-700">Accelerate (<InlineMath math="a > 0" />)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="motionType" 
                  value="brake" 
                  checked={motionType === 'brake'} 
                  onChange={() => { setMotionType('brake'); handleReset(); }} 
                  className="w-4 h-4 text-indigo-600"
                />
                <span className="text-sm font-medium text-slate-700">Brake Hard (<InlineMath math="a < 0" />)</span>
              </label>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-slate-700">Truck Mass (<InlineMath math="M_{truck}" />)</label>
              <span className="text-sm font-mono text-slate-600">{truckMass} kg</span>
            </div>
            <input
              type="range"
              min="500"
              max="5000"
              step="100"
              value={truckMass}
              onChange={(e) => { setTruckMass(Number(e.target.value)); handleReset(); }}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          {motionType === 'accelerate' ? (
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-slate-700">Engine Drive Force (<InlineMath math="F_{drive}" />)</label>
                <span className="text-sm font-mono text-slate-600">{driveForce} N</span>
              </div>
              <input
                type="range"
                min="0"
                max="20000"
                step="500"
                value={driveForce}
                onChange={(e) => { setDriveForce(Number(e.target.value)); }}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
          ) : (
            <>
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700">Initial Velocity (<InlineMath math="v_0" />)</label>
                  <span className="text-sm font-mono text-slate-600">{initialVelocity} m/s</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="40"
                  step="1"
                  value={initialVelocity}
                  onChange={(e) => { setInitialVelocity(Number(e.target.value)); handleReset(); }}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700">Braking Force (<InlineMath math="F_{brake}" />)</label>
                  <span className="text-sm font-mono text-slate-600">{brakeForce} N</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30000"
                  step="500"
                  value={brakeForce}
                  onChange={(e) => { setBrakeForce(Number(e.target.value)); }}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </>
          )}

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-slate-700">Block Mass (<InlineMath math="m" />)</label>
              <span className="text-sm font-mono text-slate-600">{mass.toFixed(1)} kg</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={mass}
              onChange={(e) => { setMass(Number(e.target.value)); handleReset(); }}
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
            <span className="text-sm font-medium text-slate-700">Show Forces (in Truck's Reference Frame)</span>
          </div>

          <div className="flex gap-4 pt-2">
            <button
              onClick={() => {
                if (hasFallen) handleReset();
                setIsPlaying(!isPlaying);
              }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              {isPlaying ? 'Pause' : (hasFallen ? 'Replay' : 'Play')}
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
              <span className="text-slate-600">Current Truck Acceleration (<InlineMath math="a_{truck}" />):</span>
              <span className="font-mono font-medium text-slate-800">{a_frame_mag.toFixed(2)} m/s²</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Max Static Acceleration (<InlineMath math="\mu \cdot g" />):</span>
              <span className="font-mono font-medium text-slate-800">{maxStaticAccel.toFixed(2)} m/s²</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Block State:</span>
              <span className={`font-medium ${isSlipping ? 'text-red-600' : 'text-green-600'}`}>
                {isSlipping 
                  ? (motionType === 'accelerate' ? 'Slipping Backward' : 'Slipping Forward') 
                  : 'Stationary on Truck'}
              </span>
            </div>
            {hasFallen && (
              <div className="text-red-600 font-bold text-center mt-2 pt-2 border-t border-red-100">
                Block has fallen off the truck!
              </div>
            )}
          </div>
        </div>

        {/* Visualization */}
        <div className="flex-[1.5] flex flex-col gap-4">
          <div className="bg-sky-50 rounded-xl border border-slate-200 overflow-hidden relative" style={{ height: '350px' }}>
            <svg width="100%" height="100%" viewBox="0 0 800 350">
              {/* Ground (Moving to simulate camera following the truck) */}
              <g transform={`translate(${-renderState.groundOffset}, 0)`}>
                <line x1="0" y1="280" x2="850" y2="280" stroke="#94a3b8" strokeWidth="4" />
                {Array.from({ length: 25 }).map((_, i) => (
                  <line key={i} x1={i * 40} y1="280" x2={i * 40 - 10} y2="295" stroke="#cbd5e1" strokeWidth="2" />
                ))}
              </g>

              {/* Truck (Stationary in this view) */}
              <g transform="translate(400, 240)">
                {/* Wheels */}
                <circle cx="-100" cy="20" r="20" fill="#334155" />
                <circle cx="-100" cy="20" r="10" fill="#94a3b8" />
                <circle cx="100" cy="20" r="20" fill="#334155" />
                <circle cx="100" cy="20" r="10" fill="#94a3b8" />
                
                {/* Chassis */}
                <rect x="-160" y="-20" width={truckWidth} height="20" fill="#1e293b" rx="4" />
                
                {/* Cab */}
                <path d="M 120 -20 L 120 -80 L 160 -80 L 180 -40 L 180 -20 Z" fill="#3b82f6" />
                <rect x="130" y="-70" width="25" height="30" fill="#bae6fd" rx="2" />
                
                {/* Truck Acceleration Vector */}
                {Math.abs(a_frame) > 0 && (
                  <g transform="translate(0, -100)">
                    <line 
                      x1="0" y1="0" 
                      x2={a_frame * 5} y2="0" 
                      stroke={motionType === 'accelerate' ? "#3b82f6" : "#ef4444"} 
                      strokeWidth="3" 
                      markerEnd={motionType === 'accelerate' ? "url(#arrow-truck-accel)" : "url(#arrow-truck-brake)"} 
                    />
                    <text x={a_frame * 2.5} y="-10" textAnchor="middle" fontSize="14" fill={motionType === 'accelerate' ? "#3b82f6" : "#ef4444"} fontWeight="bold">a_truck</text>
                  </g>
                )}

                {/* Block */}
                <g transform={`translate(${renderState.x_rel_px}, -20)`}>
                  <rect x={-blockWidth/2} y={-blockHeight} width={blockWidth} height={blockHeight} fill="#f59e0b" stroke="#d97706" strokeWidth="2" rx="2" />
                  <text x="0" y={-blockHeight/2 + 5} textAnchor="middle" fontSize="14" fill="#78350f" fontWeight="bold">m</text>

                  {/* Forces on Block */}
                  {showForces && (
                    <g>
                      {/* Gravity */}
                      <line x1="0" y1={-blockHeight/2} x2="0" y2="30" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrow-force)" />
                      <text x="10" y="25" fontSize="12" fill="#10b981" fontWeight="bold">W</text>
                      
                      {/* Normal Force */}
                      <line x1="0" y1={0} x2="0" y2={-blockHeight - 30} stroke="#8b5cf6" strokeWidth="2" markerEnd="url(#arrow-force)" />
                      <text x="10" y={-blockHeight - 20} fontSize="12" fill="#8b5cf6" fontWeight="bold">N</text>

                      {/* Pseudo Force (Lực quán tính) */}
                      {Math.abs(f_qt) > 0.1 && (
                        <g>
                          <line x1="0" y1={-blockHeight/2} x2={f_qt * forceScale} y2={-blockHeight/2} stroke="#ef4444" strokeWidth="2" strokeDasharray="4 2" markerEnd="url(#arrow-force)" />
                          <text x={f_qt * forceScale / 2} y={-blockHeight/2 - 10} textAnchor="middle" fontSize="12" fill="#ef4444" fontWeight="bold">F_pseudo</text>
                        </g>
                      )}

                      {/* Friction Force */}
                      {Math.abs(f_ms) > 0.1 && (
                        <g>
                          <line x1="0" y1={0} x2={f_ms * forceScale} y2={0} stroke="#f97316" strokeWidth="3" markerEnd="url(#arrow-force)" />
                          <text x={f_ms * forceScale / 2} y="15" textAnchor="middle" fontSize="12" fill="#ea580c" fontWeight="bold">F_friction</text>
                        </g>
                      )}
                    </g>
                  )}
                </g>
              </g>

              <defs>
                <marker id="arrow-truck-accel" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
                </marker>
                <marker id="arrow-truck-brake" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
                </marker>
                <marker id="arrow-force" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke" />
                </marker>
              </defs>
            </svg>
          </div>

          {/* Explanation */}
          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-sm text-indigo-900 space-y-2">
            <p>
              <strong>Physics Explanation (In the Truck's Reference Frame):</strong>
            </p>
            <p>
              The block <InlineMath math="m" /> experiences a <strong>pseudo force (inertial force)</strong> <InlineMath math="\vec{F}_{pseudo} = -m\vec{a}" /> in the opposite direction of the truck's acceleration.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>When accelerating (<InlineMath math="a > 0" />):</strong> The pseudo force points backward. If <InlineMath math="F_{pseudo} > F_{friction(max)}" />, the block slips backward.</li>
              <li><strong>When braking hard (<InlineMath math="a < 0" />):</strong> The pseudo force points forward. If <InlineMath math="F_{pseudo} > F_{friction(max)}" />, the block slips forward (inertia makes it want to maintain its previous velocity).</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
