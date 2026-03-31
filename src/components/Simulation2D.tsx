import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Wind } from 'lucide-react';

interface Simulation2DProps {
  initialVelocity: number;
  angle: number;
  gravity: number;
  mass: number;
  initialHeight?: number;
}

export function Simulation2D({ initialVelocity, angle, gravity, mass, initialHeight = 0 }: Simulation2DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [showVelocity, setShowVelocity] = useState(true);
  const [showVelocityComponents, setShowVelocityComponents] = useState(false);
  const [showAcceleration, setShowAcceleration] = useState(true);
  const [showAccelerationComponents, setShowAccelerationComponents] = useState(false);
  const [showAccelerationNT, setShowAccelerationNT] = useState(false);
  const [hasAirResistance, setHasAirResistance] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const animationRef = useRef<number>(null);

  const angleRad = (angle * Math.PI) / 180;
  const v0x = initialVelocity * Math.cos(angleRad);
  const v0y = initialVelocity * Math.sin(angleRad);

  const k = hasAirResistance ? 0.5 : 0; // drag coefficient per unit mass

  const getState = (t: number) => {
    if (k === 0) {
      return {
        x: v0x * t,
        y: initialHeight + v0y * t - 0.5 * gravity * t * t,
        vx: v0x,
        vy: v0y - gravity * t,
        ax: 0,
        ay: -gravity
      };
    } else {
      const expKt = Math.exp(-k * t);
      const vx = v0x * expKt;
      const vy = (v0y + gravity / k) * expKt - gravity / k;
      return {
        x: (v0x / k) * (1 - expKt),
        y: initialHeight + ((v0y + gravity / k) / k) * (1 - expKt) - (gravity / k) * t,
        vx,
        vy,
        ax: -k * vx,
        ay: -gravity - k * vy
      };
    }
  };

  const timeOfFlightNoDrag = (v0y + Math.sqrt(v0y * v0y + 2 * gravity * initialHeight)) / gravity;
  
  let timeOfFlight = timeOfFlightNoDrag;
  if (k > 0 && timeOfFlightNoDrag > 0) {
    let low = 0;
    let high = timeOfFlightNoDrag * 2;
    for (let i = 0; i < 40; i++) {
      const mid = (low + high) / 2;
      const y_mid = initialHeight + ((v0y + gravity / k) / k) * (1 - Math.exp(-k * mid)) - (gravity / k) * mid;
      if (y_mid > 0) {
        low = mid;
      } else {
        high = mid;
      }
    }
    timeOfFlight = low;
  }

  const maxDistance = getState(timeOfFlight).x;
  
  let timeToPeak = v0y / gravity;
  if (k > 0) {
    const arg = 1 + (k * v0y) / gravity;
    if (arg > 0) {
      timeToPeak = (1 / k) * Math.log(arg);
    } else {
      timeToPeak = 0;
    }
  }
  timeToPeak = Math.max(0, timeToPeak);
  const maxHeight = getState(timeToPeak).y;

  const getCanvasScale = (width: number, height: number) => {
    const padding = 40;
    // Base scale on the no-drag trajectory so the view doesn't jump when toggling
    const refDistance = v0x * timeOfFlightNoDrag;
    const refHeight = initialHeight + (v0y > 0 ? (v0y * v0y) / (2 * gravity) : 0);
    const scaleX = (width - 2 * padding) / Math.max(refDistance, 10);
    const scaleY = (height - 2 * padding) / Math.max(refHeight, 10);
    return Math.min(scaleX, scaleY);
  };

  const draw = (ctx: CanvasRenderingContext2D, width: number, height: number, t: number) => {
    ctx.clearRect(0, 0, width, height);

    const padding = 40;
    const scale = getCanvasScale(width, height);
    const originX = padding;
    const originY = height - padding;

    // Draw axes
    ctx.beginPath();
    ctx.moveTo(originX, padding);
    ctx.lineTo(originX, originY);
    ctx.lineTo(width - padding, originY);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw ideal trajectory (no air resistance) as faint line if air resistance is on
    if (hasAirResistance) {
      ctx.beginPath();
      ctx.moveTo(originX, originY - initialHeight * scale);
      for (let i = 0; i <= timeOfFlightNoDrag; i += 0.05) {
        const px = v0x * i;
        const py = initialHeight + v0y * i - 0.5 * gravity * i * i;
        if (py >= 0) {
          ctx.lineTo(originX + px * scale, originY - py * scale);
        }
      }
      ctx.strokeStyle = '#cbd5e1';
      ctx.setLineDash([2, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw full trajectory path
    ctx.beginPath();
    ctx.moveTo(originX, originY - initialHeight * scale);
    for (let i = 0; i <= timeOfFlight; i += 0.05) {
      const state = getState(i);
      ctx.lineTo(originX + state.x * scale, originY - state.y * scale);
    }
    const finalState = getState(timeOfFlight);
    ctx.lineTo(originX + finalState.x * scale, originY - Math.max(0, finalState.y) * scale);
    
    ctx.strokeStyle = hasAirResistance ? '#94a3b8' : '#e2e8f0';
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Current position
    const currentState = getState(t);
    const currentX = currentState.x;
    const currentY = currentState.y;
    const canvasX = originX + currentX * scale;
    const canvasY = originY - currentY * scale;

    // Draw velocity vectors
    const vx = currentState.vx;
    const vy = currentState.vy;
    const ax = currentState.ax;
    const ay = currentState.ay;
    
    const drawArrow = (fromX: number, fromY: number, toX: number, toY: number, color: string, dashed = false) => {
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.strokeStyle = color;
      ctx.lineWidth = dashed ? 1.5 : 2;
      if (dashed) ctx.setLineDash([4, 4]);
      else ctx.setLineDash([]);
      ctx.stroke();
      ctx.setLineDash([]);
      
      const arrowAngle = Math.atan2(toY - fromY, toX - fromX);
      const headlen = 8;
      ctx.beginPath();
      ctx.moveTo(toX, toY);
      ctx.lineTo(toX - headlen * Math.cos(arrowAngle - Math.PI / 6), toY - headlen * Math.sin(arrowAngle - Math.PI / 6));
      ctx.lineTo(toX - headlen * Math.cos(arrowAngle + Math.PI / 6), toY - headlen * Math.sin(arrowAngle + Math.PI / 6));
      ctx.fillStyle = color;
      ctx.fill();
    };

    if (showVelocity) {
      const endX = canvasX + vx * scale * 0.2;
      const endY = canvasY - vy * scale * 0.2;
      drawArrow(canvasX, canvasY, endX, endY, '#ef4444');
    }
    
    if (showVelocityComponents) {
      const endX = canvasX + vx * scale * 0.2;
      const endY = canvasY - vy * scale * 0.2;
      if (Math.abs(vx) > 0.1) drawArrow(canvasX, canvasY, endX, canvasY, '#fca5a5', true); // vx
      if (Math.abs(vy) > 0.1) drawArrow(canvasX, canvasY, canvasX, endY, '#fca5a5', true); // vy
    }

    if (showAcceleration) {
      const endX = canvasX + ax * scale * 0.2;
      const endY = canvasY - ay * scale * 0.2;
      drawArrow(canvasX, canvasY, endX, endY, '#10b981');
    }
    
    if (showAccelerationComponents) {
      const endX = canvasX + ax * scale * 0.2;
      const endY = canvasY - ay * scale * 0.2;
      if (Math.abs(ax) > 0.1) drawArrow(canvasX, canvasY, endX, canvasY, '#6ee7b7', true); // ax
      if (Math.abs(ay) > 0.1) drawArrow(canvasX, canvasY, canvasX, endY, '#6ee7b7', true); // ay
    }

    if (showAccelerationNT) {
      const vMag = Math.sqrt(vx * vx + vy * vy);
      
      if (vMag > 0.001) {
        const cosTheta = vx / vMag;
        const sinTheta = vy / vMag;
        
        // Project acceleration onto tangential and normal unit vectors
        const atMag = ax * cosTheta + ay * sinTheta;
        const anMag = ax * (-sinTheta) + ay * cosTheta;
        
        // Convert back to x, y components for drawing
        const atX = atMag * cosTheta;
        const atY = atMag * sinTheta;
        
        const anX = anMag * (-sinTheta);
        const anY = anMag * cosTheta;
        
        const endAtX = canvasX + atX * scale * 0.2;
        const endAtY = canvasY - atY * scale * 0.2;
        if (Math.abs(atMag) > 0.1) drawArrow(canvasX, canvasY, endAtX, endAtY, '#fb923c', true); // a_t (orange)
        
        const endAnX = canvasX + anX * scale * 0.2;
        const endAnY = canvasY - anY * scale * 0.2;
        if (Math.abs(anMag) > 0.1) drawArrow(canvasX, canvasY, endAnX, endAnY, '#fb923c', true); // a_n (orange)
      }
    }

    // Draw projectile
    ctx.beginPath();
    ctx.arc(canvasX, canvasY, 8, 0, 2 * Math.PI);
    ctx.fillStyle = isDragging ? '#6366f1' : '#4f46e5';
    ctx.fill();
    ctx.strokeStyle = '#312e81';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw info text
    ctx.fillStyle = '#1e293b';
    ctx.font = '14px Inter, sans-serif';
    ctx.fillText(`t = ${t.toFixed(2)} s`, width - 120, 40);
    ctx.fillText(`x = ${currentX.toFixed(2)} m`, width - 120, 60);
    ctx.fillText(`y = ${Math.max(0, currentY).toFixed(2)} m`, width - 120, 80);
    ctx.fillText(`v = ${Math.sqrt(vx*vx + vy*vy).toFixed(2)} m/s`, width - 120, 100);
    
    if (isDragging) {
      ctx.fillStyle = '#64748b';
      ctx.font = '12px Inter, sans-serif';
      ctx.fillText('Drag to change time', canvasX + 15, canvasY - 15);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    draw(ctx, canvas.width, canvas.height, time);
  }, [initialVelocity, angle, gravity, time, initialHeight, showVelocity, showAcceleration, showVelocityComponents, showAccelerationComponents, showAccelerationNT, isDragging, hasAirResistance]);

  useEffect(() => {
    let lastTime = performance.now();
    
    const animate = (currentTime: number) => {
      if (!isPlaying || isDragging) return;
      
      const deltaTime = (currentTime - lastTime) / 1000; // in seconds
      lastTime = currentTime;

      setTime((prevTime) => {
        const newTime = prevTime + deltaTime;
        if (newTime >= timeOfFlight) {
          setIsPlaying(false);
          return timeOfFlight;
        }
        return newTime;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    if (isPlaying && !isDragging) {
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, isDragging, timeOfFlight]);

  const handlePlayPause = () => {
    if (time >= timeOfFlight) {
      setTime(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setTime(0);
  };

  // Mouse/Touch interaction for dragging
  const getClientCoords = (e: React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e) {
      return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
    }
    return { clientX: (e as React.MouseEvent).clientX, clientY: (e as React.MouseEvent).clientY };
  };

  const handlePointerDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const { clientX, clientY } = getClientCoords(e);
    
    const scaleRatioX = canvas.width / rect.width;
    const scaleRatioY = canvas.height / rect.height;
    
    const mouseX = (clientX - rect.left) * scaleRatioX;
    const mouseY = (clientY - rect.top) * scaleRatioY;

    const padding = 40;
    const scale = getCanvasScale(canvas.width, canvas.height);
    const originX = padding;
    const originY = canvas.height - padding;

    const currentState = getState(time);
    const canvasX = originX + currentState.x * scale;
    const canvasY = originY - currentState.y * scale;

    const dist = Math.sqrt((mouseX - canvasX) ** 2 + (mouseY - canvasY) ** 2);
    if (dist < 30) { // 30px radius for grabbing
      setIsDragging(true);
      setIsPlaying(false);
    }
  };

  const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const { clientX, clientY } = getClientCoords(e);
    
    const scaleRatioX = canvas.width / rect.width;
    const scaleRatioY = canvas.height / rect.height;
    
    const mouseX = (clientX - rect.left) * scaleRatioX;
    const mouseY = (clientY - rect.top) * scaleRatioY;

    const padding = 40;
    const scale = getCanvasScale(canvas.width, canvas.height);
    const originX = padding;
    const originY = canvas.height - padding;

    if (v0x > 0.1) {
      const targetX = (mouseX - originX) / scale;
      let newT = 0;
      if (k === 0) {
        newT = targetX / v0x;
      } else {
        const arg = 1 - (k * targetX) / v0x;
        if (arg > 0) {
          newT = -Math.log(arg) / k;
        } else {
          newT = timeOfFlight;
        }
      }
      newT = Math.max(0, Math.min(newT, timeOfFlight));
      setTime(newT);
    } else {
      // Vertical throw (angle = 90)
      const targetY = (originY - mouseY) / scale;
      
      let t1 = 0;
      let t2 = timeOfFlight;
      
      if (targetY > maxHeight) {
        setTime(timeToPeak);
      } else {
        let low = 0, high = timeToPeak;
        for(let i=0; i<20; i++) {
           let mid = (low+high)/2;
           if (getState(mid).y < targetY) low = mid;
           else high = mid;
        }
        t1 = low;

        low = timeToPeak; high = timeOfFlight;
        for(let i=0; i<20; i++) {
           let mid = (low+high)/2;
           if (getState(mid).y > targetY) low = mid;
           else high = mid;
        }
        t2 = low;

        if (mouseX > originX + 30) {
          setTime(t2);
        } else if (mouseX < originX - 30) {
          setTime(t1);
        } else {
          if (time > timeToPeak + 0.05) setTime(t2);
          else if (time < timeToPeak - 0.05) setTime(t1);
          else setTime(t2);
        }
      }
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Ensure time doesn't exceed new timeOfFlight when toggling drag
  useEffect(() => {
    if (time > timeOfFlight) {
      setTime(timeOfFlight);
    }
  }, [hasAirResistance, timeOfFlight]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h3 className="text-xl font-semibold text-slate-800">Real-time Animated Simulation</h3>
        
        <div className="flex flex-wrap gap-4 bg-slate-50 p-2 rounded-lg border border-slate-200">
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700 bg-white px-3 py-1 rounded shadow-sm border border-slate-200">
            <input 
              type="checkbox" 
              checked={hasAirResistance} 
              onChange={(e) => setHasAirResistance(e.target.checked)}
              className="accent-indigo-600 w-4 h-4"
            />
            <span className="flex items-center gap-1 text-indigo-700">
              <Wind className="w-4 h-4" />
              Air Resistance
            </span>
          </label>
          <div className="w-px h-6 bg-slate-300 mx-1 self-center"></div>
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
            <input 
              type="checkbox" 
              checked={showVelocity} 
              onChange={(e) => setShowVelocity(e.target.checked)}
              className="accent-red-500 w-4 h-4"
            />
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
              Velocity (v)
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
            <input 
              type="checkbox" 
              checked={showVelocityComponents} 
              onChange={(e) => setShowVelocityComponents(e.target.checked)}
              className="accent-red-300 w-4 h-4"
            />
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-300 inline-block"></span>
              v_x, v_y
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
            <input 
              type="checkbox" 
              checked={showAcceleration} 
              onChange={(e) => setShowAcceleration(e.target.checked)}
              className="accent-emerald-500 w-4 h-4"
            />
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
              Acceleration (a)
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
            <input 
              type="checkbox" 
              checked={showAccelerationComponents} 
              onChange={(e) => setShowAccelerationComponents(e.target.checked)}
              className="accent-emerald-300 w-4 h-4"
            />
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-emerald-300 inline-block"></span>
              a_x, a_y
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
            <input 
              type="checkbox" 
              checked={showAccelerationNT} 
              onChange={(e) => setShowAccelerationNT(e.target.checked)}
              className="accent-orange-400 w-4 h-4"
            />
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-orange-400 inline-block"></span>
              a_t, a_n
            </span>
          </label>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
          <p className="text-sm text-indigo-800 font-medium mb-1">Max Height (H)</p>
          <p className="text-2xl font-bold text-indigo-900">{maxHeight.toFixed(2)} m</p>
        </div>
        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
          <p className="text-sm text-indigo-800 font-medium mb-1">Total Range (R)</p>
          <p className="text-2xl font-bold text-indigo-900">{maxDistance.toFixed(2)} m</p>
        </div>
        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
          <p className="text-sm text-indigo-800 font-medium mb-1">Time of Flight (T)</p>
          <p className="text-2xl font-bold text-indigo-900">{timeOfFlight.toFixed(2)} s</p>
        </div>
      </div>

      <div className="w-full bg-slate-50 rounded-lg border border-slate-200 overflow-hidden mb-4 relative">
        <canvas 
          ref={canvasRef} 
          width={800} 
          height={400} 
          className={`w-full h-auto block ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        />
      </div>

      <div className="flex items-center justify-center gap-4">
        <button 
          onClick={handlePlayPause}
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
