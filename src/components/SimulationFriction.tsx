import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot
} from 'recharts';

interface SimulationFrictionProps {
  normalForce: number;
  muStatic: number;
  muKinetic: number;
  appliedForce: number;
}

export function SimulationFriction({ normalForce, muStatic, muKinetic, appliedForce }: SimulationFrictionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Physics state
  const stateRef = useRef({ x: 50, v: 0 });
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const gravity = 9.81;
  const mass = normalForce / gravity;
  const maxStaticFriction = muStatic * normalForce;
  const kineticFriction = muKinetic * normalForce;

  const graphData = useMemo(() => {
    const points = [];
    const maxApplied = Math.max(maxStaticFriction * 1.5, Math.abs(appliedForce) * 1.2, 100);
    
    // Static region
    points.push({ appliedForce: 0, frictionForce: 0 });
    points.push({ appliedForce: maxStaticFriction, frictionForce: maxStaticFriction });
    
    // Drop to kinetic
    points.push({ appliedForce: maxStaticFriction + 0.001, frictionForce: kineticFriction });
    
    // Kinetic region
    points.push({ appliedForce: maxApplied, frictionForce: kineticFriction });
    
    return points;
  }, [maxStaticFriction, kineticFriction, appliedForce]);

  // Determine current friction for the dot
  let currentFriction = 0;
  const absApplied = Math.abs(appliedForce);
  if (absApplied <= maxStaticFriction) {
    currentFriction = absApplied;
  } else {
    currentFriction = kineticFriction;
  }

  const draw = (ctx: CanvasRenderingContext2D, width: number, height: number, state: {x: number, v: number}) => {
    ctx.clearRect(0, 0, width, height);

    // Draw surface
    const surfaceY = height - 50;
    ctx.beginPath();
    ctx.moveTo(0, surfaceY);
    ctx.lineTo(width, surfaceY);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Draw block
    const blockSize = 60;
    const blockX = state.x;
    const blockY = surfaceY - blockSize;
    
    ctx.fillStyle = '#4f46e5';
    ctx.fillRect(blockX, blockY, blockSize, blockSize);
    ctx.strokeStyle = '#312e81';
    ctx.lineWidth = 2;
    ctx.strokeRect(blockX, blockY, blockSize, blockSize);

    // Determine friction force
    let frictionForce = 0;
    let isMoving = Math.abs(state.v) > 0.01;
    
    if (isMoving) {
      frictionForce = kineticFriction * Math.sign(state.v);
    } else {
      if (Math.abs(appliedForce) <= maxStaticFriction) {
        frictionForce = appliedForce;
      } else {
        frictionForce = kineticFriction * Math.sign(appliedForce);
      }
    }

    const centerX = blockX + blockSize / 2;
    const centerY = blockY + blockSize / 2;

    const drawVector = (x: number, y: number, length: number, color: string, label: string, offsetY: number = -10) => {
      if (Math.abs(length) < 0.1) return;
      const scale = 1.5; // pixels per Newton
      const scaledLength = length * scale;
      
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + scaledLength, y);
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Arrow head
      const dir = Math.sign(length);
      ctx.beginPath();
      ctx.moveTo(x + scaledLength, y);
      ctx.lineTo(x + scaledLength - dir * 10, y - 5);
      ctx.lineTo(x + scaledLength - dir * 10, y + 5);
      ctx.fillStyle = color;
      ctx.fill();

      ctx.fillStyle = color;
      ctx.font = '14px Inter, sans-serif';
      // Center text above/below arrow
      const textWidth = ctx.measureText(label).width;
      ctx.fillText(label, x + scaledLength / 2 - textWidth / 2, y + offsetY);
    };

    // Draw Applied Force (Red)
    drawVector(centerX, centerY - 15, appliedForce, '#ef4444', 'F_app', -10);
    
    // Draw Friction Force (Orange)
    drawVector(centerX, centerY + 15, -frictionForce, '#f97316', 'f', 20);

    // Draw Normal Force and Weight (Vertical)
    // Normal (Green)
    const verticalScale = 0.5;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX, centerY - normalForce * verticalScale);
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#22c55e';
    ctx.fillText('N', centerX + 10, centerY - normalForce * verticalScale / 2);

    // Weight (Purple)
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX, centerY + normalForce * verticalScale);
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#a855f7';
    ctx.fillText('W', centerX + 10, centerY + normalForce * verticalScale / 2);

    // Info text
    ctx.fillStyle = '#1e293b';
    ctx.font = '14px Inter, sans-serif';
    ctx.fillText(`Velocity: ${state.v.toFixed(2)} m/s`, 20, 30);
    ctx.fillText(`Applied Force: ${appliedForce.toFixed(1)} N`, 20, 50);
    ctx.fillText(`Friction: ${Math.abs(frictionForce).toFixed(1)} N (${isMoving ? 'Kinetic' : 'Static'})`, 20, 70);
    ctx.fillText(`Max Static Friction: ${maxStaticFriction.toFixed(1)} N`, 20, 90);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initial draw
    draw(ctx, canvas.width, canvas.height, stateRef.current);
  }, [normalForce, muStatic, muKinetic, appliedForce]);

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

      const dt = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      const state = stateRef.current;
      
      let isMoving = Math.abs(state.v) > 0.01;
      let frictionForce = 0;
      let netForce = 0;

      if (isMoving) {
        frictionForce = kineticFriction * Math.sign(state.v);
        netForce = appliedForce - frictionForce;
      } else {
        if (Math.abs(appliedForce) <= maxStaticFriction) {
          frictionForce = appliedForce;
          netForce = 0;
          state.v = 0; // exactly 0
        } else {
          frictionForce = kineticFriction * Math.sign(appliedForce);
          netForce = appliedForce - frictionForce;
        }
      }

      const acceleration = netForce / mass;
      
      // Update velocity
      const newV = state.v + acceleration * dt;
      
      // Check for stopping (velocity crossed 0)
      if (isMoving && Math.sign(state.v) !== Math.sign(newV) && Math.abs(appliedForce) <= maxStaticFriction) {
        state.v = 0;
      } else {
        state.v = newV;
      }

      // Update position
      state.x += state.v * dt * 50; // scale factor for visual speed

      const blockSize = 60; // Define blockSize here for use in wrap around logic

      // Wrap around or clamp
      if (state.x > canvas.width) state.x = -blockSize;
      if (state.x < -blockSize) state.x = canvas.width;

      draw(ctx, canvas.width, canvas.height, state);

      animationRef.current = requestAnimationFrame(animate);
    };

    lastTimeRef.current = performance.now();
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, mass, muStatic, muKinetic, appliedForce, maxStaticFriction, kineticFriction]);

  const handleReset = () => {
    stateRef.current = { x: 50, v: 0 };
    setIsPlaying(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) draw(ctx, canvas.width, canvas.height, stateRef.current);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-xl font-semibold text-slate-800 mb-4">Real-time Animated Simulation</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
        <div className="w-full bg-slate-50 rounded-lg border border-slate-200 overflow-hidden relative flex flex-col justify-center">
          <canvas 
            ref={canvasRef} 
            width={800} 
            height={300} 
            className="w-full h-auto block"
          />
        </div>

        <div className="h-80 w-full bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h4 className="text-center font-medium text-slate-700 mb-2">Friction Force vs. Applied Force</h4>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={graphData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="appliedForce" 
                type="number" 
                domain={[0, 'dataMax']} 
                label={{ value: 'Applied Force (N)', position: 'insideBottom', offset: -10 }} 
              />
              <YAxis 
                domain={[0, maxStaticFriction * 1.2]} 
                label={{ value: 'Friction Force (N)', angle: -90, position: 'insideLeft', offset: 10 }} 
              />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(1)} N`, 'Friction']}
                labelFormatter={(label: number) => `Applied: ${Number(label).toFixed(1)} N`}
              />
              <Line 
                type="linear" 
                dataKey="frictionForce" 
                stroke="#f97316" 
                strokeWidth={3} 
                dot={false} 
                isAnimationActive={false}
              />
              <ReferenceDot 
                x={absApplied} 
                y={currentFriction} 
                r={6} 
                fill="#4f46e5" 
                stroke="#fff" 
                strokeWidth={2} 
              />
              <ReferenceLine x={maxStaticFriction} stroke="#94a3b8" strokeDasharray="3 3" label={{ position: 'top', value: 'Max Static' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
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
