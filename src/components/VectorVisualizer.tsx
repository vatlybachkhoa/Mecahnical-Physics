import React, { useState } from 'react';
import { InlineMath } from 'react-katex';

export function VectorVisualizer() {
  const [activeTab, setActiveTab] = useState<'torque' | 'kinematics'>('torque');

  // --- Kinematics State ---
  const [direction, setDirection] = useState<'ccw' | 'cw'>('ccw');
  const [speedState, setSpeedState] = useState<'speeding' | 'slowing' | 'constant'>('speeding');

  const omegaUp = direction === 'ccw';
  let alphaUp = omegaUp;
  if (speedState === 'slowing') alphaUp = !omegaUp;
  const hasAlpha = speedState !== 'constant';

  // --- Torque State ---
  const [r, setR] = useState(3);
  const [F, setF] = useState(3);
  const [thetaDeg, setThetaDeg] = useState(90);

  const theta = (thetaDeg * Math.PI) / 180;
  const tau = r * F * Math.sin(theta);
  const d = r * Math.abs(Math.sin(theta));

  const scale = 12; // pixels per unit
  const cx = 200;
  const cy = 220;

  const project = (x: number, y: number, z: number) => {
    const angle = Math.PI / 6;
    const px = cx + (x - y) * Math.cos(angle) * scale;
    const py = cy + (x + y) * Math.sin(angle) * scale - z * scale;
    return { x: px, y: py };
  };

  // Points for Torque
  const O = project(0, 0, 0);
  const R = project(r, 0, 0);
  const Fx = F * Math.cos(theta);
  const Fy = F * Math.sin(theta);
  const F_tip = project(r + Fx, Fy, 0);
  const F_orig = project(Fx, Fy, 0);
  const T_tip = project(0, 0, tau);

  const Px = r * Math.pow(Math.sin(theta), 2);
  const Py = -r * Math.cos(theta) * Math.sin(theta);
  const P = project(Px, Py, 0);

  const gridLines = [];
  for (let i = -5; i <= 5; i++) {
    const p1 = project(i, -5, 0);
    const p2 = project(i, 5, 0);
    gridLines.push(<line key={`x${i}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#e2e8f0" strokeWidth="1" />);
    const p3 = project(-5, i, 0);
    const p4 = project(5, i, 0);
    gridLines.push(<line key={`y${i}`} x1={p3.x} y1={p3.y} x2={p4.x} y2={p4.y} stroke="#e2e8f0" strokeWidth="1" />);
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-slate-100 pb-4">
        <h3 className="text-xl font-semibold text-slate-800">Vector Visualizer</h3>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('torque')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'torque' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Torque (Cross Product)
          </button>
          <button 
            onClick={() => setActiveTab('kinematics')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'kinematics' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Angular Kinematics
          </button>
        </div>
      </div>

      {activeTab === 'torque' && (
        <div className="animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Position Vector (<InlineMath math="r" />): {r.toFixed(1)} m
              </label>
              <input type="range" min="1" max="5" step="0.5" value={r} onChange={(e) => setR(Number(e.target.value))} className="w-full accent-blue-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Force Vector (<InlineMath math="F" />): {F.toFixed(1)} N
              </label>
              <input type="range" min="1" max="5" step="0.5" value={F} onChange={(e) => setF(Number(e.target.value))} className="w-full accent-red-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Angle (<InlineMath math="\theta" />): {thetaDeg}°
              </label>
              <input type="range" min="-180" max="180" step="5" value={thetaDeg} onChange={(e) => setThetaDeg(Number(e.target.value))} className="w-full accent-emerald-600" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="w-full bg-slate-50 rounded-lg border border-slate-200 overflow-hidden relative flex justify-center items-center h-80">
              <svg width="400" height="400" viewBox="0 0 400 400" className="max-w-full h-auto">
                <defs>
                  <marker id="arrow-r" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#2563eb" />
                  </marker>
                  <marker id="arrow-f" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#dc2626" />
                  </marker>
                  <marker id="arrow-tau" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#16a34a" />
                  </marker>
                </defs>

                {/* Grid */}
                {gridLines}

                {/* Axes */}
                <line x1={O.x} y1={O.y} x2={project(6, 0, 0).x} y2={project(6, 0, 0).y} stroke="#94a3b8" strokeWidth="2" strokeDasharray="4,4" />
                <line x1={O.x} y1={O.y} x2={project(0, 6, 0).x} y2={project(0, 6, 0).y} stroke="#94a3b8" strokeWidth="2" strokeDasharray="4,4" />
                <line x1={O.x} y1={O.y} x2={project(0, 0, 15).x} y2={project(0, 0, 15).y} stroke="#94a3b8" strokeWidth="2" strokeDasharray="4,4" />
                <line x1={O.x} y1={O.y} x2={project(0, 0, -15).x} y2={project(0, 0, -15).y} stroke="#94a3b8" strokeWidth="2" strokeDasharray="4,4" />

                {/* Parallelogram */}
                <polygon points={`${O.x},${O.y} ${R.x},${R.y} ${F_tip.x},${F_tip.y} ${F_orig.x},${F_orig.y}`} fill="#fef08a" opacity="0.3" stroke="#eab308" strokeWidth="1" strokeDasharray="4,4" />

                {/* Line of action */}
                <line x1={R.x - (F_tip.x - R.x)*2} y1={R.y - (F_tip.y - R.y)*2} x2={R.x + (F_tip.x - R.x)*2} y2={R.y + (F_tip.y - R.y)*2} stroke="#fca5a5" strokeWidth="1" strokeDasharray="4,4" />

                {/* Moment arm */}
                <line x1={O.x} y1={O.y} x2={P.x} y2={P.y} stroke="#9333ea" strokeWidth="2" strokeDasharray="4,4" />
                <text x={(O.x + P.x)/2 - 10} y={(O.y + P.y)/2 - 10} fill="#9333ea" fontSize="14" fontWeight="bold">d</text>

                {/* Vector r */}
                <line x1={O.x} y1={O.y} x2={R.x} y2={R.y} stroke="#2563eb" strokeWidth="3" markerEnd="url(#arrow-r)" />
                <text x={(O.x + R.x)/2 + 10} y={(O.y + R.y)/2 + 15} fill="#2563eb" fontSize="16" fontWeight="bold">r</text>

                {/* Vector F */}
                <line x1={R.x} y1={R.y} x2={F_tip.x} y2={F_tip.y} stroke="#dc2626" strokeWidth="3" markerEnd="url(#arrow-f)" />
                <text x={(R.x + F_tip.x)/2 + 10} y={(R.y + F_tip.y)/2 - 10} fill="#dc2626" fontSize="16" fontWeight="bold">F</text>

                {/* Vector F at origin (dashed) */}
                <line x1={O.x} y1={O.y} x2={F_orig.x} y2={F_orig.y} stroke="#dc2626" strokeWidth="2" strokeDasharray="4,4" markerEnd="url(#arrow-f)" />

                {/* Vector Tau */}
                {Math.abs(tau) > 0.1 && (
                  <>
                    <line x1={O.x} y1={O.y} x2={T_tip.x} y2={T_tip.y} stroke="#16a34a" strokeWidth="4" markerEnd="url(#arrow-tau)" />
                    <text x={T_tip.x + 10} y={T_tip.y} fill="#16a34a" fontSize="18" fontWeight="bold">τ</text>
                  </>
                )}
                
                {/* Origin Dot */}
                <circle cx={O.x} cy={O.y} r="4" fill="#0f172a" />
              </svg>
            </div>
            
            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 flex flex-col justify-center space-y-4">
              <h4 className="font-medium text-slate-800 mb-2">Torque Calculation</h4>
              
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-slate-600">Position (<InlineMath math="r" />)</span>
                <span className="font-semibold text-blue-600">{r.toFixed(2)} m</span>
              </div>
              
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-slate-600">Force (<InlineMath math="F" />)</span>
                <span className="font-semibold text-red-600">{F.toFixed(2)} N</span>
              </div>
              
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-slate-600">Angle (<InlineMath math="\theta" />)</span>
                <span className="font-semibold text-emerald-600">{thetaDeg}°</span>
              </div>

              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-slate-600">Moment Arm (<InlineMath math="d = r |\sin\theta|" />)</span>
                <span className="font-semibold text-purple-600">{d.toFixed(2)} m</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Torque (<InlineMath math="\tau = r F \sin\theta" />)</span>
                <span className="font-semibold text-green-600">{tau.toFixed(2)} N·m</span>
              </div>
              
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-100 text-sm text-green-800">
                <strong>Right-Hand Rule:</strong> Point your fingers along <InlineMath math="\vec{r}" /> (blue), curl them towards <InlineMath math="\vec{F}" /> (red). Your thumb points along <InlineMath math="\vec{\tau}" /> (green). 
                <br/><br/>
                Notice that the magnitude of torque is equal to the area of the yellow parallelogram formed by <InlineMath math="\vec{r}" /> and <InlineMath math="\vec{F}" />.
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'kinematics' && (
        <div className="animate-in fade-in duration-300 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-slate-800 mb-2">1. Rotation Direction</h4>
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={direction === 'ccw'} onChange={() => setDirection('ccw')} className="accent-indigo-600 w-4 h-4" />
                  <span>Counter-Clockwise (CCW)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={direction === 'cw'} onChange={() => setDirection('cw')} className="accent-indigo-600 w-4 h-4" />
                  <span>Clockwise (CW)</span>
                </label>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-slate-800 mb-2">2. Motion State</h4>
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={speedState === 'speeding'} onChange={() => setSpeedState('speeding')} className="accent-indigo-600 w-4 h-4" />
                  <span>Speeding up &rarr; <InlineMath math="\vec{\alpha}" /> is in the same direction as <InlineMath math="\vec{\omega}" /></span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={speedState === 'slowing'} onChange={() => setSpeedState('slowing')} className="accent-indigo-600 w-4 h-4" />
                  <span>Slowing down &rarr; <InlineMath math="\vec{\alpha}" /> is in the opposite direction to <InlineMath math="\vec{\omega}" /></span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={speedState === 'constant'} onChange={() => setSpeedState('constant')} className="accent-indigo-600 w-4 h-4" />
                  <span>Constant speed &rarr; <InlineMath math="\vec{\alpha} = 0" /></span>
                </label>
              </div>
            </div>
            
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 text-sm text-indigo-900">
              <strong>Right-Hand Rule:</strong> Curl the fingers of your right hand in the direction of rotation. Your extended thumb points in the direction of the angular velocity vector <InlineMath math="\vec{\omega}" />.
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg border border-slate-200 flex justify-center items-center p-4">
            <svg width="400" height="300" viewBox="0 0 400 300" className="max-w-full h-auto">
              <defs>
                <marker id="arrow-omega" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#2563eb" />
                </marker>
                <marker id="arrow-alpha" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#dc2626" />
                </marker>
                <marker id="arrow-rot" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#16a34a" />
                </marker>
              </defs>

              {/* Axis */}
              <line x1="200" y1="40" x2="200" y2="260" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="5,5" />
              
              {/* Disk */}
              <ellipse cx="200" cy="150" rx="120" ry="45" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" opacity="0.8" />
              <ellipse cx="200" cy="150" rx="10" ry="3" fill="#94a3b8" />

              {/* Rotation Arrow (Green) */}
              {direction === 'ccw' ? (
                <path d="M 300 150 A 100 35 0 0 1 100 150" fill="none" stroke="#16a34a" strokeWidth="3" markerEnd="url(#arrow-rot)" />
              ) : (
                <path d="M 100 150 A 100 35 0 0 0 300 150" fill="none" stroke="#16a34a" strokeWidth="3" markerEnd="url(#arrow-rot)" />
              )}
              <text x="200" y="205" fill="#16a34a" fontSize="14" fontWeight="bold" textAnchor="middle">Rotation</text>

              {/* Omega Vector (Blue) */}
              {omegaUp ? (
                <>
                  <line x1="200" y1="150" x2="200" y2="60" stroke="#2563eb" strokeWidth="4" markerEnd="url(#arrow-omega)" />
                  <text x="175" y="70" fill="#2563eb" fontSize="20" fontWeight="bold" fontFamily="serif" fontStyle="italic">ω</text>
                  <text x="175" y="60" fill="#2563eb" fontSize="12" fontWeight="bold">&rarr;</text>
                </>
              ) : (
                <>
                  <line x1="200" y1="150" x2="200" y2="240" stroke="#2563eb" strokeWidth="4" markerEnd="url(#arrow-omega)" />
                  <text x="175" y="230" fill="#2563eb" fontSize="20" fontWeight="bold" fontFamily="serif" fontStyle="italic">ω</text>
                  <text x="175" y="220" fill="#2563eb" fontSize="12" fontWeight="bold">&rarr;</text>
                </>
              )}

              {/* Alpha Vector (Red) */}
              {hasAlpha && (
                alphaUp ? (
                  <>
                    <line x1="220" y1="150" x2="220" y2="80" stroke="#dc2626" strokeWidth="4" markerEnd="url(#arrow-alpha)" />
                    <text x="235" y="90" fill="#dc2626" fontSize="20" fontWeight="bold" fontFamily="serif" fontStyle="italic">α</text>
                    <text x="235" y="80" fill="#dc2626" fontSize="12" fontWeight="bold">&rarr;</text>
                  </>
                ) : (
                  <>
                    <line x1="220" y1="150" x2="220" y2="220" stroke="#dc2626" strokeWidth="4" markerEnd="url(#arrow-alpha)" />
                    <text x="235" y="210" fill="#dc2626" fontSize="20" fontWeight="bold" fontFamily="serif" fontStyle="italic">α</text>
                    <text x="235" y="200" fill="#dc2626" fontSize="12" fontWeight="bold">&rarr;</text>
                  </>
                )
              )}
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
