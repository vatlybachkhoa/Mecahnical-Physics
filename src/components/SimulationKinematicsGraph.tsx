import React, { useState, useEffect, useRef } from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import { Play, Pause, RotateCcw } from 'lucide-react';

type ScenarioKey = 'speed_up_pos' | 'slow_down_pos' | 'speed_up_neg' | 'slow_down_neg' | 'reverse';

interface Scenario {
  name: string;
  v0: number;
  a: number;
  tMax: number;
  description: string;
}

const SCENARIOS: Record<ScenarioKey, Scenario> = {
  speed_up_pos: {
    name: 'Speeding Up (v > 0, a > 0)',
    v0: 0,
    a: 2,
    tMax: 5,
    description: 'Object moves in the positive direction and accelerates. Velocity and acceleration have the same sign (v·a > 0).'
  },
  slow_down_pos: {
    name: 'Slowing Down (v > 0, a < 0)',
    v0: 10,
    a: -2,
    tMax: 5,
    description: 'Object moves in the positive direction but is braking. Velocity and acceleration have opposite signs (v·a < 0).'
  },
  speed_up_neg: {
    name: 'Speeding Up (v < 0, a < 0)',
    v0: 0,
    a: -2,
    tMax: 5,
    description: 'Object moves in the negative direction and accelerates. Velocity and acceleration have the same sign (v·a > 0).'
  },
  slow_down_neg: {
    name: 'Slowing Down (v < 0, a > 0)',
    v0: -10,
    a: 2,
    tMax: 5,
    description: 'Object moves in the negative direction but is braking. Velocity and acceleration have opposite signs (v·a < 0).'
  },
  reverse: {
    name: 'Reversing Direction',
    v0: 6,
    a: -3,
    tMax: 4,
    description: 'Object slows down in the positive direction, stops momentarily at t=2s, then speeds up in the negative direction.'
  }
};

