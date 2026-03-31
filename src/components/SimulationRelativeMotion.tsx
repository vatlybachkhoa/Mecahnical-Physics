import React, { useState, useEffect, useRef } from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import { Play, Pause, RotateCcw } from 'lucide-react';

export function SimulationRelativeMotion() {
  const [mode, setMode] = useState<'boat' | 'plane'>('boat');
  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useState(0);

  // Boat State
  const [vBoat, setVBoat] = useState(5); // m/s
  const [angleBoat, setAngleBoat] = useState(90); // degrees (90 is straight across, North)
  const [vRiver, setVRiver] = useState(3); // m/s (flows East, 0 degrees)

  // Plane State
  const [vPlane, setVPlane] = useState(200); // km/h
  const [anglePlane, setAnglePlane] = useState(180); // degrees (180 is West)
  const [vWind, setVWind] = useState(50); // km/h
  const [angleWind, setAngleWind] = useState(315); // degrees (315 is South-East)

  const reqRef = useRef(0);
  const lastTimeRef = useRef(0);

  const reset = () => {
    setIsPlaying(false);
    setTime(0);
    lastTimeRef.current = 0;
  };

  // Reset time when mode changes
  useEffect(() => {
    reset();
  }, [mode]);

  // --- Math Calculations ---
  // Note: Standard math angles (0=East, 90=North). SVG y-axis is inverted (down is positive).
  const deg2rad = (deg: number) => (deg * Math.PI) / 180;

  // Boat calculations
  const vBoatX = vBoat * Math.cos(deg2rad(angleBoat));
  const vBoatY = vBoat * Math.sin(deg2rad(angleBoat));
  const vRiverX = vRiver; // River flows East
  const vRiverY = 0;
  
  const vResultBoatX = vBoatX + vRiverX;
  const vResultBoatY = vBoatY + vRiverY;
  const vResultBoatMag = Math.sqrt(vResultBoatX**2 + vResultBoatY**2);

  // Plane calculations
  const vPlaneX = vPlane * Math.cos(deg2rad(anglePlane));
  const vPlaneY = vPlane * Math.sin(deg2rad(anglePlane));
  const vWindX = vWind * Math.cos(deg2rad(angleWind));
  const vWindY = vWind * Math.sin(deg2rad(angleWind));

  const vResultPlaneX = vPlaneX + vWindX;
  const vResultPlaneY = vPlaneY + vWindY;
  const vResultPlaneMag = Math.sqrt(vResultPlaneX**2 + vResultPlaneY**2);

  // Calculate max time for animation
  let maxTime = 15;
  if (mode === 'boat') {
    if (vBoatY > 0) {
      // River width is 200px (y=300 to y=100), posScale is 15px per m
      maxTime = 200 / (vBoatY * 15);
    } else {
      maxTime = 15;
    }
  }

  useEffect(() => {
    if (isPlaying) {
      const animate = (t: number) => {
        if (!lastTimeRef.current) lastTimeRef.current = t;
        const dt = (t - lastTimeRef.current) / 1000;
        lastTimeRef.current = t;

        setTime(prev => {
          const newTime = prev + dt;
          // Stop when reaching the opposite bank (or after maxTime)
          if (newTime >= maxTime) {
            setIsPlaying(false);
            return maxTime;
          }
          return newTime;
        });

        reqRef.current = requestAnimationFrame(animate);
      };
      reqRef.current = requestAnimationFrame(animate);
    } else {
      lastTimeRef.current = 0;
    }
    return () => cancelAnimationFrame(reqRef.current);
  }, [isPlaying, maxTime]);

  // --- Drawing Helpers ---
  const drawArrow = (x: number, y: number, dx: number, dy: number, color: string, label: string) => {
    const endX = x + dx;
    const endY = y + dy; // dy is already adjusted for SVG coordinates in the caller
    const angle = Math.atan2(dy, dx);
    const headlen = 10;
    
    return (
      <g>
        <line x1={x} y1={y} x2={endX} y2={endY} stroke={color} strokeWidth="3" />
        <polygon 
          points={`
            ${endX},${endY} 
            ${endX - headlen * Math.cos(angle - Math.PI / 6)},${endY - headlen * Math.sin(angle - Math.PI / 6)} 
            ${endX - headlen * Math.cos(angle + Math.PI / 6)},${endY - headlen * Math.sin(angle + Math.PI / 6)}
          `} 
          fill={color} 
        />
        <text 
          x={endX + 10 * Math.cos(angle)} 
          y={endY + 10 * Math.sin(angle) + 5} 
          fill={color} 
          fontSize="14" 
          fontWeight="bold"
          textAnchor="middle"
        >
          {label}
        </text>
      </g>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 my-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h3 className="text-xl font-semibold text-slate-800">Interactive: Relative Motion & Velocity Addition</h3>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button 
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'boat' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            onClick={() => setMode('boat')}
          >
            Boat in River
          </button>
          <button 
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'plane' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            onClick={() => setMode('plane')}
          >
            Airplane in Wind
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-6">
          {mode === 'boat' ? (
            <>
              <p className="text-sm text-slate-600">
                A boat crosses a river. The river flows East. The boat's velocity relative to the water adds to the water's velocity relative to the shore to give the boat's actual velocity relative to the shore.
              </p>
              <BlockMath math="\vec{v}_{b/s} = \vec{v}_{b/w} + \vec{v}_{w/s}" />
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Boat Speed (<InlineMath math="v_{b/w}" />): {vBoat} m/s
                </label>
                <input type="range" min="0" max="15" step="1" value={vBoat} onChange={(e) => { setVBoat(Number(e.target.value)); reset(); }} className="w-full accent-blue-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Boat Heading Angle: {angleBoat}° (90° is North)
                </label>
                <input type="range" min="0" max="180" step="5" value={angleBoat} onChange={(e) => { setAngleBoat(Number(e.target.value)); reset(); }} className="w-full accent-blue-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  River Speed (<InlineMath math="v_{w/s}" />): {vRiver} m/s (East)
                </label>
                <input type="range" min="0" max="10" step="1" value={vRiver} onChange={(e) => { setVRiver(Number(e.target.value)); reset(); }} className="w-full accent-cyan-500" />
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Resultant Speed (<InlineMath math="v_{b/s}" />):</span>
                  <span className="font-mono font-bold text-red-600">{vResultBoatMag.toFixed(2)} m/s</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-slate-600">
                An airplane flies West while the wind blows Southeast. The plane's velocity relative to the air adds to the wind's velocity to give the plane's actual velocity relative to the ground.
              </p>
              <BlockMath math="\vec{v}_{p/g} = \vec{v}_{p/a} + \vec{v}_{w/g}" />
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Plane Speed (<InlineMath math="v_{p/a}" />): {vPlane} km/h
                </label>
                <input type="range" min="50" max="400" step="10" value={vPlane} onChange={(e) => { setVPlane(Number(e.target.value)); reset(); }} className="w-full accent-blue-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Plane Heading: {anglePlane}° (180° is West)
                </label>
                <input type="range" min="0" max="360" step="5" value={anglePlane} onChange={(e) => { setAnglePlane(Number(e.target.value)); reset(); }} className="w-full accent-blue-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Wind Speed (<InlineMath math="v_{w/g}" />): {vWind} km/h
                </label>
                <input type="range" min="0" max="150" step="5" value={vWind} onChange={(e) => { setVWind(Number(e.target.value)); reset(); }} className="w-full accent-cyan-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Wind Direction: {angleWind}° (315° is SE)
                </label>
                <input type="range" min="0" max="360" step="5" value={angleWind} onChange={(e) => { setAngleWind(Number(e.target.value)); reset(); }} className="w-full accent-cyan-500" />
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Resultant Speed (<InlineMath math="v_{p/g}" />):</span>
                  <span className="font-mono font-bold text-red-600">{vResultPlaneMag.toFixed(1)} km/h</span>
                </div>
              </div>
            </>
          )}

          <div className="flex gap-3">
            <button 
              onClick={() => setIsPlaying(!isPlaying)} 
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button 
              onClick={reset} 
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors border border-slate-200"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>

        {/* Visualization */}
        <div className="lg:col-span-2 bg-slate-50 rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center relative min-h-[400px]">
          {mode === 'boat' ? (
            <svg width="600" height="400" viewBox="0 0 600 400" className="w-full h-full">
              {/* River Background */}
              <rect x="0" y="100" width="600" height="200" fill="#bae6fd" />
              <line x1="0" y1="100" x2="600" y2="100" stroke="#64748b" strokeWidth="4" />
              <line x1="0" y1="300" x2="600" y2="300" stroke="#64748b" strokeWidth="4" />
              <text x="10" y="90" fill="#64748b" fontSize="14" fontWeight="bold">North Bank</text>
              <text x="10" y="320" fill="#64748b" fontSize="14" fontWeight="bold">South Bank</text>

              {/* Water flow lines */}
              {[130, 170, 210, 250, 290].map((y, i) => (
                <g key={i} opacity="0.5">
                  <line x1={(time * vRiver * 10 + i * 50) % 600} y1={y} x2={((time * vRiver * 10 + i * 50) % 600) + 20} y2={y} stroke="#0284c7" strokeWidth="2" />
                  <line x1={(time * vRiver * 10 + i * 50 + 300) % 600} y1={y} x2={((time * vRiver * 10 + i * 50 + 300) % 600) + 20} y2={y} stroke="#0284c7" strokeWidth="2" />
                </g>
              ))}

              {/* Boat Position */}
              {(() => {
                const scale = 15; // pixels per m/s for vectors
                const posScale = 15; // pixels per m for position
                const startX = 300;
                const startY = 300;
                const currentX = startX + vResultBoatX * time * posScale;
                const currentY = startY - vResultBoatY * time * posScale; // - because SVG y is down
                
                return (
                  <g>
                    {/* Trajectory */}
                    <line x1={startX} y1={startY} x2={currentX} y2={currentY} stroke="#fca5a5" strokeWidth="2" strokeDasharray="4,4" />
                    
                    {/* Boat */}
                    <g transform={`translate(${currentX}, ${currentY}) rotate(${90 - angleBoat})`}>
                      <path d="M -10 15 L 0 -15 L 10 15 Z" fill="#1e293b" />
                    </g>

                    {/* Vectors (Head to Tail) */}
                    {/* v_boat/water */}
                    {drawArrow(currentX, currentY, vBoatX * scale, -vBoatY * scale, '#3b82f6', 'v_b/w')}
                    {/* v_water/shore (starts from tip of v_boat/water) */}
                    {drawArrow(currentX + vBoatX * scale, currentY - vBoatY * scale, vRiverX * scale, -vRiverY * scale, '#06b6d4', 'v_w/s')}
                    {/* Resultant v_boat/shore */}
                    {drawArrow(currentX, currentY, vResultBoatX * scale, -vResultBoatY * scale, '#ef4444', 'v_b/s')}
                  </g>
                );
              })()}
            </svg>
          ) : (
            <svg width="600" height="400" viewBox="0 0 600 400" className="w-full h-full">
              {/* Sky Background */}
              <rect x="0" y="0" width="600" height="400" fill="#f1f5f9" />
              
              {/* Compass Rose */}
              <g transform="translate(50, 50)">
                <line x1="0" y1="-20" x2="0" y2="20" stroke="#94a3b8" strokeWidth="2" />
                <line x1="-20" y1="0" x2="20" y2="0" stroke="#94a3b8" strokeWidth="2" />
                <text x="-4" y="-25" fill="#64748b" fontSize="12" fontWeight="bold">N</text>
                <text x="25" y="4" fill="#64748b" fontSize="12" fontWeight="bold">E</text>
                <text x="-4" y="32" fill="#64748b" fontSize="12" fontWeight="bold">S</text>
                <text x="-35" y="4" fill="#64748b" fontSize="12" fontWeight="bold">W</text>
              </g>

              {/* Plane Position */}
              {(() => {
                const scale = 0.4; // pixels per km/h for vectors
                const posScale = 0.4; // pixels per km for position
                const startX = 450;
                const startY = 150;
                const currentX = startX + vResultPlaneX * time * posScale;
                const currentY = startY - vResultPlaneY * time * posScale; // - because SVG y is down
                
                return (
                  <g>
                    {/* Trajectory */}
                    <line x1={startX} y1={startY} x2={currentX} y2={currentY} stroke="#fca5a5" strokeWidth="2" strokeDasharray="4,4" />
                    
                    {/* Plane */}
                    <g transform={`translate(${currentX}, ${currentY}) rotate(${90 - anglePlane})`}>
                      <path d="M 0 -15 L 15 5 L 5 5 L 5 15 L -5 15 L -5 5 L -15 5 Z" fill="#475569" />
                    </g>

                    {/* Vectors (Head to Tail) */}
                    {/* v_plane/air */}
                    {drawArrow(currentX, currentY, vPlaneX * scale, -vPlaneY * scale, '#3b82f6', 'v_p/a')}
                    {/* v_wind/ground (starts from tip of v_plane/air) */}
                    {drawArrow(currentX + vPlaneX * scale, currentY - vPlaneY * scale, vWindX * scale, -vWindY * scale, '#06b6d4', 'v_w/g')}
                    {/* Resultant v_plane/ground */}
                    {drawArrow(currentX, currentY, vResultPlaneX * scale, -vResultPlaneY * scale, '#ef4444', 'v_p/g')}
                  </g>
                );
              })()}
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
