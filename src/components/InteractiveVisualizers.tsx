import React, { useState, useEffect, useRef } from 'react';
import { InlineMath, BlockMath } from 'react-katex';

// 1. F = ma Visualizer
export function VisualizerFMA() {
  const [force, setForce] = useState(10);
  const [mass, setMass] = useState(2);
  const acceleration = force / mass;
  
  // animation state
  const [pos, setPos] = useState(0);
  const [vel, setVel] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const lastTimeRef = useRef(0);
  const reqRef = useRef(0);

  useEffect(() => {
    if (isPlaying) {
      const animate = (time: number) => {
        if (!lastTimeRef.current) lastTimeRef.current = time;
        const dt = (time - lastTimeRef.current) / 1000;
        lastTimeRef.current = time;
        
        setVel(v => v + acceleration * dt);
        setPos(p => {
          const newP = p + vel * dt * 50 + 0.5 * acceleration * dt * dt * 50;
          if (newP > 250) {
            setIsPlaying(false);
            return 250;
          }
          return newP;
        });
        reqRef.current = requestAnimationFrame(animate);
      };
      reqRef.current = requestAnimationFrame(animate);
    } else {
      lastTimeRef.current = 0;
    }
    return () => cancelAnimationFrame(reqRef.current);
  }, [isPlaying, acceleration, vel]);

  const reset = () => {
    setIsPlaying(false);
    setPos(0);
    setVel(0);
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm my-6">
      <h4 className="text-lg font-semibold text-slate-800 mb-4">Interactive: Newton's Second Law (<InlineMath math="F = ma" />)</h4>
      
      <div className="mb-6 p-4 bg-indigo-50 rounded-lg border border-indigo-100 text-sm text-slate-700">
        <p className="mb-2">
          <strong>Newton's Second Law</strong> states that the net force acting on an object is equal to its mass times its acceleration. Force and acceleration are <strong>vector quantities</strong>, meaning they have both magnitude and direction.
        </p>
        <BlockMath math="\sum \vec{F} = m\vec{a}" />
        <p className="mt-2 mb-2">
          In two dimensions, this vector equation breaks down into independent components:
        </p>
        <div className="flex justify-center gap-8">
          <InlineMath math="\sum F_x = ma_x" />
          <InlineMath math="\sum F_y = ma_y" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <p className="text-sm text-slate-600 mb-4">Adjust Force and Mass to see how they affect Acceleration. A larger force produces more acceleration, while a larger mass resists acceleration (inertia).</p>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Force (F): {force} N</label>
            <input type="range" min="1" max="20" value={force} onChange={e => {setForce(Number(e.target.value)); reset();}} className="w-full accent-indigo-600" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Mass (m): {mass} kg</label>
            <input type="range" min="1" max="10" value={mass} onChange={e => {setMass(Number(e.target.value)); reset();}} className="w-full accent-indigo-600" />
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <BlockMath math={`a = \\frac{F}{m} = \\frac{${force}}{${mass}} = ${acceleration.toFixed(2)} \\text{ m/s}^2`} />
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={() => setIsPlaying(!isPlaying)} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors">{isPlaying ? 'Pause' : 'Play'}</button>
            <button onClick={reset} className="px-4 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition-colors">Reset</button>
          </div>
        </div>
        <div className="relative h-48 bg-slate-50 rounded-lg overflow-hidden border border-slate-200 flex items-center">
          <div className="absolute bottom-0 w-full h-12 bg-slate-200 border-t border-slate-300"></div>
          <div 
            className="absolute bottom-12 flex items-center justify-center bg-blue-500 text-white font-bold rounded shadow-md transition-all duration-75"
            style={{ left: `${pos + 20}px`, width: `${mass * 5 + 30}px`, height: `${mass * 5 + 30}px` }}
          >
            {mass}kg
          </div>
          {/* Force Vector */}
          <div className="absolute h-1 bg-red-500 transition-all duration-75" style={{ bottom: `calc(3rem + ${(mass * 5 + 30)/2}px)`, left: `${pos + 20 + mass * 5 + 30}px`, width: `${force * 4}px` }}>
            <div className="absolute right-0 -top-1.5 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-8 border-l-red-500"></div>
          </div>
          <div className="absolute text-red-600 text-xs font-bold transition-all duration-75" style={{ bottom: `calc(3rem + ${(mass * 5 + 30)/2}px + 8px)`, left: `${pos + 20 + mass * 5 + 30 + force * 2}px` }}>F</div>
        </div>
      </div>
    </div>
  );
}

// 2. Conservation of Energy Visualizer
export function VisualizerEnergy() {
  const [height, setHeight] = useState(10);
  const mass = 1;
  const g = 9.81;
  const totalE = mass * g * 10; // max height 10
  
  const pe = mass * g * height;
  const ke = totalE - pe;
  const velocity = Math.sqrt(2 * ke / mass);

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm my-6">
      <h4 className="text-lg font-semibold text-slate-800 mb-4">Interactive: Conservation of Mechanical Energy</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <p className="text-sm text-slate-600 mb-4">Move the ball up and down to see how Potential Energy (PE) converts to Kinetic Energy (KE), keeping Total Energy (E) constant in a frictionless environment.</p>
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-1">Height (h): {height.toFixed(1)} m</label>
            <input type="range" min="0" max="10" step="0.1" value={height} onChange={e => setHeight(Number(e.target.value))} className="w-full accent-indigo-600" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center">
              <span className="w-12 text-sm font-medium text-blue-600">PE:</span>
              <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 transition-all duration-100" style={{ width: `${(pe / totalE) * 100}%` }}></div>
              </div>
              <span className="w-16 text-right text-sm">{pe.toFixed(0)} J</span>
            </div>
            <div className="flex items-center">
              <span className="w-12 text-sm font-medium text-red-600">KE:</span>
              <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 transition-all duration-100" style={{ width: `${(ke / totalE) * 100}%` }}></div>
              </div>
              <span className="w-16 text-right text-sm">{ke.toFixed(0)} J</span>
            </div>
            <div className="flex items-center pt-2 border-t border-slate-200">
              <span className="w-12 text-sm font-bold text-slate-800">Total:</span>
              <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-800" style={{ width: `100%` }}></div>
              </div>
              <span className="w-16 text-right text-sm font-bold">{totalE.toFixed(0)} J</span>
            </div>
          </div>
        </div>
        <div className="relative h-64 bg-slate-50 rounded-lg border border-slate-200 flex justify-center">
          {/* Ground */}
          <div className="absolute bottom-0 w-full h-8 bg-emerald-500 border-t border-emerald-600"></div>
          {/* Height scale */}
          <div className="absolute left-8 top-4 bottom-8 w-px bg-slate-300"></div>
          <span className="absolute left-10 top-4 text-xs text-slate-500">10m</span>
          <span className="absolute left-10 bottom-8 text-xs text-slate-500">0m</span>
          
          {/* Ball */}
          <div 
            className="absolute w-8 h-8 bg-indigo-600 rounded-full shadow-lg transition-all duration-75"
            style={{ bottom: `calc(32px + ${(height / 10) * (256 - 64)}px)`, left: '50%', transform: 'translateX(-50%)' }}
          ></div>
          
          {/* Velocity vector */}
          {velocity > 0 && (
            <div 
              className="absolute w-1 bg-red-500 transition-all duration-75"
              style={{ 
                bottom: `calc(32px + ${(height / 10) * (256 - 64)}px - ${velocity * 4}px)`, 
                height: `${velocity * 4}px`,
                left: '50%', 
                transform: 'translateX(-50%)' 
              }}
            >
              <div className="absolute -bottom-2 -left-1.5 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-8 border-t-red-500"></div>
            </div>
          )}
          {velocity > 0 && (
            <div className="absolute text-red-600 text-xs font-bold transition-all duration-75" style={{ bottom: `calc(32px + ${(height / 10) * (256 - 64)}px - ${velocity * 4}px - 16px)`, left: '50%', transform: 'translateX(-50%)' }}>v</div>
          )}
        </div>
      </div>
    </div>
  );
}

