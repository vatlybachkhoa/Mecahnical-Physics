import React, { useState, useEffect, useRef } from 'react';
import { InlineMath } from 'react-katex';

export function SimulationDoppler() {
  const [sourceSpeed, setSourceSpeed] = useState(0); // as a fraction of wave speed (Mach number)
  const [isPlaying, setIsPlaying] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reqRef = useRef(0);
  
  // State for the simulation
  const waveSpeed = 100; // pixels per second
  const emitInterval = 0.5; // seconds between wave emissions
  
  // Use refs for mutable simulation state to avoid dependency cycles in animation
  const stateRef = useRef({
    time: 0,
    lastEmitTime: 0,
    sourceX: 0,
    waves: [] as { x: number, timeCreated: number }[]
  });

  const reset = () => {
    setIsPlaying(false);
    stateRef.current = {
      time: 0,
      lastEmitTime: 0,
      sourceX: 0,
      waves: []
    };
    draw(0);
  };

  useEffect(() => {
    if (!isPlaying) {
      draw(stateRef.current.time);
      return;
    }

    let lastTimestamp = performance.now();

    const animate = (timestamp: number) => {
      const dt = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;
      
      const state = stateRef.current;
      state.time += dt;
      
      // Move source
      const actualSourceSpeed = sourceSpeed * waveSpeed;
      state.sourceX += actualSourceSpeed * dt;
      
      // Keep source within bounds (wrap around or just let it go, let's wrap for continuous viewing)
      if (state.sourceX > 400) {
        state.sourceX = -400;
        state.waves = []; // clear waves when wrapping to avoid mess
      } else if (state.sourceX < -400) {
        state.sourceX = 400;
        state.waves = [];
      }

      // Emit new wave
      if (state.time - state.lastEmitTime >= emitInterval) {
        state.waves.push({ x: state.sourceX, timeCreated: state.time });
        state.lastEmitTime = state.time;
      }
      
      // Remove old waves that are off-screen
      state.waves = state.waves.filter(w => (state.time - w.timeCreated) * waveSpeed < 800);

      draw(state.time);
      reqRef.current = requestAnimationFrame(animate);
    };

    reqRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(reqRef.current);
  }, [isPlaying, sourceSpeed]);

  const draw = (currentTime: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerY = height / 2;
    const centerX = width / 2;

    ctx.clearRect(0, 0, width, height);

    const state = stateRef.current;

    // Draw waves
    ctx.lineWidth = 2;
    state.waves.forEach(wave => {
      const age = currentTime - wave.timeCreated;
      const radius = age * waveSpeed;
      
      // Fade out older waves
      const opacity = Math.max(0, 1 - radius / 600);
      ctx.strokeStyle = `rgba(59, 130, 246, ${opacity})`; // blue-500
      
      ctx.beginPath();
      ctx.arc(centerX + wave.x, centerY, radius, 0, 2 * Math.PI);
      ctx.stroke();
    });

    // Draw source
    ctx.fillStyle = '#ef4444'; // red-500
    ctx.beginPath();
    ctx.arc(centerX + state.sourceX, centerY, 8, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw velocity vector
    if (Math.abs(sourceSpeed) > 0) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerX + state.sourceX, centerY);
      ctx.lineTo(centerX + state.sourceX + sourceSpeed * 40, centerY);
      ctx.stroke();
      
      // Arrowhead
      ctx.beginPath();
      const arrowX = centerX + state.sourceX + sourceSpeed * 40;
      const dir = sourceSpeed > 0 ? 1 : -1;
      ctx.moveTo(arrowX, centerY);
      ctx.lineTo(arrowX - dir * 8, centerY - 6);
      ctx.lineTo(arrowX - dir * 8, centerY + 6);
      ctx.fill();
    }
  };

  // Initial draw
  useEffect(() => {
    draw(stateRef.current.time);
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 my-8">
      <h3 className="text-xl font-semibold text-slate-800 mb-4">Interactive: The Doppler Effect</h3>
      <p className="text-slate-600 mb-6">
        Observe how the motion of the source affects the wavelength and frequency of the emitted waves. 
        When the source moves towards the right, the waves bunch up in front of it (higher frequency/pitch) 
        and spread out behind it (lower frequency/pitch).
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Source Speed (<InlineMath math="v_s" />): {sourceSpeed.toFixed(2)} <InlineMath math="v_{wave}" />
            </label>
            <input 
              type="range" min="-0.9" max="0.9" step="0.1" 
              value={sourceSpeed} 
              onChange={(e) => setSourceSpeed(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <p className="text-xs text-slate-500 mt-2">
              Values close to 1 represent the source moving at the speed of the wave (Mach 1).
            </p>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => setIsPlaying(!isPlaying)} 
              className="flex-1 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button 
              onClick={reset} 
              className="flex-1 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors border border-slate-200"
            >
              Reset
            </button>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-900">
            <strong>Real-world examples:</strong>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>An ambulance siren sounding higher-pitched as it approaches and lower-pitched as it drives away.</li>
              <li>Police radar guns measuring the speed of a car.</li>
              <li>Astronomers observing the "red shift" of distant galaxies moving away from Earth.</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-2 bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center relative min-h-[300px]">
          <canvas 
            ref={canvasRef} 
            width={600} 
            height={300} 
            className="max-w-full h-auto"
          />
          {/* Observer icons */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="w-4 h-4 rounded-full bg-emerald-400 mb-1"></div>
            <span className="text-emerald-400 text-xs font-bold">Observer A</span>
            <span className="text-emerald-200 text-[10px] text-center mt-1">
              {sourceSpeed < 0 ? 'Higher Freq' : sourceSpeed > 0 ? 'Lower Freq' : 'Normal Freq'}
            </span>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="w-4 h-4 rounded-full bg-amber-400 mb-1"></div>
            <span className="text-amber-400 text-xs font-bold">Observer B</span>
            <span className="text-amber-200 text-[10px] text-center mt-1">
              {sourceSpeed > 0 ? 'Higher Freq' : sourceSpeed < 0 ? 'Lower Freq' : 'Normal Freq'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
