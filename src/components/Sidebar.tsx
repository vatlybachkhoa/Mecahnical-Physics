import React from 'react';
import { 
  ArrowRightLeft, 
  MoveUpRight, 
  Scale, 
  Zap, 
  CarFront, 
  Orbit,
  Activity,
  Waves,
  Disc
} from 'lucide-react';

export type ModuleId = '1d' | '2d' | 'laws' | 'energy' | 'momentum' | 'circular' | 'rigid' | 'oscillations' | 'error';

interface SidebarProps {
  activeModule: ModuleId;
  onSelectModule: (id: ModuleId) => void;
}

export function Sidebar({ activeModule, onSelectModule }: SidebarProps) {
  const modules = [
    { id: '1d', label: 'Motion in One Dimension', icon: ArrowRightLeft },
    { id: '2d', label: 'Two-Dimensional Motion', icon: MoveUpRight },
    { id: 'laws', label: 'The Laws of Motion', icon: Scale },
    { id: 'energy', label: 'Work and Energy', icon: Zap },
    { id: 'momentum', label: 'Momentum and Collisions', icon: CarFront },
    { id: 'circular', label: 'Circular Motion & Gravity', icon: Orbit },
    { id: 'rigid', label: 'Rigid Body Dynamics', icon: Disc },
    { id: 'oscillations', label: 'Oscillations & Waves', icon: Waves },
    { id: 'error', label: 'Error Analysis', icon: Activity },
  ] as const;

  return (
    <div className="w-72 bg-slate-900 h-screen flex flex-col text-slate-300 flex-shrink-0 sticky top-0">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white flex items-center gap-3">
          <span className="bg-indigo-600 text-white p-2 rounded-lg">
            <Orbit className="w-5 h-5" />
          </span>
          Physics Mechanics
        </h1>
        <p className="text-sm text-slate-500 mt-2">University General Physics</p>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-6 px-4">
        <ul className="space-y-2">
          {modules.map((mod) => {
            const Icon = mod.icon;
            const isActive = activeModule === mod.id;
            return (
              <li key={mod.id}>
                <button
                  onClick={() => onSelectModule(mod.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left ${
                    isActive 
                      ? 'bg-indigo-600/10 text-indigo-400 font-medium' 
                      : 'hover:bg-slate-800 hover:text-slate-100'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                  {mod.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-6 border-t border-slate-800 text-xs text-slate-500">
        <p>Built with React & Tailwind</p>
        <p className="mt-1">Powered by Gemini AI</p>
      </div>
    </div>
  );
}