// 3. Conservation of Momentum Visualizer
export function VisualizerMomentum() {
  const [m1, setM1] = useState(1);
  const [v1, setV1] = useState(2);
  const [m2, setM2] = useState(1);
  const [v2, setV2] = useState(-1);
  const [isElastic, setIsElastic] = useState(true);
  
  // Physics state in a ref to avoid React state update jitters
  const physicsRef = useRef({
    pos1: 50,
    pos2: 250,
    v1: 2,
    v2: -1,
    hasCollided: false
  });

  // Display state for React rendering
  const [displayState, setDisplayState] = useState({ pos1: 50, pos2: 250, v1: 2, v2: -1 });
  const [isPlaying, setIsPlaying] = useState(false);
  
  const reqRef = useRef(0);
  const lastTimeRef = useRef(0);

  const reset = () => {
    setIsPlaying(false);
    physicsRef.current = {
      pos1: 50,
      pos2: 250,
      v1: v1,
      v2: v2,
      hasCollided: false
    };
    setDisplayState({ pos1: 50, pos2: 250, v1: v1, v2: v2 });
    lastTimeRef.current = 0;
  };

  useEffect(() => {
    reset();
  }, [m1, v1, m2, v2, isElastic]);

  useEffect(() => {
    if (isPlaying) {
      const animate = (time: number) => {
        if (!lastTimeRef.current) lastTimeRef.current = time;
        const dt = Math.min((time - lastTimeRef.current) / 1000, 0.03); // Cap dt for stability
        lastTimeRef.current = time;
        
        const state = physicsRef.current;
        const r1 = 15 + m1 * 2;
        const r2 = 15 + m2 * 2;
        const minDist = r1 + r2;
        const scale = 30; // pixels per m/s

        // Predictive position update
        let nextP1 = state.pos1 + state.v1 * dt * scale;
        let nextP2 = state.pos2 + state.v2 * dt * scale;
        
        // Collision detection
        // We check relative velocity to ensure they are moving towards each other
        const relativeVel = state.v1 - state.v2;
        if (!state.hasCollided && (nextP2 - nextP1 <= minDist) && relativeVel > 0) {
          state.hasCollided = true;
          
          if (isElastic) {
            const v1_new = ((m1 - m2) * state.v1 + 2 * m2 * state.v2) / (m1 + m2);
            const v2_new = ((m2 - m1) * state.v2 + 2 * m1 * state.v1) / (m1 + m2);
            state.v1 = v1_new;
            state.v2 = v2_new;
          } else {
            const vFinal = (m1 * state.v1 + m2 * state.v2) / (m1 + m2);
            state.v1 = vFinal;
            state.v2 = vFinal;
          }

          // Adjust positions to exactly touching at the point of impact
          // This prevents them from "bouncing" before they visibly touch
          const overlap = minDist - (nextP2 - nextP1);
          nextP1 -= overlap / 2;
          nextP2 += overlap / 2;
        }
        
        state.pos1 = nextP1;
        state.pos2 = nextP2;

        setDisplayState({ pos1: state.pos1, pos2: state.pos2, v1: state.v1, v2: state.v2 });

        if (state.pos1 < -50 || state.pos2 > 400 || state.pos1 > 400 || state.pos2 < -50) {
          setIsPlaying(false);
          return;
        }
        
        reqRef.current = requestAnimationFrame(animate);
      };
      reqRef.current = requestAnimationFrame(animate);
    } else {
      lastTimeRef.current = 0;
    }
    return () => cancelAnimationFrame(reqRef.current);
  }, [isPlaying, isElastic, m1, m2]);

  const pInitial = m1 * v1 + m2 * v2;
  const pCurrent = m1 * displayState.v1 + m2 * displayState.v2;

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm my-6">
      <h4 className="text-lg font-semibold text-slate-800 mb-4">Interactive: Conservation of Momentum</h4>
      <p className="text-sm text-slate-600 mb-4">Observe how the total momentum of the system remains constant before and after the collision, regardless of whether it is elastic (bouncy) or inelastic (sticky).</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-3 bg-blue-50 rounded border border-blue-100">
              <h5 className="font-medium text-blue-800 mb-2">Object 1 (Blue)</h5>
              <label className="block text-xs mb-1">Mass: {m1} kg</label>
              <input type="range" min="1" max="5" value={m1} onChange={e => setM1(Number(e.target.value))} className="w-full accent-blue-600" />
              <label className="block text-xs mb-1 mt-2">Initial Vel: {v1} m/s</label>
              <input type="range" min="-5" max="5" value={v1} onChange={e => setV1(Number(e.target.value))} className="w-full accent-blue-600" />
            </div>
            <div className="p-3 bg-red-50 rounded border border-red-100">
              <h5 className="font-medium text-red-800 mb-2">Object 2 (Red)</h5>
              <label className="block text-xs mb-1">Mass: {m2} kg</label>
              <input type="range" min="1" max="5" value={m2} onChange={e => setM2(Number(e.target.value))} className="w-full accent-red-600" />
              <label className="block text-xs mb-1 mt-2">Initial Vel: {v2} m/s</label>
              <input type="range" min="-5" max="5" value={v2} onChange={e => setV2(Number(e.target.value))} className="w-full accent-red-600" />
            </div>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input type="radio" checked={isElastic} onChange={() => setIsElastic(true)} className="accent-indigo-600" /> Elastic (Bouncy)
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input type="radio" checked={!isElastic} onChange={() => setIsElastic(false)} className="accent-indigo-600" /> Inelastic (Sticky)
            </label>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIsPlaying(!isPlaying)} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors">{isPlaying ? 'Pause' : 'Play'}</button>
            <button onClick={reset} className="px-4 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition-colors">Reset</button>
          </div>
        </div>
        <div className="flex flex-col justify-center">
          <div className="relative h-32 bg-slate-50 rounded-lg overflow-hidden border border-slate-200 flex items-center mb-6">
            <div className="absolute w-full h-px bg-slate-300"></div>
            {/* Object 1 */}
            <div 
              className="absolute bg-blue-500 rounded-full flex items-center justify-center text-white font-bold shadow-md transition-all duration-75"
              style={{ 
                left: `${displayState.pos1 - (15 + m1 * 2)}px`, 
                width: `${(15 + m1 * 2) * 2}px`, 
                height: `${(15 + m1 * 2) * 2}px` 
              }}
            >
              {m1}
            </div>
            {/* Object 2 */}
            <div 
              className="absolute bg-red-500 rounded-full flex items-center justify-center text-white font-bold shadow-md transition-all duration-75"
              style={{ 
                left: `${displayState.pos2 - (15 + m2 * 2)}px`, 
                width: `${(15 + m2 * 2) * 2}px`, 
                height: `${(15 + m2 * 2) * 2}px` 
              }}
            >
              {m2}
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded border border-slate-200 text-sm">
            <div className="flex justify-between mb-2">
              <span className="text-slate-600">Initial Total Momentum:</span>
              <span className="font-bold text-slate-800">{pInitial.toFixed(2)} kg·m/s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Current Total Momentum:</span>
              <span className="font-bold text-emerald-600">{pCurrent.toFixed(2)} kg·m/s</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 4. Centripetal Force Visualizer
