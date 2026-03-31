import React, { useState } from 'react';
import { Sidebar, ModuleId } from './components/Sidebar';
import { Motion1D } from './modules/Motion1D';
import { Motion2D } from './modules/Motion2D';
import { LawsOfMotion } from './modules/LawsOfMotion';
import { WorkEnergy } from './modules/WorkEnergy';
import { MomentumCollisions } from './modules/MomentumCollisions';
import { CircularMotion } from './modules/CircularMotion';
import { RigidBodyDynamics } from './modules/RigidBodyDynamics';
import { OscillationsWaves } from './modules/OscillationsWaves';
import { ErrorAnalysis } from './modules/ErrorAnalysis';

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleId>('2d');

  const renderModule = () => {
    switch (activeModule) {
      case '1d': return <Motion1D />;
      case '2d': return <Motion2D />;
      case 'laws': return <LawsOfMotion />;
      case 'energy': return <WorkEnergy />;
      case 'momentum': return <MomentumCollisions />;
      case 'circular': return <CircularMotion />;
      case 'rigid': return <RigidBodyDynamics />;
      case 'oscillations': return <OscillationsWaves />;
      case 'error': return <ErrorAnalysis />;
      default: return <Motion2D />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar activeModule={activeModule} onSelectModule={setActiveModule} />
      
      <main className="flex-1 overflow-y-auto h-screen p-8 md:p-12">
        {renderModule()}
      </main>
    </div>
  );
}
