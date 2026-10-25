import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Settings2, Info, Eye, EyeOff } from 'lucide-react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

export function SimulationTwoBlocksPulley() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  
  // Parameters
  const [weightA, setWeightA] = useState(1.40); // N
  const [weightB, setWeightB] = useState(4.20); // N
  const [pulleyMass, setPulleyMass] = useState(0); // kg
  const [muS, setMuS] = useState(0.40);
  const [muK, setMuK] = useState(0.30);
  const [appliedForce, setAppliedForce] = useState(0); // N
  const [showVectors, setShowVectors] = useState(true);
  const [isConstantSpeedMode, setIsConstantSpeedMode] = useState(false);

  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  
  // Physics constants
  const g = 9.8;
  const massA = weightA / g;
  const massB = weightB / g;

  // Thresholds
  const staticThreshold = muS * (3 * weightA + weightB);
  const equilibriumForce = muK * (3 * weightA + weightB);

  const [velocity, setVelocity] = useState(0);
  const [position, setPosition] = useState(0);
  const [isStatic, setIsStatic] = useState(true);

  // Derived physics values
  const kineticFrictionTotal = muK * (3 * weightA + weightB);
  const netForce = isStatic 
    ? 0 
    : appliedForce - kineticFrictionTotal;
  
  const acceleration = isStatic ? 0 : netForce / (massA + massB + 0.5 * pulleyMass);

  useEffect(() => {
    if (isConstantSpeedMode) {
      setAppliedForce(Number(equilibriumForce.toFixed(2)));
      // If we are in constant speed mode and running, we should not be static
      if (isRunning) setIsStatic(false);
    }
  }, [weightA, weightB, muK, isConstantSpeedMode, equilibriumForce, isRunning]);

  // Logic for static to kinetic transition
  useEffect(() => {
    if (isStatic) {
      if (appliedForce > staticThreshold + 0.001) {
        setIsStatic(false);
        setIsRunning(true); // Auto-start when threshold is exceeded
      }
    } else {
      // If moving, check if it should stop
      // We only go back to static if velocity is near zero AND force is below threshold
      if (Math.abs(velocity) < 0.001 && appliedForce <= staticThreshold) {
        setIsStatic(true);
        setVelocity(0);
        setIsRunning(false);
      }
    }
  }, [appliedForce, staticThreshold, velocity, isStatic]);

  // Friction distribution for vectors
  const frictionAB = isStatic 
    ? (appliedForce * weightA) / (3 * weightA + weightB) 
    : muK * weightA;
  const frictionBg = isStatic 
    ? (appliedForce * (weightA + weightB)) / (3 * weightA + weightB) 
    : muK * (weightA + weightB);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    const scale = 50; // pixels per meter
    const centerX = width / 2;
    const centerY = height / 2;

    // Table
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(50, centerY + 40, width - 100, 10);
    
    // Pulley
    const pulleyX = width - 100;
    const pulleyY = centerY;
    const pulleyRadius = 20 + (pulleyMass > 0 ? Math.sqrt(pulleyMass) * 5 : 0);
    ctx.beginPath();
    ctx.arc(pulleyX, pulleyY, pulleyRadius, 0, Math.PI * 2);
    ctx.fillStyle = pulleyMass > 0 ? '#94a3b8' : '#cbd5e1';
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Pulley Spokes if mass > 0
    if (pulleyMass > 0) {
      ctx.save();
      ctx.translate(pulleyX, pulleyY);
      ctx.rotate((position * scale) / pulleyRadius); // Rotate based on arc length s = R * theta
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(pulleyRadius, 0);
        ctx.stroke();
        ctx.rotate(Math.PI / 2);
      }
      ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(pulleyX, pulleyY, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();

    // Blocks
    const blockBWidth = 100;
    const blockBHeight = 40;
    const blockAWidth = 60;
    const blockAHeight = 30;

    // Position offset
    const xOffset = position * scale;
    
    // Block B (moving left)
    const bX = centerX - xOffset - blockBWidth / 2;
    const bY = centerY + 40 - blockBHeight;
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(bX, bY, blockBWidth, blockBHeight);
    ctx.strokeStyle = '#d97706';
    ctx.strokeRect(bX, bY, blockBWidth, blockBHeight);
    ctx.fillStyle = '#92400e';
    ctx.font = 'bold 14px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('B', bX + blockBWidth / 2, bY + blockBHeight / 2 + 5);

    // Block A (moving right)
    const aX = centerX + xOffset - blockAWidth / 2;
    const aY = bY - blockAHeight;
    ctx.fillStyle = '#f87171';
    ctx.fillRect(aX, aY, blockAWidth, blockAHeight);
    ctx.strokeStyle = '#b91c1c';
    ctx.strokeRect(aX, aY, blockAWidth, blockAHeight);
    ctx.fillStyle = '#7f1d1d';
    ctx.fillText('A', aX + blockAWidth / 2, aY + blockAHeight / 2 + 5);

    // Cord
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    // From A to pulley top
    ctx.moveTo(aX + blockAWidth, aY + blockAHeight / 2);
    ctx.lineTo(pulleyX, pulleyY - pulleyRadius);
    // Around pulley
    ctx.arc(pulleyX, pulleyY, pulleyRadius, -Math.PI / 2, Math.PI / 2);
    // From pulley bottom to B
    ctx.lineTo(bX + blockBWidth, bY + blockBHeight / 2);
    ctx.stroke();

    // Vectors
    if (showVectors) {
      const vScale = 30;
      // Force F on B
      drawVector(ctx, bX, bY + blockBHeight / 2, -appliedForce * vScale, 0, '#ef4444', 'F');
      
      // Friction f_Bg on B (to the right)
      drawVector(ctx, bX + blockBWidth / 2, bY + blockBHeight, frictionBg * vScale, 0, '#10b981', 'f_Bg');
      
      // Friction f_BA on B (to the right)
      drawVector(ctx, bX + blockBWidth / 2, bY, frictionAB * vScale, 0, '#10b981', 'f_BA');

      // Tension T on B (to the right)
      const tension = isStatic ? frictionAB : (massA * acceleration + (muK * weightA));
      drawVector(ctx, bX + blockBWidth, bY + blockBHeight / 2, tension * vScale, 0, '#3b82f6', 'T');

      // Tension T on A (to the right)
      const tensionA = isStatic ? frictionAB : (massA * acceleration + (muK * weightA));
      const tensionB = isStatic ? frictionAB : (massB * acceleration + (muK * (weightA + weightB)) - appliedForce);
      // Wait, the tension on B should be calculated from B's equation:
      // F - T_B - f_BA - f_Bg = m_B * a  => T_B = F - f_BA - f_Bg - m_B * a
      // But my netForce is appliedForce - kineticFrictionTotal
      // Let's stick to the consistent derivation:
      // T_A = m_A * a + f_AB
      // T_B = T_A + 0.5 * M * a
      
      const tA = isStatic ? frictionAB : (massA * acceleration + (muK * weightA));
      const tB = isStatic ? frictionAB : (tA + 0.5 * pulleyMass * acceleration);

      drawVector(ctx, bX + blockBWidth, bY + blockBHeight / 2, tB * vScale, 0, '#3b82f6', 'T_B');

      // Tension T on A (to the right)
      drawVector(ctx, aX + blockAWidth, aY + blockAHeight / 2, tA * vScale, 0, '#3b82f6', 'T_A');

      // Friction f_AB on A (to the left)
      drawVector(ctx, aX + blockAWidth / 2, aY + blockAHeight, -frictionAB * vScale, 0, '#10b981', 'f_AB');
    }
  };

  const drawVector = (ctx: CanvasRenderingContext2D, x: number, y: number, dx: number, dy: number, color: string, label: string) => {
    if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) return;
    const headlen = 10;
    const angle = Math.atan2(dy, dx);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + dx, y + dy);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x + dx, y + dy);
    ctx.lineTo(x + dx - headlen * Math.cos(angle - Math.PI / 6), y + dy - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x + dx - headlen * Math.cos(angle + Math.PI / 6), y + dy - headlen * Math.sin(angle + Math.PI / 6));
    ctx.fillStyle = color;
    ctx.fill();

    ctx.fillStyle = color;
    ctx.font = '12px Inter';
    ctx.fillText(label, x + dx + 5 * Math.cos(angle), y + dy + 5 * Math.sin(angle));
  };

  useEffect(() => {
    const animate = (t: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = t;
      const dt = Math.min((t - lastTimeRef.current) / 1000, 0.1); // Cap dt to avoid jumps
      lastTimeRef.current = t;

      if (isRunning) {
        if (isConstantSpeedMode) {
          const v = 1.0; 
          setPosition(prev => {
            const next = prev + v * dt;
            if (next > 3) {
              setIsRunning(false);
              return 3;
            }
            return next;
          });
          setVelocity(v);
        } else {
          setVelocity(prevV => {
            const nextV = isStatic ? 0 : prevV + acceleration * dt;
            setPosition(prevP => {
              const nextP = prevP + nextV * dt;
              if (nextP > 3 || nextP < -3) {
                setIsRunning(false);
                return nextP > 3 ? 3 : -3;
              }
              return nextP;
            });
            return nextV;
          });
        }
      }
      draw();
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [isRunning, position, velocity, acceleration, isConstantSpeedMode, weightA, weightB, muK, appliedForce, showVectors, isStatic, pulleyMass]);

  const reset = () => {
    setTime(0);
    setPosition(0);
    setVelocity(0);
    setIsRunning(false);
    setIsStatic(true);
    lastTimeRef.current = 0;
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 rounded-2xl p-6 shadow-2xl overflow-hidden relative border border-slate-800">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              Two Blocks & Pulley System
            </h3>
            <p className="text-slate-400 text-sm">Newton's Laws with Friction and Tension</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setIsRunning(!isRunning)}
              className={`p-3 rounded-full transition-all ${isRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'} text-white shadow-lg`}
            >
              {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
            <button 
              onClick={reset}
              className="p-3 rounded-full bg-slate-700 hover:bg-slate-600 text-white transition-all shadow-lg"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="relative">
          <canvas 
            ref={canvasRef} 
            width={800} 
            height={400} 
            className="w-full bg-slate-950 rounded-xl border border-slate-800"
          />
          
          {/* Data Overlay */}
          <div className="absolute top-4 left-4 grid grid-cols-2 md:grid-cols-5 gap-3 pointer-events-none">
            <div className={`bg-slate-900/90 backdrop-blur-md p-2 rounded-lg border shadow-lg transition-colors duration-300 ${isStatic ? 'border-amber-500/50' : 'border-emerald-500/50'}`}>
              <p className="text-slate-500 text-[9px] uppercase tracking-wider font-bold">State</p>
              <p className={`font-mono text-xs font-bold ${isStatic ? 'text-amber-400' : 'text-emerald-400'}`}>
                {isStatic ? 'STATIC' : 'MOVING'}
              </p>
            </div>
            <div className="bg-slate-900/90 backdrop-blur-md p-2 rounded-lg border border-slate-700 shadow-lg">
              <p className="text-slate-500 text-[9px] uppercase tracking-wider font-bold">Acceleration</p>
              <p className="text-white font-mono text-xs">{acceleration.toFixed(2)} m/s²</p>
            </div>
            <div className="bg-slate-900/90 backdrop-blur-md p-2 rounded-lg border border-slate-700 shadow-lg">
              <p className="text-slate-500 text-[9px] uppercase tracking-wider font-bold">Velocity</p>
              <p className="text-white font-mono text-xs">{velocity.toFixed(2)} m/s</p>
            </div>
            <div className="bg-slate-900/90 backdrop-blur-md p-2 rounded-lg border border-slate-700 shadow-lg">
              <p className="text-slate-500 text-[9px] uppercase tracking-wider font-bold">Net Force</p>
              <p className="text-emerald-400 font-mono text-xs">{netForce.toFixed(2)} N</p>
            </div>
            <div className="bg-slate-900/90 backdrop-blur-md p-2 rounded-lg border border-slate-700 shadow-lg">
              <p className="text-slate-500 text-[9px] uppercase tracking-wider font-bold">Threshold</p>
              <p className="text-rose-400 font-mono text-xs">{staticThreshold.toFixed(2)} N</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Settings2 className="w-5 h-5 text-indigo-500" />
            <h4 className="font-semibold text-slate-800">Parameters</h4>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs font-medium text-slate-600">Weight A (N)</label>
                <span className="text-xs font-mono text-indigo-600 font-bold">{weightA.toFixed(2)}</span>
              </div>
              <input 
                type="range" min="0.5" max="5" step="0.1" value={weightA}
                onChange={(e) => setWeightA(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs font-medium text-slate-600">Weight B (N)</label>
                <span className="text-xs font-mono text-indigo-600 font-bold">{weightB.toFixed(2)}</span>
              </div>
              <input 
                type="range" min="1" max="10" step="0.1" value={weightB}
                onChange={(e) => setWeightB(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs font-medium text-slate-600">Pulley Mass (kg)</label>
                <span className="text-xs font-mono text-indigo-600 font-bold">{pulleyMass.toFixed(2)}</span>
              </div>
              <input 
                type="range" min="0" max="2" step="0.05" value={pulleyMass}
                onChange={(e) => setPulleyMass(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs font-medium text-slate-600">Static Friction (μₛ)</label>
                <span className="text-xs font-mono text-emerald-600 font-bold">{muS.toFixed(2)}</span>
              </div>
              <input 
                type="range" min="0.1" max="1" step="0.01" value={muS}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setMuS(val);
                  if (muK > val) setMuK(val);
                }}
                className="w-full accent-emerald-600"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs font-medium text-slate-600">Kinetic Friction (μₖ)</label>
                <span className="text-xs font-mono text-emerald-600 font-bold">{muK.toFixed(2)}</span>
              </div>
              <input 
                type="range" min="0" max="1" step="0.01" value={muK}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val <= muS) setMuK(val);
                }}
                className="w-full accent-emerald-600"
              />
            </div>
            
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <label className="text-xs font-bold text-slate-700 uppercase">Constant Speed Mode</label>
                <button 
                  onClick={() => setIsConstantSpeedMode(!isConstantSpeedMode)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${isConstantSpeedMode ? 'bg-emerald-500' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isConstantSpeedMode ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
              
              {!isConstantSpeedMode && (
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs font-medium text-slate-600">Applied Force F (N)</label>
                    <span className="text-xs font-mono text-rose-600 font-bold">{appliedForce.toFixed(2)}</span>
                  </div>
                  <input 
                    type="range" min="0" max="15" step="0.1" value={appliedForce}
                    onChange={(e) => setAppliedForce(Number(e.target.value))}
                    className="w-full accent-rose-600"
                  />
                </div>
              )}
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <label className="flex items-center gap-2 text-xs cursor-pointer hover:bg-slate-50 p-1 rounded">
                <input type="checkbox" checked={showVectors} onChange={() => setShowVectors(!showVectors)} className="accent-indigo-600" />
                <span>Show Force Vectors</span>
              </label>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-indigo-500" />
            <h4 className="font-semibold text-slate-800">Physics Analysis</h4>
          </div>
          
          <div className="prose prose-slate max-w-none text-sm text-slate-600 space-y-4">
            <p>
              This system models the transition from <strong>Static Friction</strong> to <strong>Kinetic Friction</strong>.
            </p>
            
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
              <h5 className="font-bold text-amber-900 mb-2">Static Friction Threshold</h5>
              <p>The system will not move until the applied force <InlineMath math="F" /> exceeds the maximum static friction:</p>
              <BlockMath math="F_{static,max} = \mu_s (3W_A + W_B)" />
              <p className="text-xs mt-2">
                This is derived from the fact that at the threshold, tension <InlineMath math="T = \mu_s W_A" /> and the total opposing friction on Block B is <InlineMath math="f_{BA} + f_{Bg} = \mu_s W_A + \mu_s(W_A + W_B)" />.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <h5 className="font-bold text-slate-800 mb-2">Forces on Block A</h5>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Tension <InlineMath math="T" /> to the right.</li>
                  <li>Friction <InlineMath math="f_{AB} = \mu_k W_A" /> to the left.</li>
                  <li>At constant speed: <InlineMath math="T = \mu_k W_A" /></li>
                </ul>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <h5 className="font-bold text-slate-800 mb-2">Forces on Block B</h5>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Applied force <InlineMath math="F" /> to the left.</li>
                  <li>Tension <InlineMath math="T" /> to the right.</li>
                  <li>Friction from A: <InlineMath math="f_{BA} = \mu_k W_A" /> to the right.</li>
                  <li>Friction from table: <InlineMath math="f_{Bg} = \mu_k (W_A + W_B)" /> to the right.</li>
                </ul>
              </div>
            </div>

            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
              <h5 className="font-bold text-indigo-900 mb-2">Equilibrium & Acceleration</h5>
              <p>Summing forces on the entire system, including the pulley's rotational inertia <InlineMath math="I = \frac{1}{2} M R^2" />:</p>
              <BlockMath math="F + W_B - f_{friction,total} = (m_A + m_B + \frac{1}{2} M) a" />
              <p className="mt-2">Where <InlineMath math="M" /> is the mass of the pulley. The effective mass increases by <InlineMath math="M/2" />.</p>
              <p className="mt-2 text-indigo-800 font-medium">
                Tensions are different when <InlineMath math="M > 0" />:
              </p>
              <BlockMath math="T_B - T_A = \frac{1}{2} M a" />
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <h5 className="font-bold text-slate-800 mb-2 uppercase text-xs tracking-wider">How to use this simulation</h5>
              <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
                <li><strong>Static Phase:</strong> Increase <em>Applied Force</em> gradually. Notice the friction vectors grow to balance it.</li>
                <li><strong>Threshold:</strong> Once <em>Applied Force</em> exceeds the <em>Threshold</em>, the system starts moving.</li>
                <li><strong>Kinetic Phase:</strong> Once moving, friction drops to the kinetic level ($\mu_k$).</li>
                <li><strong>Constant Speed:</strong> Toggle <em>Constant Speed Mode</em> to see the force required to maintain motion without acceleration.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