export function VisualizerCentripetal() {
  const [velocity, setVelocity] = useState(5);
  const [radius, setRadius] = useState(2);
  const mass = 1;
  const force = (mass * velocity * velocity) / radius;
  
  const [angle, setAngle] = useState(0);
  const reqRef = useRef(0);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    const animate = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const dt = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;
      
      const omega = velocity / radius;
      setAngle(a => a + omega * dt);
      
      reqRef.current = requestAnimationFrame(animate);
    };
    reqRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(reqRef.current);
  }, [velocity, radius]);

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm my-6">
      <h4 className="text-lg font-semibold text-slate-800 mb-4">Interactive: Centripetal Force (<InlineMath math="F_c = \frac{mv^2}{r}" />)</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <p className="text-sm text-slate-600 mb-4">Observe how the centripetal force (red arrow) required to keep the object in circular motion changes. It increases quadratically with velocity, but inversely with radius.</p>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Velocity (v): {velocity} m/s</label>
            <input type="range" min="1" max="10" value={velocity} onChange={e => setVelocity(Number(e.target.value))} className="w-full accent-indigo-600" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Radius (r): {radius} m</label>
            <input type="range" min="1" max="4" step="0.5" value={radius} onChange={e => setRadius(Number(e.target.value))} className="w-full accent-indigo-600" />
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <BlockMath math={`F_c = \\frac{1 \\cdot ${velocity}^2}{${radius}} = ${force.toFixed(2)} \\text{ N}`} />
          </div>
        </div>
        <div className="relative h-64 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden">
          {/* Orbit path */}
          <div className="absolute rounded-full border border-slate-300 border-dashed transition-all duration-75" style={{ width: `${radius * 50}px`, height: `${radius * 50}px` }}></div>
          {/* Center */}
          <div className="absolute w-3 h-3 bg-slate-800 rounded-full z-10"></div>
          
          {/* Rotating container */}
          <div className="absolute w-full h-full flex items-center justify-center" style={{ transform: `rotate(${angle}rad)` }}>
            {/* String */}
            <div className="absolute h-px bg-slate-400 transition-all duration-75" style={{ width: `${radius * 25}px`, left: '50%', transformOrigin: 'left' }}></div>
            {/* Mass */}
            <div className="absolute w-6 h-6 bg-indigo-600 rounded-full shadow-md transition-all duration-75" style={{ left: `calc(50% + ${radius * 25}px - 12px)` }}></div>
            
            {/* Force Vector (Centripetal) */}
            <div className="absolute h-1 bg-red-500 transition-all duration-75" style={{ width: `${Math.min(force * 2, radius * 25)}px`, left: `calc(50% + ${radius * 25}px - ${Math.min(force * 2, radius * 25)}px)` }}>
              <div className="absolute left-0 -top-1.5 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-8 border-r-red-500"></div>
            </div>
            
            {/* Velocity Vector (Tangential) */}
            <div className="absolute w-1 bg-blue-500 transition-all duration-75" style={{ height: `${velocity * 10}px`, left: `calc(50% + ${radius * 25}px - 0.5px)`, top: '50%' }}>
              <div className="absolute -bottom-2 -left-1.5 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-8 border-t-blue-500"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 6. Gravity Visualizer