export function SimulationKinematicsGraph() {
  const [scenarioKey, setScenarioKey] = useState<ScenarioKey>('speed_up_pos');
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const reqRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  const scenario = SCENARIOS[scenarioKey];

  // Physics calculations
  const v = scenario.v0 + scenario.a * time;
  const speed = Math.abs(v);
  const x = scenario.v0 * time + 0.5 * scenario.a * time * time;
  
  // Determine status
  let status = '';
  let statusColor = '';
  if (Math.abs(v) < 0.01 && Math.abs(scenario.a) > 0) {
    status = 'Momentarily Stopped (Reversing)';
    statusColor = 'text-amber-600';
  } else if (Math.abs(scenario.a) < 0.01) {
    status = 'Constant Velocity';
    statusColor = 'text-slate-600';
  } else if (v * scenario.a > 0) {
    status = 'Speeding up';
    statusColor = 'text-green-600';
  } else {
    status = 'Slowing down';
    statusColor = 'text-red-600';
  }

  useEffect(() => {
    if (!isPlaying) return;

    const animate = (now: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = now;
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      setTime((prevTime) => {
        const nextTime = prevTime + dt;
        if (nextTime >= scenario.tMax) {
          setIsPlaying(false);
          return scenario.tMax;
        }
        return nextTime;
      });

      reqRef.current = requestAnimationFrame(animate);
    };

    reqRef.current = requestAnimationFrame(animate);
    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, [isPlaying, scenario.tMax]);

  const handleReset = () => {
    setIsPlaying(false);
    setTime(0);
    lastTimeRef.current = 0;
  };

  const handleScenarioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setScenarioKey(e.target.value as ScenarioKey);
    setIsPlaying(false);
    setTime(0);
    lastTimeRef.current = 0;
  };

  // SVG Graph parameters
  const graphWidth = 400;
  const graphHeight = 250;
  const margin = { top: 20, right: 20, bottom: 40, left: 50 };
  const innerWidth = graphWidth - margin.left - margin.right;
  const innerHeight = graphHeight - margin.top - margin.bottom;
  
  // Scales
  const tScale = innerWidth / scenario.tMax;
  const vMax = 12; // Fixed y-axis range from -12 to 12
  const vScale = innerHeight / (2 * vMax);
  const y0 = margin.top + innerHeight / 2; // y-coordinate for v=0

  // Generate path for v-t graph
  const pathPoints = [];
  for (let t = 0; t <= scenario.tMax; t += 0.1) {
    const vt = scenario.v0 + scenario.a * t;
    const px = margin.left + t * tScale;
    const py = y0 - vt * vScale;
    pathPoints.push(`${px},${py}`);
  }

  // Current point on graph
  const currentPx = margin.left + time * tScale;
  const currentPy = y0 - v * vScale;

  // 1D Motion visualization parameters
  const trackWidth = 600;
  const trackHeight = 120;
  const trackCenterY = trackHeight / 2;
  // Map x position to track. Let's assume max x is around 25.
  // x ranges roughly from -25 to 25.
  const xMax = 30;
  const xScale = trackWidth / (2 * xMax);
  const x0 = trackWidth / 2; // Center of track is x=0
  const carX = x0 + x * xScale;

  return (
    <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-2xl font-semibold text-slate-800 mb-2">Interactive: Velocity-Time Graphs & Kinematics</h2>
        <p className="text-slate-600">
          Analyze velocity-time (v-t) graphs to understand velocity, speed, acceleration, and states of motion (speeding up, slowing down).
        </p>
      </div>

      <div className="p-6 flex flex-col lg:flex-row gap-8">
        {/* Controls and Data */}
        <div className="flex-1 space-y-6">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <label className="block text-sm font-medium text-slate-700 mb-2">Select Scenario</label>
            <select
              value={scenarioKey}
              onChange={handleScenarioChange}
              className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {Object.entries(SCENARIOS).map(([key, scn]) => (
                <option key={key} value={key}>{scn.name}</option>
              ))}
            </select>
            <p className="mt-3 text-sm text-slate-600 italic">
              {scenario.description}
            </p>
          </div>

          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
            <h3 className="font-semibold text-indigo-900 mb-4">Real-time Data</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded-lg border border-indigo-50">
                <div className="text-xs text-slate-500 mb-1">Time (t)</div>
                <div className="text-lg font-mono font-medium text-slate-800">{time.toFixed(2)} s</div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-indigo-50">
                <div className="text-xs text-slate-500 mb-1">Position (x)</div>
                <div className="text-lg font-mono font-medium text-slate-800">{x.toFixed(2)} m</div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-indigo-50">
                <div className="text-xs text-slate-500 mb-1">Velocity (v) - Signed</div>
                <div className="text-lg font-mono font-medium text-blue-600">{v.toFixed(2)} m/s</div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-indigo-50">
                <div className="text-xs text-slate-500 mb-1">Speed (|v|) - Magnitude</div>
                <div className="text-lg font-mono font-medium text-slate-800">{speed.toFixed(2)} m/s</div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-indigo-50">
                <div className="text-xs text-slate-500 mb-1">Acceleration (a)</div>
                <div className="text-lg font-mono font-medium text-red-600">{scenario.a.toFixed(2)} m/s²</div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-indigo-50">
                <div className="text-xs text-slate-500 mb-1">Status</div>
                <div className={`text-sm font-medium ${statusColor}`}>{status}</div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                if (!isPlaying && time >= scenario.tMax) {
                  setTime(0);
                  lastTimeRef.current = 0;
                }
                setIsPlaying(!isPlaying);
              }}
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
        </div>

        {/* Visualizations */}
        <div className="flex-[1.5] flex flex-col gap-6">
          {/* v-t Graph */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col items-center">
            <h3 className="text-sm font-medium text-slate-700 mb-2">Velocity-Time Graph (v-t Graph)</h3>
            <svg width={graphWidth} height={graphHeight} className="bg-slate-50 rounded-lg">
              {/* Grid and Axes */}
              <line x1={margin.left} y1={y0} x2={graphWidth - margin.right} y2={y0} stroke="#94a3b8" strokeWidth="2" /> {/* t-axis */}
              <line x1={margin.left} y1={margin.top} x2={margin.left} y2={graphHeight - margin.bottom} stroke="#94a3b8" strokeWidth="2" /> {/* v-axis */}
              
              {/* Axis Labels */}
              <text x={graphWidth - margin.right + 5} y={y0 + 4} fontSize="12" fill="#64748b">t (s)</text>
              <text x={margin.left} y={margin.top - 5} textAnchor="middle" fontSize="12" fill="#64748b">v (m/s)</text>
              
              {/* Origin */}
              <text x={margin.left - 10} y={y0 + 15} fontSize="10" fill="#64748b">0</text>

              {/* v-t Line */}
              <polyline points={pathPoints.join(' ')} fill="none" stroke="#3b82f6" strokeWidth="3" />

              {/* Current Point Marker */}
              <circle cx={currentPx} cy={currentPy} r="6" fill="#ef4444" />
              <line x1={currentPx} y1={y0} x2={currentPx} y2={currentPy} stroke="#ef4444" strokeDasharray="4 4" strokeWidth="1.5" />
              <line x1={margin.left} y1={currentPy} x2={currentPx} y2={currentPy} stroke="#ef4444" strokeDasharray="4 4" strokeWidth="1.5" />
            </svg>
            <div className="mt-2 text-sm text-slate-600 text-center">
              The slope of the graph represents the <strong>acceleration (a)</strong>.
            </div>
          </div>

          {/* 1D Motion Track */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col items-center overflow-hidden">
            <h3 className="text-sm font-medium text-slate-700 mb-2">1D Motion Simulation</h3>
            <svg width="100%" height={trackHeight} viewBox={`0 0 ${trackWidth} ${trackHeight}`} className="bg-slate-50 rounded-lg">
              {/* Track */}
              <line x1="0" y1={trackCenterY + 20} x2={trackWidth} y2={trackCenterY + 20} stroke="#cbd5e1" strokeWidth="4" />
              
              {/* Origin Marker */}
              <line x1={x0} y1={trackCenterY + 10} x2={x0} y2={trackCenterY + 30} stroke="#94a3b8" strokeWidth="2" />
              <text x={x0} y={trackCenterY + 45} textAnchor="middle" fontSize="12" fill="#64748b">x = 0</text>

              {/* Object (Car/Box) */}
              <g transform={`translate(${carX}, ${trackCenterY})`}>
                <rect x="-15" y="-15" width="30" height="30" rx="4" fill="#4f46e5" />
                
                {/* Velocity Vector (Blue) */}
                {Math.abs(v) > 0.1 && (
                  <g>
                    <line 
                      x1="0" y1="-25" 
                      x2={v * 5} y2="-25" 
                      stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arrow-v)" 
                    />
                    <text x={v * 2.5} y="-32" textAnchor="middle" fontSize="12" fill="#3b82f6" fontWeight="bold">v</text>
                  </g>
                )}

                {/* Acceleration Vector (Red) */}
                {Math.abs(scenario.a) > 0.1 && (
                  <g>
                    <line 
                      x1="0" y1="25" 
                      x2={scenario.a * 15} y2="25" 
                      stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrow-a)" 
                    />
                    <text x={scenario.a * 7.5} y="40" textAnchor="middle" fontSize="12" fill="#ef4444" fontWeight="bold">a</text>
                  </g>
                )}
              </g>

              {/* Arrow Definitions */}
              <defs>
                <marker id="arrow-v" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
                </marker>
                <marker id="arrow-a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
                </marker>
              </defs>
            </svg>
            <div className="mt-3 text-sm text-slate-600 text-center max-w-md">
              The blue vector (<span className="text-blue-600 font-bold">v</span>) is velocity, indicating the direction of motion. 
              The red vector (<span className="text-red-600 font-bold">a</span>) is acceleration. 
              When <span className="text-blue-600 font-bold">v</span> and <span className="text-red-600 font-bold">a</span> are in the same direction, the object speeds up. When in opposite directions, it slows down.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
