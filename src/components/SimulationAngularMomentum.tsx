import React, { useState, useEffect, useRef } from 'react';
import { InlineMath } from 'react-katex';

export function SimulationAngularMomentum() {
  const [rWeights, setRWeights] = useState(0.2); // Distance of weights (0.2m - 0.8m)
  const [mWeights, setMWeights] = useState(5); // Mass of each weight (kg)
  const [initialOmega, setInitialOmega] = useState(5); // Initial angular velocity when r = 0.2 (rad/s)
  const [mPerson, setMPerson] = useState(60); // Mass of person + platform (kg)
  
  // Constants for person
  const RPerson = 0.2; // Equivalent radius of person (m)
  
  // Moment of inertia of person + platform (modeled as a solid cylinder)
  const IPerson = 0.5 * mPerson * RPerson * RPerson;
  
  // Initial state (Reference state is when arms are retracted: r = 0.2m)
  const rInit = 0.2;
  const initialIWeights = 2 * mWeights * rInit * rInit;
  const initialITotal = IPerson + initialIWeights;
  const L = initialITotal * initialOmega; // Angular momentum is conserved
  
  // Current state
  const currentIWeights = 2 * mWeights * rWeights * rWeights;
  const currentITotal = IPerson + currentIWeights;
  const currentOmega = L / currentITotal;
  const currentKE = 0.5 * currentITotal * currentOmega * currentOmega;
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [angle, setAngle] = useState(0);
  
  const currentOmegaRef = useRef(currentOmega);
  
  useEffect(() => {
    currentOmegaRef.current = currentOmega;
  }, [currentOmega]);
  
  useEffect(() => {
    let frameId: number;
    let lastTime = performance.now();
    
    const animate = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;
      
      // Limit dt to avoid huge jumps if tab is inactive
      const safeDt = Math.min(dt, 0.1);
      setAngle(prev => (prev + currentOmegaRef.current * safeDt) % (2 * Math.PI));
      
      frameId = requestAnimationFrame(animate);
    };
    
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, []);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = 120; // pixels per meter (0.8m max radius -> 96px)
    
    ctx.save();
    ctx.translate(centerX, centerY);
    
    // Draw platform
    const RPlatform = 0.5; // 0.5m radius
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, RPlatform * scale);
    gradient.addColorStop(0, '#f8fafc');
    gradient.addColorStop(1, '#e2e8f0');

    ctx.beginPath();
    ctx.arc(0, 0, RPlatform * scale, 0, 2 * Math.PI);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Rotate everything on the platform
    ctx.rotate(angle);
    
    // Cross lines on platform for visual rotation
    ctx.beginPath();
    ctx.moveTo(-RPlatform * scale, 0);
    ctx.lineTo(RPlatform * scale, 0);
    ctx.moveTo(0, -RPlatform * scale);
    ctx.lineTo(0, RPlatform * scale);
    ctx.strokeStyle = '#94a3b8'; // Darker for better visibility
    ctx.lineWidth = 3;
    ctx.stroke();

    // Add edge markers to make rotation very obvious
    for (let i = 0; i < 8; i++) {
      const markerAngle = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.arc(
        (RPlatform * scale - 6) * Math.cos(markerAngle),
        (RPlatform * scale - 6) * Math.sin(markerAngle),
        4,
        0,
        2 * Math.PI
      );
      ctx.fillStyle = '#64748b';
      ctx.fill();
    }
    
    // Draw arms
    ctx.beginPath();
    ctx.moveTo(-rWeights * scale, 0);
    ctx.lineTo(rWeights * scale, 0);
    ctx.strokeStyle = '#fca5a5'; // Skin tone-ish
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.stroke();
    
    // Draw person's body
    ctx.beginPath();
    ctx.ellipse(0, 0, RPerson * scale, (RPerson * 0.6) * scale, 0, 0, 2 * Math.PI);
    ctx.fillStyle = '#3b82f6'; // Blue shirt
    ctx.fill();
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw person's head
    ctx.beginPath();
    ctx.arc(0, 0, 0.12 * scale, 0, 2 * Math.PI);
    ctx.fillStyle = '#fef08a'; // Hair/Head
    ctx.fill();
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Function to draw dumbbell and its velocity vector
    const drawDumbbell = (r: number, angleOffset: number) => {
      ctx.save();
      ctx.rotate(angleOffset);
      
      const x = r * scale;
      const y = 0;
      const radius = 8 + mWeights * 0.5; // Size depends slightly on mass
      
      // Draw dumbbell handle
      ctx.beginPath();
      ctx.moveTo(x - 5, y - 10);
      ctx.lineTo(x - 5, y + 10);
      ctx.moveTo(x + 5, y - 10);
      ctx.lineTo(x + 5, y + 10);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Draw dumbbell weights
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(x, y - 12, radius, 0, 2 * Math.PI);
      ctx.arc(x, y + 12, radius, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw velocity vector (tangential)
      const vMagnitude = currentOmega * r * 10; // Scale for visual
      
      if (Math.abs(vMagnitude) > 2) {
        const vx = 0;
        const vy = vMagnitude; // Tangential velocity
        
        ctx.beginPath();
        ctx.moveTo(x, y + (vMagnitude > 0 ? 20 : -20));
        ctx.lineTo(x + vx, y + vy);
        ctx.strokeStyle = '#ef4444'; // Red vector for velocity
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Arrow head
        const headlen = 8;
        const arrowAngle = Math.atan2(vy, vx);
        ctx.beginPath();
        ctx.moveTo(x + vx, y + vy);
        ctx.lineTo(x + vx - headlen * Math.cos(arrowAngle - Math.PI / 6), y + vy - headlen * Math.sin(arrowAngle - Math.PI / 6));
        ctx.lineTo(x + vx - headlen * Math.cos(arrowAngle + Math.PI / 6), y + vy - headlen * Math.sin(arrowAngle + Math.PI / 6));
        ctx.fillStyle = '#ef4444';
        ctx.fill();
      }
      
      ctx.restore();
    };

    drawDumbbell(rWeights, 0);
    drawDumbbell(rWeights, Math.PI);

    ctx.restore();
    
  }, [angle, rWeights, mWeights, currentOmega]);
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
      <h3 className="text-xl font-semibold text-slate-800 mb-4">Conservation of Angular Momentum (Person with Dumbbells)</h3>
      <p className="text-slate-600 mb-6">
        A person stands on a rotating platform holding two dumbbells. Initially, the person holds the dumbbells close to their chest (retracted arms) and rotates with an angular velocity <InlineMath math="\omega_1" />. 
        When the person <strong>extends their arms</strong> (increasing radius <InlineMath math="r" />), the moment of inertia <InlineMath math="I" /> of the system increases. 
        To conserve angular momentum <InlineMath math="L = I\omega" />, the angular velocity <InlineMath math="\omega" /> must <strong>decrease</strong>.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 bg-slate-50 p-4 rounded-lg border border-slate-100">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Radius of Weights (<InlineMath math="r" />): {rWeights.toFixed(2)} m
          </label>
          <input type="range" min="0.2" max="0.8" step="0.05" value={rWeights} onChange={(e) => setRWeights(Number(e.target.value))} className="w-full accent-indigo-600" />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>Retracted (0.2m)</span>
            <span>Extended (0.8m)</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Initial Angular Velocity (<InlineMath math="\omega_1" />): {initialOmega.toFixed(1)} rad/s
          </label>
          <input type="range" min="1" max="10" step="0.5" value={initialOmega} onChange={(e) => setInitialOmega(Number(e.target.value))} className="w-full accent-indigo-600" />
          <p className="text-xs text-slate-500 mt-1">(When retracted r = 0.2m)</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Mass of Each Weight (<InlineMath math="m" />): {mWeights.toFixed(1)} kg
          </label>
          <input type="range" min="1" max="15" step="1" value={mWeights} onChange={(e) => setMWeights(Number(e.target.value))} className="w-full accent-indigo-600" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Mass of Person (<InlineMath math="M" />): {mPerson.toFixed(0)} kg
          </label>
          <input type="range" min="40" max="100" step="5" value={mPerson} onChange={(e) => setMPerson(Number(e.target.value))} className="w-full accent-indigo-600" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="w-full bg-slate-50 rounded-lg border border-slate-200 overflow-hidden relative flex justify-center items-center h-80">
          <canvas ref={canvasRef} width={400} height={320} className="max-w-full h-auto block" />
        </div>
        
        <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 flex flex-col justify-center space-y-4">
          <h4 className="font-medium text-slate-800 mb-2 border-b border-slate-200 pb-2">Current System Properties</h4>
          
          <div className="flex justify-between items-center pb-2">
            <span className="text-slate-600">Moment of Inertia (<InlineMath math="I = I_{person} + 2mr^2" />)</span>
            <span className="font-semibold text-slate-800">{currentITotal.toFixed(2)} kg·m²</span>
          </div>
          
          <div className="flex justify-between items-center pb-2">
            <span className="text-slate-600">Angular Velocity (<InlineMath math="\omega" />)</span>
            <span className="font-semibold text-indigo-600 text-lg">{currentOmega.toFixed(2)} rad/s</span>
          </div>
          
          <div className="flex justify-between items-center pb-2 bg-emerald-50 p-2 rounded border border-emerald-100">
            <span className="text-emerald-800 font-medium">Angular Momentum (<InlineMath math="L = I\omega" />)</span>
            <span className="font-bold text-emerald-700">{L.toFixed(2)} kg·m²/s</span>
          </div>
          
          <div className="flex justify-between items-center pb-2">
            <span className="text-slate-600">Rotational Kinetic Energy (<InlineMath math="K = \frac{1}{2}I\omega^2" />)</span>
            <span className="font-semibold text-orange-600">{currentKE.toFixed(2)} J</span>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-sm rounded-lg border border-blue-100">
            <strong>Observation:</strong> Angular momentum <InlineMath math="L" /> is always <strong>conserved (constant)</strong>. 
            However, kinetic energy <InlineMath math="K" /> changes! When the person retracts their arms (pulls the weights inward), they must do positive work against the centrifugal force, which increases the kinetic energy of the system.
          </div>
        </div>
      </div>
    </div>
  );
}

