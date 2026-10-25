import React, { useState, useEffect, useRef } from 'react';
import { InlineMath } from 'react-katex';
import { Play, Pause, RotateCcw } from 'lucide-react';

export function SimulationResonance() {
  const [activeTab, setActiveTab] = useState<'interference' | 'resonance'>('interference');

  // --- Interference State ---
  const [phaseDiff, setPhaseDiff] = useState(0); // degrees
  const [freq, setFreq] = useState(1); // Hz
  const [isPlayingInt, setIsPlayingInt] = useState(true);
  const [timeInt, setTimeInt] = useState(0);
  const reqRefInt = useRef<number | null>(null);

  // --- Resonance State ---
  const [drivingFreq, setDrivingFreq] = useState(1.5); // Hz
  const [damping, setDamping] = useState(0.2);
  const [isPlayingRes, setIsPlayingRes] = useState(true);
  const [timeRes, setTimeRes] = useState(0);
  const reqRefRes = useRef<number | null>(null);

  const naturalFreq = 1.5; // fixed natural frequency

  // Interference Animation Loop
  useEffect(() => {
    if (!isPlayingInt || activeTab !== 'interference') return;
    let lastTime = performance.now();
    const animate = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;
      setTimeInt((prev) => prev + dt);
      reqRefInt.current = requestAnimationFrame(animate);
    };
    reqRefInt.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(reqRefInt.current!);
  }, [isPlayingInt, activeTab]);

  // Resonance Animation Loop
  useEffect(() => {
    if (!isPlayingRes || activeTab !== 'resonance') return;
    let lastTime = performance.now();
    const animate = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;
      setTimeRes((prev) => prev + dt);
      reqRefRes.current = requestAnimationFrame(animate);
    };
    reqRefRes.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(reqRefRes.current!);
  }, [isPlayingRes, activeTab]);

  // --- Render Interference ---
  const renderInterference = () => {
    const width = 600;
    const height = 250;
    const centerY = height / 2;
    const amplitude = 40;
    const lambda = 200; // pixels per wavelength

    const points1 = [];
    const points2 = [];
    const pointsSum = [];

    const phaseRad = (phaseDiff * Math.PI) / 180;
    const omega = 2 * Math.PI * freq;

    for (let x = 0; x <= width; x += 2) {
      // y = A sin(kx - wt)
      const kx = (2 * Math.PI * x) / lambda;
      const wt = omega * timeInt;

      const y1 = amplitude * Math.sin(kx - wt);
      const y2 = amplitude * Math.sin(kx - wt + phaseRad);
      const ySum = y1 + y2;

      points1.push(`${x},${centerY - y1}`);
      points2.push(`${x},${centerY - y2}`);
      pointsSum.push(`${x},${centerY - ySum}`);
    }

    return (
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
            <h4 className="font-medium text-slate-800 mb-4">Wave Parameters</h4>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700">Phase Difference (<InlineMath math="\Delta\phi" />)</label>
                  <span className="text-sm text-slate-500">{phaseDiff}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="15"
                  value={phaseDiff}
                  onChange={(e) => setPhaseDiff(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>0° (In Phase)</span>
                  <span>180° (Out of Phase)</span>
                  <span>360°</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700">Frequency (<InlineMath math="f" />)</label>
                  <span className="text-sm text-slate-500">{freq.toFixed(1)} Hz</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={freq}
                  onChange={(e) => setFreq(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setIsPlayingInt(!isPlayingInt)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {isPlayingInt ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlayingInt ? 'Pause' : 'Play'}
              </button>
              <button
                onClick={() => {
                  setTimeInt(0);
                  setPhaseDiff(0);
                  setFreq(1);
                }}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>
          </div>
          
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 text-sm text-indigo-800">
            <strong>Observation:</strong> When the phase difference is 0° or 360° (in phase), the waves interfere constructively, creating a wave with double the amplitude. When the phase difference is 180° (out of phase), they interfere destructively, canceling each other out.
          </div>
        </div>

        <div className="flex-[2] flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200 p-4 overflow-hidden">
          <div className="flex gap-6 mb-4 text-sm">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div> Wave 1</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div> Wave 2</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-600"></div> Resultant Wave</div>
          </div>
          <svg width="100%" height="250" viewBox={`0 0 ${width} ${height}`} className="bg-slate-50 rounded-lg">
            {/* Grid lines */}
            <line x1="0" y1={centerY} x2={width} y2={centerY} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 4" />
            
            {/* Waves */}
            <polyline points={points1.join(' ')} fill="none" stroke="#3b82f6" strokeWidth="2" opacity="0.7" />
            <polyline points={points2.join(' ')} fill="none" stroke="#ef4444" strokeWidth="2" opacity="0.7" />
            <polyline points={pointsSum.join(' ')} fill="none" stroke="#9333ea" strokeWidth="3" />
          </svg>
        </div>
      </div>
    );
  };

  // --- Render Resonance ---
  const renderResonance = () => {
    // Physics math
    const w0 = 2 * Math.PI * naturalFreq;
    const w = 2 * Math.PI * drivingFreq;
    const m = 1;
    const F0 = 50; // arbitrary force scale
    const b = damping;

    // A = (F0/m) / sqrt( (w0^2 - w^2)^2 + (b*w/m)^2 )
    const denominator = Math.sqrt(Math.pow(w0 * w0 - w * w, 2) + Math.pow((b * w) / m, 2));
    const amplitude = F0 / m / denominator;
    
    // Phase angle phi = arctan( (b*w/m) / (w0^2 - w^2) )
    const phi = Math.atan2((b * w) / m, w0 * w0 - w * w);

    // Current position of mass
    // x(t) = A * cos(w*t - phi)
    const x = amplitude * Math.cos(w * timeRes - phi);

    // Resonance Curve Data
    const curvePoints = [];
    const curveWidth = 300;
    const curveHeight = 200;
    const maxFreq = 3;
    
    // Find max amplitude for scaling
    let maxAmp = 0;
    for (let f = 0.1; f <= maxFreq; f += 0.05) {
      const wf = 2 * Math.PI * f;
      const den = Math.sqrt(Math.pow(w0 * w0 - wf * wf, 2) + Math.pow((b * wf) / m, 2));
      const a = F0 / m / den;
      if (a > maxAmp) maxAmp = a;
    }

    for (let f = 0; f <= maxFreq; f += 0.05) {
      const wf = 2 * Math.PI * f;
      const den = Math.sqrt(Math.pow(w0 * w0 - wf * wf, 2) + Math.pow((b * wf) / m, 2));
      const a = F0 / m / den;
      
      const px = (f / maxFreq) * curveWidth;
      const py = curveHeight - (a / maxAmp) * (curveHeight - 20); // 20px padding top
      curvePoints.push(`${px},${py}`);
    }

    // Current point on curve
    const currentPx = (drivingFreq / maxFreq) * curveWidth;
    const currentPy = curveHeight - (amplitude / maxAmp) * (curveHeight - 20);

    return (
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
            <h4 className="font-medium text-slate-800 mb-4">Oscillator Parameters</h4>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700">Driving Frequency (<InlineMath math="f" />)</label>
                  <span className="text-sm text-slate-500">{drivingFreq.toFixed(2)} Hz</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="3.0"
                  step="0.05"
                  value={drivingFreq}
                  onChange={(e) => setDrivingFreq(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>0.1 Hz</span>
                  <span className="text-indigo-600 font-medium">Natural: {naturalFreq} Hz</span>
                  <span>3.0 Hz</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700">Damping (<InlineMath math="b" />)</label>
                  <span className="text-sm text-slate-500">{damping.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="2.0"
                  step="0.1"
                  value={damping}
                  onChange={(e) => setDamping(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setIsPlayingRes(!isPlayingRes)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {isPlayingRes ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlayingRes ? 'Pause' : 'Play'}
              </button>
            </div>
          </div>
          
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 text-sm text-indigo-800">
            <strong>Observation:</strong> When the driving frequency (<InlineMath math="f" />) approaches the natural frequency (<InlineMath math="f_0 = 1.5 \text{ Hz}" />), the amplitude of oscillation reaches its maximum. This phenomenon is called <strong>Resonance</strong>. Lower damping results in a sharper, higher resonance peak.
          </div>
        </div>

        <div className="flex-[2] flex flex-col gap-4">
          {/* Mass-Spring Animation */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-center h-48 relative overflow-hidden">
            <div className="absolute top-4 left-4 text-sm font-medium text-slate-500">Physical System</div>
            <svg width="400" height="150" viewBox="0 0 400 150">
              {/* Wall */}
              <rect x="0" y="20" width="20" height="110" fill="#94a3b8" />
              
              {/* Equilibrium line */}
              <line x1="200" y1="20" x2="200" y2="130" stroke="#cbd5e1" strokeDasharray="4 4" />
              <text x="200" y="145" textAnchor="middle" fontSize="12" fill="#64748b">Equilibrium</text>

              {/* Spring */}
              <path 
                d={`M 20 75 L 40 75 ${Array.from({length: 10}).map((_, i) => {
                  const segW = (180 + x * 2 - 60) / 10;
                  const startX = 40 + i * segW;
                  return `L ${startX + segW/2} ${i%2===0 ? 55 : 95} L ${startX + segW} 75`;
                }).join(' ')} L ${200 + x * 2 - 20} 75`}
                fill="none" 
                stroke="#64748b" 
                strokeWidth="2" 
              />

              {/* Mass */}
              <rect x={200 + x * 2 - 20} y="55" width="40" height="40" rx="4" fill="#3b82f6" />
              
              {/* Driving Force Indicator */}
              <g transform={`translate(${200 + x * 2 + 25}, 75)`}>
                <line x1="0" y1="0" x2={Math.cos(w * timeRes) * 30} y2="0" stroke="#ef4444" strokeWidth="3" markerEnd="url(#arrow)" />
              </g>

              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
                </marker>
              </defs>
            </svg>
          </div>

          {/* Resonance Curve */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col items-center justify-center h-56 relative">
            <div className="absolute top-4 left-4 text-sm font-medium text-slate-500">Amplitude vs Driving Frequency</div>
            <svg width={curveWidth + 40} height={curveHeight + 30} className="mt-4">
              <g transform="translate(30, 10)">
                {/* Axes */}
                <line x1="0" y1={curveHeight} x2={curveWidth} y2={curveHeight} stroke="#94a3b8" strokeWidth="2" />
                <line x1="0" y1="0" x2="0" y2={curveHeight} stroke="#94a3b8" strokeWidth="2" />
                
                {/* Labels */}
                <text x={curveWidth / 2} y={curveHeight + 20} textAnchor="middle" fontSize="12" fill="#64748b">Driving Frequency f (Hz)</text>
                <text x="-10" y="-10" textAnchor="middle" fontSize="12" fill="#64748b">A</text>

                {/* Natural Freq Marker */}
                <line x1={(naturalFreq / maxFreq) * curveWidth} y1="0" x2={(naturalFreq / maxFreq) * curveWidth} y2={curveHeight} stroke="#cbd5e1" strokeDasharray="4 4" />
                <text x={(naturalFreq / maxFreq) * curveWidth} y="-5" textAnchor="middle" fontSize="10" fill="#64748b">f₀ = {naturalFreq}</text>

                {/* Curve */}
                <polyline points={curvePoints.join(' ')} fill="none" stroke="#3b82f6" strokeWidth="3" />

                {/* Current Point */}
                <circle cx={currentPx} cy={currentPy} r="6" fill="#ef4444" />
                <line x1={currentPx} y1={currentPy} x2={currentPx} y2={curveHeight} stroke="#ef4444" strokeDasharray="2 2" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-2xl font-semibold text-slate-800 mb-2">Interactive: Wave Interference & Resonance</h2>
        <p className="text-slate-600">Explore how waves combine and how systems respond to external driving forces.</p>
      </div>

      <div className="border-b border-slate-200 bg-slate-50 px-6 flex gap-4">
        <button
          onClick={() => setActiveTab('interference')}
          className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'interference'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Wave Interference
        </button>
        <button
          onClick={() => setActiveTab('resonance')}
          className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'resonance'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Forced Resonance
        </button>
      </div>

      <div className="p-6">
        {activeTab === 'interference' ? renderInterference() : renderResonance()}
      </div>
    </section>
  );
}
