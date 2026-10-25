import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { InlineMath } from 'react-katex';

export function SimulationCollision() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Parameters
  const [m1, setM1] = useState(1);
  const [m2, setM2] = useState(1);
  const [v1Init, setV1Init] = useState(5);
  const [v2Init, setV2Init] = useState(-3);
  const [collisionType, setCollisionType] = useState<'elastic' | 'inelastic'>('elastic');

  // Physics state
  const stateRef = useRef({
    x1: 100,
    x2: 600,
    v1: 5,
    v2: -3,
    hasCollided: false,
  });

  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const draw = (ctx: CanvasRenderingContext2D, width: number, height: number, state: any) => {
    ctx.clearRect(0, 0, width, height);

    // Draw surface
    const surfaceY = height / 2 + 30;
    ctx.beginPath();
    ctx.moveTo(0, surfaceY);
    ctx.lineTo(width, surfaceY);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Block sizes based on mass (for visual effect, min 30, max 80)
    const size1 = Math.min(Math.max(30 + m1 * 10, 30), 80);
    const size2 = Math.min(Math.max(30 + m2 * 10, 30), 80);

    const y1 = surfaceY - size1;
    const y2 = surfaceY - size2;

    // Draw Block 1 (Blue)
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(state.x1, y1, size1, size1);
    ctx.strokeStyle = '#1d4ed8';
    ctx.lineWidth = 2;
    ctx.strokeRect(state.x1, y1, size1, size1);
    ctx.fillStyle = 'white';
    ctx.font = '14px Inter, sans-serif';
    ctx.fillText(`m1`, state.x1 + size1/2 - 10, y1 + size1/2 + 5);

    // Draw Block 2 (Red)
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(state.x2, y2, size2, size2);
    ctx.strokeStyle = '#b91c1c';
    ctx.lineWidth = 2;
    ctx.strokeRect(state.x2, y2, size2, size2);
    ctx.fillStyle = 'white';
    ctx.fillText(`m2`, state.x2 + size2/2 - 10, y2 + size2/2 + 5);

    // Draw Velocity Vectors
    const drawVector = (x: number, y: number, v: number, color: string) => {
      if (Math.abs(v) < 0.1) return;
      const scale = 10; // pixels per m/s
      const length = v * scale;
      
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + length, y);
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Arrow head
      const dir = Math.sign(v);
      ctx.beginPath();
      ctx.moveTo(x + length, y);
      ctx.lineTo(x + length - dir * 10, y - 5);
      ctx.lineTo(x + length - dir * 10, y + 5);
      ctx.fillStyle = color;
      ctx.fill();
    };

    drawVector(state.x1 + size1/2, y1 - 15, state.v1, '#2563eb');
    drawVector(state.x2 + size2/2, y2 - 15, state.v2, '#dc2626');

    // Info text
    ctx.fillStyle = '#1e293b';
    ctx.font = '14px Inter, sans-serif';
    ctx.fillText(`v1: ${state.v1.toFixed(2)} m/s`, 20, 30);
    ctx.fillText(`v2: ${state.v2.toFixed(2)} m/s`, 20, 50);
    
    const pTotal = m1 * state.v1 + m2 * state.v2;
    const kTotal = 0.5 * m1 * state.v1 * state.v1 + 0.5 * m2 * state.v2 * state.v2;
    
    ctx.fillText(`Total Momentum (p): ${pTotal.toFixed(2)} kg·m/s`, width - 250, 30);
    ctx.fillText(`Total Kinetic Energy (K): ${kTotal.toFixed(2)} J`, width - 250, 50);
  };

  useEffect(() => {
    stateRef.current = {
      x1: 100,
      x2: 600,
      v1: v1Init,
      v2: v2Init,
      hasCollided: false,
    };
    setIsPlaying(false);
    
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) draw(ctx, canvas.width, canvas.height, stateRef.current);
    }
  }, [m1, m2, v1Init, v2Init, collisionType]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = (currentTime: number) => {
      if (!isPlaying) {
        lastTimeRef.current = currentTime;
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const dt = Math.min((currentTime - lastTimeRef.current) / 1000, 0.1); // cap dt
      lastTimeRef.current = currentTime;

      const state = stateRef.current;
      const size1 = Math.min(Math.max(30 + m1 * 10, 30), 80);
      const size2 = Math.min(Math.max(30 + m2 * 10, 30), 80);

      // Update positions
      const scale = 50; // pixels per meter
      state.x1 += state.v1 * dt * scale;
      state.x2 += state.v2 * dt * scale;

      // Collision detection
      // Check if they are moving towards each other and are currently overlapping or touching
      const relativeVel = state.v1 - state.v2;

      if (!state.hasCollided && (state.x1 + size1 >= state.x2) && relativeVel > 0) {
        state.hasCollided = true;
        // Move them exactly to contact point to prevent sticking or gaps
        const overlap = (state.x1 + size1) - state.x2;
        state.x1 -= overlap / 2;
        state.x2 += overlap / 2;

        const e = collisionType === 'elastic' ? 1 : 0;
        
        const v1_new = (m1 * state.v1 + m2 * state.v2 + m2 * e * (state.v2 - state.v1)) / (m1 + m2);
        const v2_new = (m1 * state.v1 + m2 * state.v2 + m1 * e * (state.v1 - state.v2)) / (m1 + m2);

        state.v1 = v1_new;
        state.v2 = v2_new;
      }

      // Wrap around or stop
      if (state.x1 > canvas.width + 100 || state.x1 < -100 || state.x2 > canvas.width + 100 || state.x2 < -100) {
        setIsPlaying(false);
      }

      draw(ctx, canvas.width, canvas.height, state);
      animationRef.current = requestAnimationFrame(animate);
    };

    lastTimeRef.current = performance.now();
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, m1, m2, collisionType]);

  const handleReset = () => {
    stateRef.current = {
      x1: 100,
      x2: 600,
      v1: v1Init,
      v2: v2Init,
      hasCollided: false,
    };
    setIsPlaying(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) draw(ctx, canvas.width, canvas.height, stateRef.current);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
      <h3 className="text-xl font-semibold text-slate-800 mb-6">1D Collision Simulation</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
        <div className="lg:col-span-2 space-y-4">
          <h4 className="font-medium text-blue-600">Block 1 (Blue)</h4>
          <div>
            <label className="block text-sm text-slate-600 mb-1">Mass (<InlineMath math="m_1" />): {m1} kg</label>
            <input type="range" min="0.5" max="5" step="0.5" value={m1} onChange={(e) => setM1(Number(e.target.value))} className="w-full accent-blue-600" />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">Initial Velocity (<InlineMath math="v_{1i}" />): {v1Init} m/s</label>
            <input type="range" min="-10" max="10" step="1" value={v1Init} onChange={(e) => setV1Init(Number(e.target.value))} className="w-full accent-blue-600" />
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h4 className="font-medium text-red-600">Block 2 (Red)</h4>
          <div>
            <label className="block text-sm text-slate-600 mb-1">Mass (<InlineMath math="m_2" />): {m2} kg</label>
            <input type="range" min="0.5" max="5" step="0.5" value={m2} onChange={(e) => setM2(Number(e.target.value))} className="w-full accent-red-600" />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">Initial Velocity (<InlineMath math="v_{2i}" />): {v2Init} m/s</label>
            <input type="range" min="-10" max="10" step="1" value={v2Init} onChange={(e) => setV2Init(Number(e.target.value))} className="w-full accent-red-600" />
          </div>
        </div>

        <div className="lg:col-span-1 space-y-4">
          <h4 className="font-medium text-slate-800">Settings</h4>
          <div>
            <label className="block text-sm text-slate-600 mb-2">Collision Type</label>
            <select 
              value={collisionType} 
              onChange={(e) => setCollisionType(e.target.value as 'elastic' | 'inelastic')}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="elastic">Elastic</option>
              <option value="inelastic">Perfectly Inelastic</option>
            </select>
          </div>
        </div>
      </div>

      <div className="w-full bg-slate-50 rounded-lg border border-slate-200 overflow-hidden mb-4 relative">
        <canvas 
          ref={canvasRef} 
          width={800} 
          height={200} 
          className="w-full h-auto block"
        />
      </div>

      <div className="flex items-center justify-center gap-4">
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button 
          onClick={handleReset}
          className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-2 rounded-lg font-medium transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
          Reset
        </button>
      </div>
    </div>
  );
}
