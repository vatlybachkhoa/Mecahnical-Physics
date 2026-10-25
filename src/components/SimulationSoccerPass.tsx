import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Settings2, Info, Eye, EyeOff } from 'lucide-react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

export function SimulationSoccerPass() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  
  // Player State
  const [vMessy, setVMessy] = useState(8.0);
  const [messyAngle, setMessyAngle] = useState(0); // 0 = North
  const [messyStartX, setMessyStartX] = useState(0);
  const [messyStartY, setMessyStartY] = useState(0);

  // Ball State
  const [vBall, setVBall] = useState(12.0);
  const [ballAngle, setBallAngle] = useState(37.0); // East of North
  const [ballStartX, setBallStartX] = useState(0);
  const [ballStartY, setBallStartY] = useState(0);
  
  // Environment
  const [drag, setDrag] = useState(0.1);

  const [showRelative, setShowRelative] = useState(true);
  const [showComponents, setShowComponents] = useState(false);

  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Calculations (Angles in radians, North is -Y in canvas but +Y in physics)
  const mAngleRad = (messyAngle * Math.PI) / 180;
  const bAngleRad = (ballAngle * Math.PI) / 180;
  
  // Ground velocities (Initial)
  const vMg = { x: vMessy * Math.sin(mAngleRad), y: vMessy * Math.cos(mAngleRad) };
  const vBg0 = { x: vBall * Math.sin(bAngleRad), y: vBall * Math.cos(bAngleRad) };
  
  // Instantaneous velocities at time t (with drag)
  const getVelocities = (t: number) => {
    // Player moves at constant velocity
    const vM = { ...vMg };
    // Ball velocity decays: v = v0 * exp(-k*t)
    const decay = Math.exp(-drag * t);
    const vB = { x: vBg0.x * decay, y: vBg0.y * decay };
    
    // Relative velocity: vBM = vB - vM
    const vBM = { x: vB.x - vM.x, y: vB.y - vM.y };
    const vBMMag = Math.sqrt(vBM.x ** 2 + vBM.y ** 2);
    const vBMAngle = (Math.atan2(vBM.x, vBM.y) * 180) / Math.PI;

    return { vM, vB, vBM, vBMMag, vBMAngle };
  };

  const getPositions = (t: number) => {
    // Player: x = x0 + v*t
    const pM = {
      x: messyStartX + vMg.x * t,
      y: messyStartY + vMg.y * t
    };
    // Ball: x = x0 + integral(v0 * exp(-k*t) dt) = x0 + (v0/k) * (1 - exp(-k*t))
    const distFactor = drag === 0 ? t : (1 - Math.exp(-drag * t)) / drag;
    const pB = {
      x: ballStartX + vBg0.x * distFactor,
      y: ballStartY + vBg0.y * distFactor
    };
    return { pM, pB };
  };

  const draw = (t: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const scale = 10;

    // Draw Soccer Field Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = -10; i <= 10; i++) {
      ctx.beginPath();
      ctx.moveTo(0, centerY + i * 50); ctx.lineTo(width, centerY + i * 50);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(centerX + i * 50, 0); ctx.lineTo(centerX + i * 50, height);
      ctx.stroke();
    }

    // Compass
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width - 50, 50); ctx.lineTo(width - 50, 20); // N
    ctx.moveTo(width - 50, 50); ctx.lineTo(width - 20, 50); // E
    ctx.stroke();
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px Inter';
    ctx.fillText('N', width - 55, 15);
    ctx.fillText('E', width - 15, 55);

    const { pM, pB } = getPositions(t);
    const { vM, vB, vBM } = getVelocities(t);

    const canvasPM = { x: centerX + pM.x * scale, y: centerY - pM.y * scale };
    const canvasPB = { x: centerX + pB.x * scale, y: centerY - pB.y * scale };

    // Draw Messy
    ctx.fillStyle = '#6366f1';
    ctx.beginPath();
    ctx.arc(canvasPM.x, canvasPM.y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.font = 'bold 10px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('M', canvasPM.x, canvasPM.y + 4);

    // Draw Ball
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(canvasPB.x, canvasPB.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw Vectors
    const vectorScale = 5;

    // vMg (Messy rel Ground)
    drawVector(ctx, canvasPM, vM.x * vectorScale, -vM.y * vectorScale, '#6366f1', 'v_Mg', 1);

    // vBg (Ball rel Ground)
    drawVector(ctx, canvasPB, vB.x * vectorScale, -vB.y * vectorScale, '#10b981', 'v_Bg', 1);

    // vBM (Ball rel Messy)
    if (showRelative) {
      drawVector(ctx, canvasPM, vBM.x * vectorScale, -vBM.y * vectorScale, '#f59e0b', 'v_BM', 2);
    }

    if (showComponents) {
      drawVector(ctx, canvasPM, vBM.x * vectorScale, 0, '#fbbf24', 'v_BM,x', 1);
      drawVector(ctx, {x: canvasPM.x + vBM.x * vectorScale, y: canvasPM.y}, 0, -vBM.y * vectorScale, '#d97706', 'v_BM,y', 1);
    }
  };

  const drawVector = (ctx: CanvasRenderingContext2D, start: {x: number, y: number}, dx: number, dy: number, color: string, label: string, width: number) => {
    const end = { x: start.x + dx, y: start.y + dy };
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    const angle = Math.atan2(dy, dx);
    const headlen = 8;
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(end.x - headlen * Math.cos(angle - Math.PI / 6), end.y - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(end.x - headlen * Math.cos(angle + Math.PI / 6), end.y - headlen * Math.sin(angle + Math.PI / 6));
    ctx.fill();

    ctx.font = '10px JetBrains Mono';
    ctx.fillText(label, end.x + 5 * Math.cos(angle), end.y + 5 * Math.sin(angle));
  };

  useEffect(() => {
    const animate = (t: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = t;
      const dt = (t - lastTimeRef.current) / 1000;
      lastTimeRef.current = t;

      if (isRunning) {
        setTime(prev => {
          const next = prev + dt;
          if (next > 10) return 0; // Loop
          return next;
        });
      }
      draw(time);
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [isRunning, time, vMessy, messyAngle, messyStartX, messyStartY, vBall, ballAngle, ballStartX, ballStartY, drag, showRelative, showComponents]);

  const reset = () => {
    setTime(0);
    setIsRunning(false);
    lastTimeRef.current = 0;
  };

  const applyPreset = (type: string) => {
    reset();
    if (type === 'world-cup') {
      setVMessy(8.0); setMessyAngle(0); setMessyStartX(0); setMessyStartY(0);
      setVBall(12.0); setBallAngle(37.0); setBallStartX(0); setBallStartY(0);
      setDrag(0);
    } else if (type === 'parallel') {
      setVMessy(5.0); setMessyAngle(0); setMessyStartX(-10); setMessyStartY(0);
      setVBall(10.0); setBallAngle(0); setBallStartX(10); setBallStartY(0);
      setDrag(0.05);
    } else if (type === 'intercept') {
      setVMessy(6.0); setMessyAngle(90); setMessyStartX(-30); setMessyStartY(0);
      setVBall(15.0); setBallAngle(0); setBallStartX(0); setBallStartY(-30);
      setDrag(0.1);
    }
  };

  const currentData = getVelocities(time);
  const currentPos = getPositions(time);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 rounded-2xl p-6 shadow-2xl overflow-hidden relative border border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              Relative Velocity: Soccer Pass
            </h3>
            <p className="text-slate-400 text-sm">Customizable Player vs. Ball Dynamics</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => applyPreset('world-cup')} className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 text-xs font-bold rounded-lg border border-indigo-500/30 transition-all">World Cup</button>
            <button onClick={() => applyPreset('parallel')} className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 text-xs font-bold rounded-lg border border-emerald-500/30 transition-all">Parallel</button>
            <button onClick={() => applyPreset('intercept')} className="px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 text-xs font-bold rounded-lg border border-amber-500/30 transition-all">Intercept</button>
            <div className="w-px h-8 bg-slate-700 mx-1 hidden md:block" />
            <button 
              onClick={() => setIsRunning(!isRunning)}
              className={`p-2.5 rounded-full transition-all ${isRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'} text-white shadow-lg`}
            >
              {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button 
              onClick={reset}
              className="p-2.5 rounded-full bg-slate-700 hover:bg-slate-600 text-white transition-all shadow-lg"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>

        <canvas 
          ref={canvasRef} 
          width={800} 
          height={500} 
          className="w-full bg-emerald-900/20 rounded-xl border border-slate-800"
        />

        {/* Data Overlay */}
        <div className="absolute top-24 left-10 right-10 grid grid-cols-2 md:grid-cols-4 gap-3 pointer-events-none z-10">
          <div className="bg-slate-900/90 backdrop-blur-md p-2 rounded-lg border border-slate-700 shadow-lg">
            <p className="text-slate-500 text-[9px] uppercase tracking-wider font-bold">Player Pos (x, y)</p>
            <p className="text-white font-mono text-xs">({currentPos.pM.x.toFixed(1)}, {currentPos.pM.y.toFixed(1)})</p>
          </div>
          <div className="bg-slate-900/90 backdrop-blur-md p-2 rounded-lg border border-slate-700 shadow-lg">
            <p className="text-slate-500 text-[9px] uppercase tracking-wider font-bold">Ball Pos (x, y)</p>
            <p className="text-emerald-400 font-mono text-xs">({currentPos.pB.x.toFixed(1)}, {currentPos.pB.y.toFixed(1)})</p>
          </div>
          <div className="bg-slate-900/90 backdrop-blur-md p-2 rounded-lg border border-slate-700 shadow-lg">
            <p className="text-slate-500 text-[9px] uppercase tracking-wider font-bold">Relative Speed</p>
            <p className="text-amber-400 font-mono text-xs">{currentData.vBMMag.toFixed(2)} m/s</p>
          </div>
          <div className="bg-slate-900/90 backdrop-blur-md p-2 rounded-lg border border-slate-700 shadow-lg">
            <p className="text-slate-500 text-[9px] uppercase tracking-wider font-bold">Relative Angle</p>
            <p className="text-amber-400 font-mono text-xs">{currentData.vBMAngle.toFixed(1)}° E of N</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Settings2 className="w-5 h-5 text-indigo-500" />
              <h4 className="font-semibold text-slate-800">Player Settings</h4>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400">Start X</label>
                  <input type="number" value={messyStartX} onChange={e => setMessyStartX(Number(e.target.value))} className="w-full p-1 border rounded text-xs" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400">Start Y</label>
                  <input type="number" value={messyStartY} onChange={e => setMessyStartY(Number(e.target.value))} className="w-full p-1 border rounded text-xs" />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-xs font-medium text-slate-600">Speed (m/s)</label>
                  <span className="text-xs font-mono text-indigo-600 font-bold">{vMessy.toFixed(1)}</span>
                </div>
                <input type="range" min="0" max="15" step="0.5" value={vMessy} onChange={e => setVMessy(Number(e.target.value))} className="w-full accent-indigo-600" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-xs font-medium text-slate-600">Direction (° E of N)</label>
                  <span className="text-xs font-mono text-indigo-600 font-bold">{messyAngle}°</span>
                </div>
                <input type="range" min="0" max="360" step="5" value={messyAngle} onChange={e => setMessyAngle(Number(e.target.value))} className="w-full accent-indigo-600" />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <Settings2 className="w-5 h-5 text-emerald-500" />
              <h4 className="font-semibold text-slate-800">Ball Settings</h4>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400">Start X</label>
                  <input type="number" value={ballStartX} onChange={e => setBallStartX(Number(e.target.value))} className="w-full p-1 border rounded text-xs" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400">Start Y</label>
                  <input type="number" value={ballStartY} onChange={e => setBallStartY(Number(e.target.value))} className="w-full p-1 border rounded text-xs" />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-xs font-medium text-slate-600">Speed (m/s)</label>
                  <span className="text-xs font-mono text-emerald-600 font-bold">{vBall.toFixed(1)}</span>
                </div>
                <input type="range" min="0" max="25" step="0.5" value={vBall} onChange={e => setVBall(Number(e.target.value))} className="w-full accent-emerald-600" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-xs font-medium text-slate-600">Direction (° E of N)</label>
                  <span className="text-xs font-mono text-emerald-600 font-bold">{ballAngle}°</span>
                </div>
                <input type="range" min="0" max="360" step="5" value={ballAngle} onChange={e => setBallAngle(Number(e.target.value))} className="w-full accent-emerald-600" />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <Settings2 className="w-5 h-5 text-rose-500" />
              <h4 className="font-semibold text-slate-800">Environment</h4>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs font-medium text-slate-600">Drag Coefficient (k)</label>
                <span className="text-xs font-mono text-rose-600 font-bold">{drag.toFixed(2)}</span>
              </div>
              <input type="range" min="0" max="0.5" step="0.01" value={drag} onChange={e => setDrag(Number(e.target.value))} className="w-full accent-rose-600" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-indigo-500" />
            <h4 className="font-semibold text-slate-800">Physics Analysis</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-600">
            <div className="space-y-4">
              <div>
                <p className="font-bold text-slate-800 mb-1">Relative Velocity Vector</p>
                <BlockMath math="\vec{v}_{BM} = \vec{v}_{Bg}(t) - \vec{v}_{Mg}" />
                <p>Where the ball velocity decays over time due to drag:</p>
                <BlockMath math="v_{Bg}(t) = v_{Bg,0} e^{-kt}" />
              </div>
              
              <div>
                <p className="font-bold text-slate-800 mb-1">Position Integration</p>
                <p>Player (Constant Velocity):</p>
                <BlockMath math="\vec{r}_M(t) = \vec{r}_{M,0} + \vec{v}_{Mg} t" />
                <p>Ball (Decelerating):</p>
                <BlockMath math="\vec{r}_B(t) = \vec{r}_{B,0} + \vec{v}_{Bg,0} \int_0^t e^{-k\tau} d\tau" />
                <BlockMath math="\vec{r}_B(t) = \vec{r}_{B,0} + \frac{\vec{v}_{Bg,0}}{k} (1 - e^{-kt})" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <p className="text-xs font-bold text-indigo-800 uppercase mb-2">Simulation Controls</p>
                <ul className="list-disc list-inside space-y-1 text-xs text-indigo-700">
                  <li>Adjust <strong>Start X/Y</strong> to change initial positions.</li>
                  <li>Change <strong>Direction</strong> to rotate running/passing paths.</li>
                  <li>Increase <strong>Drag</strong> to see the ball slow down.</li>
                  <li>Toggle <strong>Relative Vector</strong> to see the ball from the player's perspective.</li>
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-2">
                <label className="flex items-center gap-2 text-xs cursor-pointer hover:bg-slate-50 p-1 rounded">
                  <input type="checkbox" checked={showRelative} onChange={() => setShowRelative(!showRelative)} className="accent-amber-500" />
                  <span>Show Relative Velocity Vector (<InlineMath math="v_{BM}" />)</span>
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer hover:bg-slate-50 p-1 rounded">
                  <input type="checkbox" checked={showComponents} onChange={() => setShowComponents(!showComponents)} className="accent-amber-600" />
                  <span>Show Velocity Components</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
