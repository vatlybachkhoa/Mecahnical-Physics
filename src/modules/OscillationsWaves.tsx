import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import { AIGenerator } from '../components/AIGenerator';
import { SimulationOscillation } from '../components/SimulationOscillation';
import { SimulationResonance } from '../components/SimulationResonance';
import { SimulationDoppler } from '../components/SimulationDoppler';
import 'katex/dist/katex.min.css';

export function OscillationsWaves() {
  return (
    <div className="max-w-5xl mx-auto pb-12">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Oscillations and Mechanical Waves</h1>
        <p className="text-lg text-slate-600">Simple harmonic motion, pendulums, and properties of mechanical waves.</p>
      </header>

      {/* Theoretical Summary */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
        <h2 className="text-2xl font-semibold text-slate-800 mb-6 border-b border-slate-100 pb-4">Theoretical Summary</h2>
        
        <div className="prose prose-slate max-w-none text-slate-700 space-y-6">
          <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
            <h3 className="text-lg font-medium text-slate-800 mb-4">Simple Harmonic Motion (SHM)</h3>
            <p className="mb-4">
              <strong>Simple Harmonic Motion</strong> occurs when the restoring force is directly proportional to the displacement from equilibrium.
            </p>
            <BlockMath math="F = -kx" />
            <p className="mt-4 mb-4">
              The position of an object in SHM as a function of time is given by:
            </p>
            <BlockMath math="x(t) = A \cos(\omega t + \phi)" />
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><InlineMath math="A" />: Amplitude - maximum displacement.</li>
              <li><InlineMath math="\omega" />: Angular frequency, <InlineMath math="\omega = \sqrt{\frac{k}{m}}" /> for a spring.</li>
              <li><InlineMath math="\phi" />: Phase constant.</li>
            </ul>
            <p className="mt-4 mb-4">
              The period (<InlineMath math="T" />) and frequency (<InlineMath math="f" />) are related to angular frequency:
            </p>
            <BlockMath math="T = \frac{2\pi}{\omega} = 2\pi\sqrt{\frac{m}{k}} \quad ; \quad f = \frac{1}{T} = \frac{\omega}{2\pi}" />
          </div>

          <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
            <h3 className="text-lg font-medium text-slate-800 mb-4">The Simple Pendulum</h3>
            <p className="mb-4">
              A simple pendulum consists of a mass <InlineMath math="m" /> suspended by a light string of length <InlineMath math="L" />. For small angles (<InlineMath math="\theta < 10^\circ" />), its motion approximates SHM.
            </p>
            <BlockMath math="T = 2\pi\sqrt{\frac{L}{g}}" />
            <p className="mt-4 text-sm text-slate-500">
              Notice that the period of a simple pendulum is independent of its mass and amplitude (for small swings).
            </p>
            <div className="mt-6 bg-indigo-50 border border-indigo-100 p-4 rounded-lg">
              <h4 className="font-medium text-indigo-900 mb-2">Real-World Application: Grandfather Clocks</h4>
              <p className="text-sm text-indigo-800">
                Because the period of a pendulum depends only on its length and gravity, it serves as an excellent timekeeping device. Even as friction slowly decreases the amplitude of the swing (damping), the time it takes to complete one full swing (the period) remains remarkably constant. This property, discovered by Galileo, is called <strong>isochronism</strong>.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
            <h3 className="text-lg font-medium text-slate-800 mb-4">Damped Mechanical Oscillations</h3>
            <p className="mb-4">
              In real systems, non-conservative forces like friction or air drag dissipate energy, causing the amplitude of oscillation to decrease over time. This is called <strong>damped oscillation</strong>.
            </p>
            <p className="mb-4">
              If the damping force is proportional to velocity (<InlineMath math="F_d = -bv" />, where <InlineMath math="b" /> is the damping coefficient), the equation of motion is:
            </p>
            <BlockMath math="m\frac{d^2x}{dt^2} + b\frac{dx}{dt} + kx = 0" />
            <p className="mt-4 mb-4">
              Depending on the value of <InlineMath math="b" />, there are three regimes:
            </p>
            <ul className="list-disc pl-6 space-y-4 mb-4">
              <li>
                <strong>Underdamped:</strong> <InlineMath math="b < 2\sqrt{mk}" />. The system oscillates with a gradually decreasing amplitude.
              </li>
              <li>
                <strong>Critically Damped:</strong> <InlineMath math="b = 2\sqrt{mk}" />. The system returns to equilibrium as quickly as possible without oscillating.
              </li>
              <li>
                <strong>Overdamped:</strong> <InlineMath math="b > 2\sqrt{mk}" />. The system returns to equilibrium slowly without oscillating.
              </li>
            </ul>
            <div className="mt-6 bg-indigo-50 border border-indigo-100 p-4 rounded-lg">
              <h4 className="font-medium text-indigo-900 mb-2">Real-World Application: Car Suspension Systems</h4>
              <p className="text-sm text-indigo-800">
                A car's suspension uses both springs and shock absorbers (dampers). When you hit a bump, the spring compresses to absorb the impact. If there were no shock absorbers, the car would bounce up and down for a long time (underdamped). The shock absorbers provide a damping force (usually via fluid friction) designed to make the system <strong>critically damped</strong> or slightly underdamped, so the car returns to its normal height quickly and smoothly without excessive bouncing.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
            <h3 className="text-lg font-medium text-slate-800 mb-4">Mechanical Waves & Resonance</h3>
            <p className="mb-4">
              A mechanical wave is a disturbance that travels through a medium, transferring energy without permanently displacing the medium itself.
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Transverse Waves:</strong> The particles of the medium oscillate perpendicular to the direction of wave propagation (e.g., waves on a string).</li>
              <li><strong>Longitudinal Waves:</strong> The particles oscillate parallel to the direction of propagation (e.g., sound waves).</li>
            </ul>
            <p className="mb-4">
              The wave speed (<InlineMath math="v" />) is determined by the medium's properties and relates wavelength (<InlineMath math="\lambda" />) and frequency (<InlineMath math="f" />):
            </p>
            <BlockMath math="v = \lambda f = \frac{\lambda}{T}" />
            
            <div className="mt-6 bg-indigo-50 border border-indigo-100 p-4 rounded-lg">
              <h4 className="font-medium text-indigo-900 mb-2">Wave Phenomenon: Resonance</h4>
              <p className="text-sm text-indigo-800 mb-2">
                Every physical system has a <strong>natural frequency</strong> at which it "prefers" to oscillate. If an external driving force is applied to the system at a frequency that matches this natural frequency, the amplitude of oscillation increases dramatically. This is called resonance.
              </p>
              <ul className="list-disc pl-5 text-sm text-indigo-800 space-y-1">
                <li><strong>Pushing a swing:</strong> Pushing a child on a swing at exactly the right moment (matching the swing's natural frequency) makes them go higher with very little effort.</li>
                <li><strong>Shattering a glass:</strong> A singer can shatter a wine glass by singing a loud, sustained note that perfectly matches the glass's natural resonant frequency.</li>
                <li><strong>Structural engineering:</strong> Buildings and bridges must be designed so their natural frequencies do not match the frequencies of common earthquakes or high winds (e.g., the famous collapse of the Tacoma Narrows Bridge).</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Simulations */}
      <SimulationOscillation />
      <SimulationResonance />
      <SimulationDoppler />

      {/* AI Problem Generator */}
      <AIGenerator topic="Oscillations and Mechanical Waves" />
    </div>
  );
}