export function VisualizerGravity() {
  const [m1, setM1] = useState(1000); // kg
  const [m2, setM2] = useState(1000); // kg
  const [distance, setDistance] = useState(10); // m
  
  const G = 6.674e-11;
  const force = G * (m1 * m2) / (distance * distance);
  
  // Format force for display
  const formatForce = (f: number) => {
    if (f === 0) return "0";
    const exp = Math.floor(Math.log10(f));
    const mantissa = f / Math.pow(10, exp);
    return `${mantissa.toFixed(2)} \\times 10^{${exp}}`;
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm my-6">
      <h4 className="text-lg font-semibold text-slate-800 mb-4">Interactive: Newton's Law of Universal Gravitation</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <p className="text-sm text-slate-600 mb-4">
            Adjust the masses of the two objects and the distance between their centers to see how the gravitational force changes.
          </p>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Mass 1 (<InlineMath math="m_1" />): {m1.toLocaleString()} kg</label>
            <input type="range" min="100" max="10000" step="100" value={m1} onChange={e => setM1(Number(e.target.value))} className="w-full accent-blue-600" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Mass 2 (<InlineMath math="m_2" />): {m2.toLocaleString()} kg</label>
            <input type="range" min="100" max="10000" step="100" value={m2} onChange={e => setM2(Number(e.target.value))} className="w-full accent-red-600" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Distance (<InlineMath math="r" />): {distance} m</label>
            <input type="range" min="1" max="50" step="1" value={distance} onChange={e => setDistance(Number(e.target.value))} className="w-full accent-emerald-600" />
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <BlockMath math={`F_g = G \\frac{m_1 m_2}{r^2}`} />
            <div className="mt-2 text-center text-lg font-bold text-indigo-700">
              <InlineMath math={`F_g = ${formatForce(force)} \\text{ N}`} />
            </div>
          </div>
        </div>
        <div className="relative h-64 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden">
          {/* Distance line */}
          <div className="absolute h-px bg-slate-400 border-dashed" style={{ width: `${Math.max(20, distance * 4)}px`, zIndex: 0 }}></div>
          <div className="absolute -mt-6 text-xs text-slate-500 bg-slate-50 px-1">{distance} m</div>
          
          {/* Mass 1 */}
          <div 
            className="absolute bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md z-10 transition-all duration-200"
            style={{ 
              width: `${Math.max(20, Math.sqrt(m1) * 0.8)}px`, 
              height: `${Math.max(20, Math.sqrt(m1) * 0.8)}px`,
              transform: `translateX(-${Math.max(20, distance * 4) / 2}px)`
            }}
          >
            m₁
          </div>
          
          {/* Mass 2 */}
          <div 
            className="absolute bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md z-10 transition-all duration-200"
            style={{ 
              width: `${Math.max(20, Math.sqrt(m2) * 0.8)}px`, 
              height: `${Math.max(20, Math.sqrt(m2) * 0.8)}px`,
              transform: `translateX(${Math.max(20, distance * 4) / 2}px)`
            }}
          >
            m₂
          </div>
          
          {/* Force vectors */}
          {/* F on m1 by m2 */}
          <div className="absolute h-1 bg-indigo-500 z-20 transition-all duration-200" style={{ 
            width: `${Math.min(100, Math.max(10, force * 1e8))}px`, 
            transform: `translateX(calc(-${Math.max(20, distance * 4) / 2}px + ${Math.min(100, Math.max(10, force * 1e8))/2}px + ${Math.max(20, Math.sqrt(m1) * 0.8)/2}px))` 
          }}>
            <div className="absolute right-0 -top-1.5 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-8 border-l-indigo-500"></div>
          </div>
          
          {/* F on m2 by m1 */}
          <div className="absolute h-1 bg-indigo-500 z-20 transition-all duration-200" style={{ 
            width: `${Math.min(100, Math.max(10, force * 1e8))}px`, 
            transform: `translateX(calc(${Math.max(20, distance * 4) / 2}px - ${Math.min(100, Math.max(10, force * 1e8))/2}px - ${Math.max(20, Math.sqrt(m2) * 0.8)/2}px))` 
          }}>
            <div className="absolute left-0 -top-1.5 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-8 border-r-indigo-500"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
export function VisualizerTorque() {
  const [radius, setRadius] = useState(2);
  const [force, setForce] = useState(10);
  const [angleDeg, setAngleDeg] = useState(90);
  
  const angleRad = (angleDeg * Math.PI) / 180;
  const torque = radius * force * Math.sin(angleRad);
  
  // SVG drawing parameters
  const cx = 150;
  const cy = 150;
  const scaleR = 40; // pixels per meter
  const scaleF = 4;  // pixels per Newton
  
  // r vector
  const rx = cx + radius * scaleR;
  const ry = cy;
  
  // F vector
  const fx = rx + force * scaleF * Math.cos(angleRad);
  const fy = ry - force * scaleF * Math.sin(angleRad);
  
  // Line of action intersection (moment arm)
  // Math coords: r_vec = (r, 0), u_vec = (cos A, sin A)
  // Intersection I = r_vec - (r * cos A) * u_vec
  const ix_math = radius * Math.pow(Math.sin(angleRad), 2);
  const iy_math = -radius * Math.sin(angleRad) * Math.cos(angleRad);
  
  const ix = cx + ix_math * scaleR;
  const iy = cy - iy_math * scaleR;
  
  // Line of action extended points
  const lineLen = 200;
  const lx1 = rx + lineLen * Math.cos(angleRad);
  const ly1 = ry - lineLen * Math.sin(angleRad);
  const lx2 = rx - lineLen * Math.cos(angleRad);
  const ly2 = ry + lineLen * Math.sin(angleRad);

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm my-6">
      <h4 className="text-lg font-semibold text-slate-800 mb-4">Interactive: Torque (<InlineMath math="\vec{\tau} = \vec{r} \times \vec{F}" />)</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <p className="text-sm text-slate-600 mb-4">
            Adjust the position vector (<InlineMath math="\vec{r}" />), force magnitude (<InlineMath math="|\vec{F}|" />), and the angle (<InlineMath math="\theta" />) between them. 
            Notice how the moment arm (<InlineMath math="r_\perp" />) changes and affects the resulting torque.
          </p>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Distance (r): {radius} m</label>
            <input type="range" min="0.5" max="3" step="0.1" value={radius} onChange={e => setRadius(Number(e.target.value))} className="w-full accent-blue-600" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Force (F): {force} N</label>
            <input type="range" min="1" max="20" value={force} onChange={e => setForce(Number(e.target.value))} className="w-full accent-red-600" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Angle (<InlineMath math="\theta" />): {angleDeg}°</label>
            <input type="range" min="0" max="180" value={angleDeg} onChange={e => setAngleDeg(Number(e.target.value))} className="w-full accent-emerald-600" />
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-sm space-y-2">
            <div>
              <span className="font-medium text-slate-700">Moment Arm (<InlineMath math="r_\perp = r \sin\theta" />): </span>
              <span className="font-mono text-emerald-600">{(radius * Math.sin(angleRad)).toFixed(2)} m</span>
            </div>
            <div>
              <span className="font-medium text-slate-700">Torque Magnitude (<InlineMath math="\tau = r F \sin\theta" />): </span>
              <span className="font-mono font-bold text-indigo-600">{Math.abs(torque).toFixed(2)} N·m</span>
            </div>
            <div>
              <span className="font-medium text-slate-700">Direction (Right-Hand Rule): </span>
              <span className="font-mono font-bold text-indigo-600">
                {torque > 0.01 ? 'Out of screen (Counter-Clockwise)' : torque < -0.01 ? 'Into screen (Clockwise)' : 'Zero'}
              </span>
            </div>
          </div>
        </div>
        <div className="relative h-72 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden">
          <svg width="300" height="300" viewBox="0 0 300 300" className="max-w-full h-auto">
            <defs>
              <marker id="arrow-r" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
              </marker>
              <marker id="arrow-f" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
              </marker>
            </defs>
            
            {/* Grid/Background */}
            <circle cx={cx} cy={cy} r="4" fill="#0f172a" />
            <text x={cx - 15} y={cy + 15} fill="#64748b" fontSize="12" fontWeight="bold">Pivot</text>
            
            {/* Line of action */}
            <line x1={lx1} y1={ly1} x2={lx2} y2={ly2} stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4,4" />
            
            {/* Moment arm (perpendicular distance) */}
            <line x1={cx} y1={cy} x2={ix} y2={iy} stroke="#10b981" strokeWidth="2" strokeDasharray="2,2" />
            
            {/* Right angle symbol at intersection if angle is not 0 or 180 */}
            {Math.abs(Math.sin(angleRad)) > 0.01 && (
              <g transform={`translate(${ix}, ${iy}) rotate(${-angleDeg})`}>
                <polyline points="0,0 8,0 8,8 0,8" fill="none" stroke="#10b981" strokeWidth="1" />
              </g>
            )}

            {/* Position Vector r */}
            <line x1={cx} y1={cy} x2={rx} y2={ry} stroke="#3b82f6" strokeWidth="3" markerEnd="url(#arrow-r)" />
            <text x={cx + (rx - cx)/2} y={cy + 15} fill="#3b82f6" fontSize="14" fontWeight="bold">r</text>
            
            {/* Force Vector F */}
            <line x1={rx} y1={ry} x2={fx} y2={fy} stroke="#ef4444" strokeWidth="3" markerEnd="url(#arrow-f)" />
            <text x={rx + (fx - rx)/2 + 10} y={ry + (fy - ry)/2 - 10} fill="#ef4444" fontSize="14" fontWeight="bold">F</text>
            
            {/* Angle arc */}
            {angleDeg > 0 && angleDeg < 180 && (
              <path 
                d={`M ${rx + 20} ${ry} A 20 20 0 0 0 ${rx + 20 * Math.cos(angleRad)} ${ry - 20 * Math.sin(angleRad)}`} 
                fill="none" stroke="#0f172a" strokeWidth="1.5" 
              />
            )}
            {angleDeg > 0 && angleDeg < 180 && (
              <text x={rx + 25 * Math.cos(angleRad/2)} y={ry - 25 * Math.sin(angleRad/2) + 5} fill="#0f172a" fontSize="12">θ</text>
            )}

            {/* Torque Direction Indicator */}
            <g transform={`translate(30, 30)`}>
              <circle cx="0" cy="0" r="15" fill="none" stroke="#4f46e5" strokeWidth="2" />
              {torque > 0.01 ? (
                // Out of screen (dot)
                <circle cx="0" cy="0" r="4" fill="#4f46e5" />
              ) : torque < -0.01 ? (
                // Into screen (cross)
                <path d="M -5 -5 L 5 5 M -5 5 L 5 -5" stroke="#4f46e5" strokeWidth="2" />
              ) : null}
              <text x="20" y="4" fill="#4f46e5" fontSize="12" fontWeight="bold">τ</text>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}

// 7. Impulse Visualizer
export function VisualizerImpulse() {
  const [maxForce, setMaxForce] = useState(1000); // N
  const [duration, setDuration] = useState(10); // ms
  const [mass, setMass] = useState(0.5); // kg
  const [initialVel, setInitialVel] = useState(-5); // m/s (e.g., ball coming in)

  const durationSec = duration / 1000;
  // Triangular pulse area: 1/2 * base * height
  const impulse = 0.5 * maxForce * durationSec; 
  const deltaV = impulse / mass;
  const finalVel = initialVel + deltaV;

  // SVG parameters for the graph
  const width = 300;
  const height = 200;
  const padding = 40;
  
  const graphWidth = width - 2 * padding;
  const graphHeight = height - 2 * padding;
  
  // Scale factors
  const maxFScale = 2000;
  const maxTScale = 20;
  
  const scaleX = graphWidth / maxTScale;
  const scaleY = graphHeight / maxFScale;
  
  const originX = padding;
  const originY = height - padding;

  // Triangle points
  const p1x = originX;
  const p1y = originY;
  const p2x = originX + (duration / 2) * scaleX;
  const p2y = originY - maxForce * scaleY;
  const p3x = originX + duration * scaleX;
  const p3y = originY;

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm my-6">
      <h4 className="text-lg font-semibold text-slate-800 mb-4">Interactive: Impulse-Momentum Theorem (<InlineMath math="J = \Delta p" />)</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <p className="text-sm text-slate-600 mb-4">
            Adjust the peak force and collision duration to see how the impulse (area under the curve) changes the object's momentum and velocity.
          </p>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Peak Force (<InlineMath math="F_{max}" />): {maxForce} N</label>
            <input type="range" min="100" max="2000" step="100" value={maxForce} onChange={e => setMaxForce(Number(e.target.value))} className="w-full accent-red-600" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Duration (<InlineMath math="\Delta t" />): {duration} ms</label>
            <input type="range" min="2" max="20" step="1" value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full accent-blue-600" />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mass (<InlineMath math="m" />): {mass} kg</label>
              <input type="range" min="0.1" max="2" step="0.1" value={mass} onChange={e => setMass(Number(e.target.value))} className="w-full accent-slate-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Initial Vel (<InlineMath math="v_i" />): {initialVel} m/s</label>
              <input type="range" min="-20" max="20" step="1" value={initialVel} onChange={e => setInitialVel(Number(e.target.value))} className="w-full accent-slate-600" />
            </div>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-sm space-y-2">
            <div className="flex justify-between">
              <span className="font-medium text-slate-700">Impulse (<InlineMath math="J = \frac{1}{2} F_{max} \Delta t" />): </span>
              <span className="font-mono font-bold text-indigo-600">{impulse.toFixed(2)} N·s</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-slate-700">Change in Velocity (<InlineMath math="\Delta v = J / m" />): </span>
              <span className="font-mono text-emerald-600">+{deltaV.toFixed(2)} m/s</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2">
              <span className="font-medium text-slate-700">Final Velocity (<InlineMath math="v_f" />): </span>
              <span className="font-mono font-bold text-blue-600">{finalVel.toFixed(2)} m/s</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-4">
          {/* Force-Time Graph */}
          <div className="relative h-48 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden">
            <svg width={width} height={height} className="max-w-full h-auto">
              {/* Axes */}
              <line x1={originX} y1={padding} x2={originX} y2={originY} stroke="#94a3b8" strokeWidth="2" />
              <line x1={originX} y1={originY} x2={width - padding + 20} y2={originY} stroke="#94a3b8" strokeWidth="2" />
              
              {/* Labels */}
              <text x={originX - 10} y={padding} fill="#64748b" fontSize="12" textAnchor="end">F (N)</text>
              <text x={width - padding + 20} y={originY + 20} fill="#64748b" fontSize="12" textAnchor="end">t (ms)</text>
              
              {/* Max Force Line */}
              <line x1={originX - 5} y1={p2y} x2={originX} y2={p2y} stroke="#64748b" strokeWidth="1" />
              <text x={originX - 10} y={p2y + 4} fill="#ef4444" fontSize="10" textAnchor="end">{maxForce}</text>
              
              {/* Duration Line */}
              <line x1={p3x} y1={originY} x2={p3x} y2={originY + 5} stroke="#64748b" strokeWidth="1" />
              <text x={p3x} y={originY + 15} fill="#3b82f6" fontSize="10" textAnchor="middle">{duration}</text>
              
              {/* Impulse Area */}
              <polygon 
                points={`${p1x},${p1y} ${p2x},${p2y} ${p3x},${p3y}`} 
                fill="rgba(99, 102, 241, 0.2)" 
                stroke="#4f46e5" 
                strokeWidth="2" 
              />
              <text x={originX + (duration * scaleX)/2} y={originY - 20} fill="#4f46e5" fontSize="14" fontWeight="bold" textAnchor="middle">
                Area = J
              </text>
            </svg>
          </div>
          
          {/* Object visualization */}
          <div className="relative h-24 bg-slate-50 rounded-lg border border-slate-200 overflow-hidden flex items-center">
            <div className="absolute w-full h-px bg-slate-300"></div>
            <div className="absolute left-1/2 w-px h-full bg-slate-200 border-l border-dashed border-slate-400"></div>
            <span className="absolute left-1/2 top-2 -translate-x-1/2 text-xs text-slate-400 bg-slate-50 px-1">Collision Point</span>
            
            {/* Before */}
            <div className="absolute left-1/4 -translate-x-1/2 flex flex-col items-center">
              <span className="text-xs text-slate-500 mb-1">Before</span>
              <div className="w-8 h-8 bg-slate-400 rounded-full flex items-center justify-center text-white text-xs font-bold">{mass}kg</div>
              <div className="flex items-center mt-1 text-xs font-mono text-slate-600">
                {initialVel < 0 && <span className="mr-1">←</span>}
                {Math.abs(initialVel).toFixed(1)} m/s
                {initialVel > 0 && <span className="ml-1">→</span>}
              </div>
            </div>
            {/* After */}
            <div className="absolute left-3/4 -translate-x-1/2 flex flex-col items-center">
              <span className="text-xs text-slate-500 mb-1">After</span>
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">{mass}kg</div>
              <div className="flex items-center mt-1 text-xs font-mono text-blue-600 font-bold">
                {finalVel < 0 && <span className="mr-1">←</span>}
                {Math.abs(finalVel).toFixed(1)} m/s
                {finalVel > 0 && <span className="ml-1">→</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 8. Moment of Inertia Visualizer
export function VisualizerInertia() {
  const [shape, setShape] = useState('disk');
  const [mass, setMass] = useState(2); // kg
  const [dimension, setDimension] = useState(2); // radius or length in m
  const [axisOffset, setAxisOffset] = useState(0); // m

  let I_cm = 0;
  let formula = '';
  let dimLabel = 'Radius (R)';
  let shapeName = '';
  
  switch (shape) {
    case 'disk':
      I_cm = 0.5 * mass * dimension * dimension;
      formula = '\\frac{1}{2} M R^2';
      shapeName = 'Solid Disk / Cylinder';
      break;
    case 'hoop':
      I_cm = mass * dimension * dimension;
      formula = 'M R^2';
      shapeName = 'Hoop / Thin Shell';
      break;
    case 'sphere':
      I_cm = (2/5) * mass * dimension * dimension;
      formula = '\\frac{2}{5} M R^2';
      shapeName = 'Solid Sphere';
      break;
    case 'rod_center':
      I_cm = (1/12) * mass * dimension * dimension;
      formula = '\\frac{1}{12} M L^2';
      dimLabel = 'Length (L)';
      shapeName = 'Thin Rod (Center Axis)';
      break;
  }

  const I_total = I_cm + mass * axisOffset * axisOffset;

  // SVG drawing
  const cx = 150;
  const cy = 150;
  const scale = 30; // pixels per meter

  const renderShape = () => {
    if (shape === 'disk') {
      return <circle cx={cx} cy={cy} r={dimension * scale} fill="#3b82f6" opacity="0.8" />;
    } else if (shape === 'hoop') {
      return <circle cx={cx} cy={cy} r={dimension * scale} fill="none" stroke="#3b82f6" strokeWidth="6" />;
    } else if (shape === 'sphere') {
      return (
        <g>
          <defs>
            <radialGradient id="sphereGrad" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#1e3a8a" />
            </radialGradient>
          </defs>
          <circle cx={cx} cy={cy} r={dimension * scale} fill="url(#sphereGrad)" />
        </g>
      );
    } else if (shape === 'rod_center') {
      return <rect x={cx - (dimension * scale) / 2} y={cy - 10} width={dimension * scale} height={20} fill="#3b82f6" rx="4" />;
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm my-6">
      <h4 className="text-lg font-semibold text-slate-800 mb-4">Interactive: Moment of Inertia & Parallel-Axis Theorem</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Shape</label>
            <select 
              value={shape} 
              onChange={e => {
                setShape(e.target.value);
                setAxisOffset(0);
              }} 
              className="w-full p-2 border border-slate-300 rounded-md bg-slate-50"
            >
              <option value="disk">Solid Disk / Cylinder</option>
              <option value="hoop">Hoop / Thin Cylindrical Shell</option>
              <option value="sphere">Solid Sphere</option>
              <option value="rod_center">Thin Rod (Center Axis)</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Mass (M): {mass} kg</label>
            <input type="range" min="1" max="10" step="0.5" value={mass} onChange={e => setMass(Number(e.target.value))} className="w-full accent-indigo-600" />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">{dimLabel}: {dimension} m</label>
            <input type="range" min="0.5" max="4" step="0.1" value={dimension} onChange={e => setDimension(Number(e.target.value))} className="w-full accent-indigo-600" />
          </div>

          <div className="mb-4 p-3 bg-amber-50 rounded border border-amber-200">
            <label className="block text-sm font-medium text-amber-800 mb-1">Parallel Axis Offset (d): {axisOffset} m</label>
            <input type="range" min="0" max="3" step="0.1" value={axisOffset} onChange={e => setAxisOffset(Number(e.target.value))} className="w-full accent-amber-600" />
            <p className="text-xs text-amber-700 mt-1">Move the axis of rotation away from the Center of Mass.</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-sm space-y-3">
            <div>
              <span className="font-medium text-slate-700">CM Moment of Inertia (<InlineMath math={`I_{cm} = ${formula}`} />): </span>
              <span className="font-mono text-blue-600">{I_cm.toFixed(2)} kg·m²</span>
            </div>
            {axisOffset > 0 && (
              <div>
                <span className="font-medium text-slate-700">Parallel-Axis Term (<InlineMath math="M d^2" />): </span>
                <span className="font-mono text-amber-600">{(mass * axisOffset * axisOffset).toFixed(2)} kg·m²</span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-200">
              <span className="font-medium text-slate-800">Total Moment of Inertia (<InlineMath math="I = I_{cm} + M d^2" />): </span>
              <span className="font-mono font-bold text-indigo-700 text-lg">{I_total.toFixed(2)} kg·m²</span>
            </div>
          </div>
        </div>
        
        <div className="relative h-80 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden">
          <svg width="300" height="300" viewBox="0 0 300 300" className="max-w-full h-auto">
            {/* Grid */}
            <line x1="150" y1="0" x2="150" y2="300" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="0" y1="150" x2="300" y2="150" stroke="#e2e8f0" strokeWidth="1" />
            
            {/* Shape */}
            {renderShape()}
            
            {/* CM Axis */}
            <circle cx={cx} cy={cy} r="4" fill="#0f172a" />
            <text x={cx + 8} y={cy - 8} fill="#64748b" fontSize="12" fontWeight="bold">CM</text>
            
            {/* Parallel Axis */}
            {axisOffset > 0 && (
              <g>
                <line x1={cx} y1={cy} x2={cx + axisOffset * scale} y2={cy} stroke="#d97706" strokeWidth="2" strokeDasharray="4,4" />
                <circle cx={cx + axisOffset * scale} cy={cy} r="5" fill="#d97706" />
                <text x={cx + axisOffset * scale + 8} y={cy + 15} fill="#d97706" fontSize="12" fontWeight="bold">New Axis</text>
                <text x={cx + (axisOffset * scale) / 2} y={cy - 8} fill="#d97706" fontSize="12">d = {axisOffset}m</text>
              </g>
            )}
          </svg>
        </div>
      </div>
    </div>
  );
}

// 9. Kinematics Visualizer
export function VisualizerKinematics() {
  const [v0, setV0] = useState(0);
  const [a, setA] = useState(2);
  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useState(0);
  
  const reqRef = useRef(0);
  const lastTimeRef = useRef(0);

  const reset = () => {
    setIsPlaying(false);
    setTime(0);
  };

  useEffect(() => {
    if (isPlaying) {
      const animate = (t: number) => {
        if (!lastTimeRef.current) lastTimeRef.current = t;
        const dt = (t - lastTimeRef.current) / 1000;
        lastTimeRef.current = t;
        
        setTime(prev => {
          const newTime = prev + dt;
          if (newTime > 5) {
            setIsPlaying(false);
            return 5;
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

  const currentV = v0 + a * time;
  const currentX = v0 * time + 0.5 * a * time * time;

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm my-6">
      <h4 className="text-lg font-semibold text-slate-800 mb-4">Interactive: Kinematic Equations (<InlineMath math="v = v_0 + at" />, <InlineMath math="x = x_0 + v_0t + \frac{1}{2}at^2" />)</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <p className="text-sm text-slate-600 mb-4">
            Adjust the initial velocity and constant acceleration to see how position and velocity change over time.
          </p>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Initial Velocity (<InlineMath math="v_0" />): {v0} m/s</label>
            <input type="range" min="-10" max="10" step="1" value={v0} onChange={e => {setV0(Number(e.target.value)); reset();}} className="w-full accent-blue-600" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Acceleration (<InlineMath math="a" />): {a} m/s²</label>
            <input type="range" min="-5" max="5" step="1" value={a} onChange={e => {setA(Number(e.target.value)); reset();}} className="w-full accent-red-600" />
          </div>
          <div className="flex gap-2 mb-4">
            <button onClick={() => setIsPlaying(!isPlaying)} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors">{isPlaying ? 'Pause' : 'Play'}</button>
            <button onClick={reset} className="px-4 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition-colors">Reset</button>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-sm space-y-2">
            <div>
              <span className="font-medium text-slate-700">Time (<InlineMath math="t" />): </span>
              <span className="font-mono text-slate-800">{time.toFixed(2)} s</span>
            </div>
            <div>
              <span className="font-medium text-slate-700">Velocity (<InlineMath math="v" />): </span>
              <span className="font-mono text-blue-600">{currentV.toFixed(2)} m/s</span>
            </div>
            <div>
              <span className="font-medium text-slate-700">Position (<InlineMath math="x" />): </span>
              <span className="font-mono text-emerald-600">{currentX.toFixed(2)} m</span>
            </div>
          </div>
        </div>
        
        <div className="relative h-64 bg-slate-50 rounded-lg border border-slate-200 flex flex-col justify-center overflow-hidden px-4">
          {/* Track */}
          <div className="w-full h-2 bg-slate-300 rounded-full relative">
            {/* Origin marker */}
            <div className="absolute w-1 h-6 bg-slate-400 -top-2 left-1/2"></div>
            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-slate-500">x=0</span>
            
            {/* Car */}
            <div 
              className="absolute w-8 h-8 bg-indigo-600 rounded shadow-md -top-3 transition-all duration-75 flex items-center justify-center"
              style={{ left: `calc(50% + ${currentX * 2}px - 16px)` }}
            >
              {/* Velocity vector */}
              {Math.abs(currentV) > 0.1 && (
                <div 
                  className="absolute h-1 bg-blue-400 z-10"
                  style={{ 
                    width: `${Math.abs(currentV) * 5}px`, 
                    [currentV > 0 ? 'left' : 'right']: '100%',
                    top: '50%',
                    transform: 'translateY(-50%)'
                  }}
                >
                  <div className={`absolute ${currentV > 0 ? 'right-0 -top-1.5 border-l-8 border-l-blue-400' : 'left-0 -top-1.5 border-r-8 border-r-blue-400'} w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent`}></div>
                  <span className={`absolute -top-5 ${currentV > 0 ? 'right-0' : 'left-0'} text-xs text-blue-500 font-bold`}>v</span>
                </div>
              )}
              
              {/* Acceleration vector */}
              {Math.abs(a) > 0.1 && (
                <div 
                  className="absolute h-1 bg-red-400 z-10"
                  style={{ 
                    width: `${Math.abs(a) * 10}px`, 
                    [a > 0 ? 'left' : 'right']: '100%',
                    top: '-10px'
                  }}
                >
                  <div className={`absolute ${a > 0 ? 'right-0 -top-1.5 border-l-8 border-l-red-400' : 'left-0 -top-1.5 border-r-8 border-r-red-400'} w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent`}></div>
                  <span className={`absolute -top-5 ${a > 0 ? 'right-0' : 'left-0'} text-xs text-red-500 font-bold`}>a</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 10. Work Visualizer
export function VisualizerWork() {
  const [force, setForce] = useState(10);
  const [angleDeg, setAngleDeg] = useState(0);
  const [distance, setDistance] = useState(5);
  
  const angleRad = (angleDeg * Math.PI) / 180;
  const work = force * distance * Math.cos(angleRad);
  const forceX = force * Math.cos(angleRad);
  
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm my-6">
      <h4 className="text-lg font-semibold text-slate-800 mb-4">Interactive: Work Done by a Constant Force (<InlineMath math="W = F d \cos\theta" />)</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <p className="text-sm text-slate-600 mb-4">
            Adjust the force magnitude, angle, and displacement to see how they affect the work done. Notice that only the component of force parallel to the displacement does work.
          </p>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Force (<InlineMath math="F" />): {force} N</label>
            <input type="range" min="0" max="20" step="1" value={force} onChange={e => setForce(Number(e.target.value))} className="w-full accent-red-600" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Angle (<InlineMath math="\theta" />): {angleDeg}°</label>
            <input type="range" min="0" max="180" step="5" value={angleDeg} onChange={e => setAngleDeg(Number(e.target.value))} className="w-full accent-emerald-600" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Displacement (<InlineMath math="d" />): {distance} m</label>
            <input type="range" min="0" max="10" step="1" value={distance} onChange={e => setDistance(Number(e.target.value))} className="w-full accent-blue-600" />
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-sm space-y-2">
            <div>
              <span className="font-medium text-slate-700">Parallel Force Component (<InlineMath math="F_x = F \cos\theta" />): </span>
              <span className="font-mono text-slate-800">{forceX.toFixed(2)} N</span>
            </div>
            <div className="pt-2 border-t border-slate-200">
              <span className="font-medium text-slate-800">Work Done (<InlineMath math="W = F_x \cdot d" />): </span>
              <span className={`font-mono font-bold text-lg ${work > 0 ? 'text-emerald-600' : work < 0 ? 'text-red-600' : 'text-slate-500'}`}>
                {work.toFixed(2)} J
              </span>
            </div>
          </div>
        </div>
        
        <div className="relative h-64 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden">
          <svg width="300" height="200" viewBox="0 0 300 200" className="max-w-full h-auto">
            <defs>
              <marker id="arrow-f" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
              </marker>
              <marker id="arrow-d" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
              </marker>
              <marker id="arrow-fx" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
              </marker>
            </defs>
            
            {/* Ground */}
            <line x1="20" y1="150" x2="280" y2="150" stroke="#cbd5e1" strokeWidth="4" />
            
            {/* Block */}
            <rect x="50" y="110" width="60" height="40" fill="#e2e8f0" stroke="#64748b" strokeWidth="2" />
            
            {/* Displacement Vector */}
            {distance > 0 && (
              <g>
                <line x1="80" y1="170" x2={80 + distance * 15} y2="170" stroke="#3b82f6" strokeWidth="3" markerEnd="url(#arrow-d)" />
                <text x={80 + (distance * 15)/2} y="190" fill="#3b82f6" fontSize="14" fontWeight="bold" textAnchor="middle">d</text>
              </g>
            )}
            
            {/* Force Vector */}
            {force > 0 && (
              <g transform="translate(80, 130)">
                {/* Fx Component */}
                {Math.abs(forceX) > 0.1 && (
                  <line x1="0" y1="0" x2={forceX * 5} y2="0" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4,4" markerEnd="url(#arrow-fx)" />
                )}
                
                {/* Main Force */}
                <line x1="0" y1="0" x2={force * 5 * Math.cos(angleRad)} y2={-force * 5 * Math.sin(angleRad)} stroke="#ef4444" strokeWidth="3" markerEnd="url(#arrow-f)" />
                <text x={force * 5 * Math.cos(angleRad) + 10} y={-force * 5 * Math.sin(angleRad) - 5} fill="#ef4444" fontSize="14" fontWeight="bold">F</text>
                
                {/* Angle arc */}
                {angleDeg > 0 && angleDeg < 180 && (
                  <path 
                    d={`M 20 0 A 20 20 0 0 0 ${20 * Math.cos(angleRad)} ${-20 * Math.sin(angleRad)}`} 
                    fill="none" stroke="#0f172a" strokeWidth="1.5" 
                  />
                )}
                {angleDeg > 0 && angleDeg < 180 && (
                  <text x={25 * Math.cos(angleRad/2)} y={-25 * Math.sin(angleRad/2) + 5} fill="#0f172a" fontSize="12">θ</text>
                )}
              </g>
            )}
          </svg>
        </div>
      </div>
    </div>
  );
}

