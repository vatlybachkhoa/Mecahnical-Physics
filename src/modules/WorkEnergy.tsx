import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import { AIGenerator } from '../components/AIGenerator';
import { VisualizerEnergy, VisualizerWork } from '../components/InteractiveVisualizers';
import { SimulationPendulum } from '../components/SimulationPendulum';
import { SimulationVerticalCircle } from '../components/SimulationVerticalCircle';
import 'katex/dist/katex.min.css';

export function WorkEnergy() {
  return (
    <div className="max-w-5xl mx-auto pb-12">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Work and Energy</h1>
        <p className="text-lg text-slate-600">Kinetic energy, potential energy, and conservation of energy.</p>
      </header>

      {/* Theoretical Summary */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
        <h2 className="text-2xl font-semibold text-slate-800 mb-6 border-b border-slate-100 pb-4">Theoretical Summary</h2>
        
        <div className="prose prose-slate max-w-none text-slate-700 space-y-6">
          <p>
            The concepts of work and energy provide an alternative and often simpler approach to solving mechanics problems compared to Newton's laws, especially when dealing with varying forces or complex paths. Energy is a scalar quantity, which makes the mathematics much easier than dealing with vectors.
          </p>

          <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
            <h3 className="text-lg font-medium text-slate-800 mb-4">Work Done by a Force</h3>
            <p className="mb-4">
              <strong>Work (<InlineMath math="W" />)</strong> is done by a force when it causes a displacement. For a constant force <InlineMath math="\vec{F}" /> causing a displacement <InlineMath math="\Delta \vec{r}" />, work is the dot product of the two vectors:
            </p>
            <BlockMath math="W = \vec{F} \cdot \Delta \vec{r} = F \Delta r \cos(\theta)" />
            <p className="mt-4 mb-4">
              Where <InlineMath math="\theta" /> is the angle between the force and displacement vectors. For a varying force along a path from point A to point B, work is the line integral:
            </p>
            <BlockMath math="W = \int_{A}^{B} \vec{F} \cdot d\vec{r}" />
            
            <VisualizerWork />
          </div>

          <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
            <h3 className="text-lg font-medium text-slate-800 mb-4">Kinetic Energy & The Work-Energy Theorem</h3>
            <p className="mb-4">
              <strong>Kinetic Energy (<InlineMath math="K" />)</strong> is the energy an object possesses due to its motion.
            </p>
            <BlockMath math="K = \frac{1}{2}mv^2" />
            <p className="mt-4 mb-4">
              The <strong>Work-Kinetic Energy Theorem</strong> states that the net work done on an object by all forces equals the change in its kinetic energy:
            </p>
            <BlockMath math="W_{net} = \Delta K = K_f - K_i = \frac{1}{2}mv_f^2 - \frac{1}{2}mv_i^2" />
          </div>

          <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
            <h3 className="text-lg font-medium text-slate-800 mb-4">Potential Energy</h3>
            <p className="mb-4">
              <strong>Potential Energy (<InlineMath math="U" />)</strong> is the energy associated with the configuration of a system of objects that exert forces on each other. It is only defined for <em>conservative forces</em> (like gravity and spring forces). The change in potential energy is the negative of the work done by the conservative force:
            </p>
            <BlockMath math="\Delta U = -W_c = -\int_{A}^{B} \vec{F}_c \cdot d\vec{r}" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="bg-white p-4 rounded border border-slate-200">
                <h4 className="font-medium text-slate-800 mb-2">Gravitational Potential Energy</h4>
                <p className="text-sm text-slate-600 mb-2">Near the Earth's surface:</p>
                <BlockMath math="U_g = mgh" />
              </div>
              <div className="bg-white p-4 rounded border border-slate-200">
                <h4 className="font-medium text-slate-800 mb-2">Elastic Potential Energy</h4>
                <p className="text-sm text-slate-600 mb-2">For an ideal spring (Hooke's Law):</p>
                <BlockMath math="U_s = \frac{1}{2}kx^2" />
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
            <h3 className="text-lg font-medium text-slate-800 mb-4">Conservation of Mechanical Energy</h3>
            <p className="mb-4">
              The <strong>Mechanical Energy (<InlineMath math="E" />)</strong> of a system is the sum of its kinetic and potential energies:
            </p>
            <BlockMath math="E = K + U" />
            <p className="mt-4 mb-4">
              If only conservative forces do work on a system, the total mechanical energy is conserved (remains constant):
            </p>
            <BlockMath math="E_i = E_f \implies K_i + U_i = K_f + U_f" />
            
            <VisualizerEnergy />
            
            <p className="mt-4 mb-4">
              If non-conservative forces (like friction or applied forces) do work, the work done by these forces equals the change in total mechanical energy:
            </p>
            <BlockMath math="W_{nc} = \Delta E = (K_f + U_f) - (K_i + U_i)" />
            
            <SimulationPendulum />
            <SimulationVerticalCircle />
          </div>

        </div>
      </section>

      {/* AI Problem Generator */}
      <AIGenerator topic="Work, Energy, and Conservation of Energy" />
    </div>
  );
}
