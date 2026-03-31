import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import { AIGenerator } from '../components/AIGenerator';
import { SimulationCollision } from '../components/SimulationCollision';
import { SimulationWallCollision } from '../components/SimulationWallCollision';
import { VisualizerMomentum, VisualizerImpulse } from '../components/InteractiveVisualizers';
import 'katex/dist/katex.min.css';

export function MomentumCollisions() {
  return (
    <div className="max-w-5xl mx-auto pb-12">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Momentum and Collisions</h1>
        <p className="text-lg text-slate-600">Linear momentum, impulse, and elastic/inelastic collisions.</p>
      </header>

      {/* Theoretical Summary */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
        <h2 className="text-2xl font-semibold text-slate-800 mb-6 border-b border-slate-100 pb-4">Theoretical Summary</h2>
        
        <div className="prose prose-slate max-w-none text-slate-700 space-y-6">
          <p>
            Momentum is a fundamental concept in physics that describes the "quantity of motion" an object has. It is particularly useful for analyzing collisions and explosions where forces are complex and act over very short time intervals.
          </p>

          <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
            <h3 className="text-lg font-medium text-slate-800 mb-4">Linear Momentum</h3>
            <p className="mb-4">
              The <strong>linear momentum (<InlineMath math="\vec{p}" />)</strong> of a particle is defined as the product of its mass (<InlineMath math="m" />) and its velocity (<InlineMath math="\vec{v}" />). It is a vector quantity pointing in the same direction as the velocity.
            </p>
            <BlockMath math="\vec{p} = m\vec{v}" />
            <p className="mt-4 mb-4">
              Newton's Second Law can be expressed more generally in terms of momentum: The net external force acting on a particle is equal to the time rate of change of its linear momentum.
            </p>
            <BlockMath math="\sum \vec{F} = \frac{d\vec{p}}{dt}" />
          </div>

          <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
            <h3 className="text-lg font-medium text-slate-800 mb-4">Impulse and Momentum</h3>
            <p className="mb-4">
              <strong>Impulse (<InlineMath math="\vec{J}" />)</strong> is the integral of a force over the time interval during which it acts. It measures the overall effect of a force acting over time.
            </p>
            <BlockMath math="\vec{J} = \int_{t_i}^{t_f} \vec{F} \, dt" />
            <p className="mt-4 mb-4">
              The <strong>Impulse-Momentum Theorem</strong> states that the impulse of the net force acting on a particle equals the change in momentum of the particle:
            </p>
            <BlockMath math="\vec{J} = \Delta \vec{p} = \vec{p}_f - \vec{p}_i" />
            <p className="mt-4 mb-6 text-sm text-slate-500">
              For a constant average force <InlineMath math="\vec{F}_{avg}" /> acting over a time interval <InlineMath math="\Delta t" />, the impulse is <InlineMath math="\vec{J} = \vec{F}_{avg} \Delta t" />. Graphically, impulse is the area under the Force-Time graph.
            </p>
            
            <VisualizerImpulse />
          </div>

          <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
            <h3 className="text-lg font-medium text-slate-800 mb-4">Conservation of Linear Momentum</h3>
            <p className="mb-4">
              If the net external force acting on a system of particles is zero, the total linear momentum of the system is conserved (remains constant).
            </p>
            <BlockMath math="\sum \vec{F}_{ext} = 0 \implies \vec{p}_{total, i} = \vec{p}_{total, f}" />
            <p className="mt-4 mb-4">
              For a two-particle system, this means:
            </p>
            <BlockMath math="m_1\vec{v}_{1i} + m_2\vec{v}_{2i} = m_1\vec{v}_{1f} + m_2\vec{v}_{2f}" />
            
            <VisualizerMomentum />
          </div>

          <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
            <h3 className="text-lg font-medium text-slate-800 mb-4">Collisions</h3>
            <p className="mb-4">
              In any collision between isolated objects, the total momentum of the system is conserved. However, kinetic energy may or may not be conserved.
            </p>
            
            <div className="space-y-6 mt-4">
              <div className="bg-white p-4 rounded border border-slate-200">
                <h4 className="font-medium text-slate-800 mb-2">1. Elastic Collisions</h4>
                <p className="text-sm text-slate-600 mb-2">Both total momentum and total kinetic energy are conserved. Objects bounce off each other without any loss of energy to heat or deformation.</p>
                <BlockMath math="m_1\vec{v}_{1i} + m_2\vec{v}_{2i} = m_1\vec{v}_{1f} + m_2\vec{v}_{2f}" />
                <BlockMath math="\frac{1}{2}m_1v_{1i}^2 + \frac{1}{2}m_2v_{2i}^2 = \frac{1}{2}m_1v_{1f}^2 + \frac{1}{2}m_2v_{2f}^2" />
              </div>
              
              <div className="bg-white p-4 rounded border border-slate-200">
                <h4 className="font-medium text-slate-800 mb-2">2. Inelastic Collisions</h4>
                <p className="text-sm text-slate-600 mb-2">Total momentum is conserved, but total kinetic energy is <strong>not</strong> conserved. Some kinetic energy is transformed into other forms of energy (like heat or sound).</p>
                <BlockMath math="m_1\vec{v}_{1i} + m_2\vec{v}_{2i} = m_1\vec{v}_{1f} + m_2\vec{v}_{2f}" />
                <BlockMath math="K_i > K_f" />
              </div>

              <div className="bg-white p-4 rounded border border-slate-200">
                <h4 className="font-medium text-slate-800 mb-2">3. Perfectly Inelastic Collisions</h4>
                <p className="text-sm text-slate-600 mb-2">A special case of inelastic collision where the objects stick together after the collision and move with a common final velocity <InlineMath math="\vec{v}_f" />. This type of collision results in the maximum possible loss of kinetic energy.</p>
                <BlockMath math="m_1\vec{v}_{1i} + m_2\vec{v}_{2i} = (m_1 + m_2)\vec{v}_f" />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Interactive Simulation */}
      <SimulationCollision />

      {/* Wall Collision Simulation */}
      <SimulationWallCollision />

      {/* AI Problem Generator */}
      <AIGenerator topic="Linear Momentum, Impulse, and Collisions" />
    </div>
  );
}
