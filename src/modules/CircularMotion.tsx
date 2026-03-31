import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import { AIGenerator } from '../components/AIGenerator';
import { VisualizerCentripetal, VisualizerGravity } from '../components/InteractiveVisualizers';
import 'katex/dist/katex.min.css';

export function CircularMotion() {
  return (
    <div className="max-w-5xl mx-auto pb-12">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Circular Motion & Gravity</h1>
        <p className="text-lg text-slate-600">Centripetal acceleration, uniform circular motion, and Newton's law of universal gravitation.</p>
      </header>

      {/* Theoretical Summary */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
        <h2 className="text-2xl font-semibold text-slate-800 mb-6 border-b border-slate-100 pb-4">Theoretical Summary</h2>
        
        <div className="prose prose-slate max-w-none text-slate-700 space-y-6">
          <p>
            When an object moves in a circular path, its velocity vector is constantly changing direction, even if its speed is constant. This changing velocity means the object is accelerating. This acceleration is caused by a net force directed toward the center of the circle.
          </p>

          <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
            <h3 className="text-lg font-medium text-slate-800 mb-4">Uniform Circular Motion</h3>
            <p className="mb-4">
              <strong>Uniform circular motion</strong> occurs when an object travels in a circular path of radius <InlineMath math="r" /> at a constant speed <InlineMath math="v" />.
            </p>
            <p className="mb-4">
              The time it takes to complete one full revolution is called the <strong>period (<InlineMath math="T" />)</strong>. The speed can be expressed as the circumference divided by the period:
            </p>
            <BlockMath math="v = \frac{2\pi r}{T}" />
            <p className="mt-4 mb-4">
              The <strong>angular velocity (<InlineMath math="\omega" />)</strong> is the rate of change of the angular position (<InlineMath math="\theta" />) with respect to time, measured in radians per second (rad/s):
            </p>
            <BlockMath math="\omega = \frac{d\theta}{dt} = \frac{2\pi}{T} = \frac{v}{r}" />
          </div>

          <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
            <h3 className="text-lg font-medium text-slate-800 mb-4">Centripetal Acceleration and Force</h3>
            <p className="mb-4">
              Because the direction of the velocity vector is constantly changing, there must be an acceleration directed toward the center of the circle. This is called <strong>centripetal acceleration (<InlineMath math="a_c" />)</strong>.
            </p>
            <BlockMath math="a_c = \frac{v^2}{r} = \omega^2 r" />
            <p className="mt-4 mb-4">
              According to Newton's Second Law, this acceleration must be caused by a net force directed toward the center, called the <strong>centripetal force (<InlineMath math="F_c" />)</strong>. Note that "centripetal force" is not a new type of force, but rather the net sum of all forces (like tension, gravity, or friction) pointing toward the center.
            </p>
            <BlockMath math="\sum F_r = m a_c = m \frac{v^2}{r}" />
            
            <VisualizerCentripetal />
          </div>

          <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
            <h3 className="text-lg font-medium text-slate-800 mb-4">Centrifugal Force and Misconceptions</h3>
            <p className="mb-4">
              While <strong>centripetal force</strong> is a real net force directed toward the center of a circular path, <strong>centrifugal force</strong> is a "fictitious" or "pseudo" force.
            </p>
            <p className="mb-4">
              It appears only when we observe the motion from a <strong>non-inertial (rotating) reference frame</strong>. In this rotating frame, objects seem to be pushed outward away from the center with a centrifugal acceleration (<InlineMath math="a_{cf}" />).
            </p>
            <BlockMath math="F_{cf} = m a_{cf} = m \omega^2 r = m \frac{v^2}{r}" />
            <p className="mt-4 mb-4">
              <strong>Key differences and common misconceptions in physics problems:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-4">
              <li>
                <strong>Real vs. Fictitious:</strong> Centripetal force is a real physical force (like tension, gravity, or friction) exerted by one object on another. Centrifugal force is not exerted by any physical object; it is merely an effect of inertia observed in a rotating frame.
              </li>
              <li>
                <strong>Direction:</strong> Centripetal force points <em>inward</em> (toward the center). Centrifugal force points <em>outward</em> (away from the center).
              </li>
              <li>
                <strong>Action-Reaction Pair Misconception:</strong> A common mistake is thinking that centrifugal force is the Newton's Third Law reaction to centripetal force. <strong>This is incorrect.</strong> Action-reaction pairs act on different objects. Both centripetal and (pseudo) centrifugal forces act on the <em>same</em> object depending on the observer's frame of reference.
              </li>
              <li>
                <strong>When to use which:</strong> If you are solving a problem from the perspective of a stationary observer on the ground (inertial frame), <strong>never</strong> include centrifugal force. Only use centripetal force (<InlineMath math="\sum F = m a_c" />). If you are solving from the perspective of someone inside the rotating object (like inside a turning car), you can use centrifugal force to balance the equations (<InlineMath math="\sum F = 0" />).
              </li>
            </ul>
          </div>

          <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
            <h3 className="text-lg font-medium text-slate-800 mb-4">Newton's Law of Universal Gravitation</h3>
            <p className="mb-4">
              Every particle in the universe attracts every other particle with a force that is directly proportional to the product of their masses and inversely proportional to the square of the distance between their centers.
            </p>
            <BlockMath math="F_g = G \frac{m_1 m_2}{r^2}" />
            <p className="mt-4 mb-4">
              Where:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><InlineMath math="F_g" /> is the magnitude of the gravitational force.</li>
              <li><InlineMath math="G" /> is the universal gravitational constant (<InlineMath math="G \approx 6.674 \times 10^{-11} \text{ N}\cdot\text{m}^2/\text{kg}^2" />).</li>
              <li><InlineMath math="m_1" /> and <InlineMath math="m_2" /> are the masses of the two particles.</li>
              <li><InlineMath math="r" /> is the distance between their centers.</li>
            </ul>

            <VisualizerGravity />
          </div>

          <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
            <h3 className="text-lg font-medium text-slate-800 mb-4">Cosmic Velocities</h3>
            
            <h4 className="font-medium text-slate-800 mb-2">First Cosmic Velocity (<InlineMath math="v_1" />)</h4>
            <p className="mb-4">
              The first cosmic velocity is the minimum velocity required to impart to an object (e.g., a satellite) at the surface of the Earth (or a planet) so that it can orbit the planet in a circular path without falling back to the ground.
            </p>
            <p className="mb-2"><strong>Proof:</strong></p>
            <p className="mb-4">
              For an object to move in uniform circular motion around the Earth near its surface (orbital radius <InlineMath math="r \approx R_E" />), the gravitational force acts as the centripetal force:
            </p>
            <BlockMath math="F_g = F_c \implies G \frac{M_E m}{R_E^2} = m \frac{v_1^2}{R_E}" />
            <p className="mb-4">
              Canceling <InlineMath math="m" /> and <InlineMath math="R_E" />, we get:
            </p>
            <BlockMath math="v_1 = \sqrt{\frac{G M_E}{R_E}}" />
            <p className="mb-4">
              On the other hand, the acceleration due to gravity at the Earth's surface is <InlineMath math="g = \frac{G M_E}{R_E^2}" />, which implies <InlineMath math="G M_E = g R_E^2" />. Substituting this into the formula above:
            </p>
            <BlockMath math="v_1 = \sqrt{g R_E}" />
            <p className="mb-6 text-sm text-slate-600">
              For Earth (<InlineMath math="g \approx 9.8 \text{ m/s}^2" />, <InlineMath math="R_E \approx 6400 \text{ km}" />), we calculate <InlineMath math="v_1 \approx 7.9 \text{ km/s}" />.
            </p>

            <h4 className="font-medium text-slate-800 mb-2">Second Cosmic Velocity (<InlineMath math="v_2" />)</h4>
            <p className="mb-4">
              The second cosmic velocity (or escape velocity) is the minimum velocity required to impart to an object at the surface of the Earth so that it can completely overcome Earth's gravitational pull and escape to infinity (parabolic trajectory).
            </p>
            <p className="mb-2"><strong>Proof:</strong></p>
            <p className="mb-4">
              Using the law of conservation of mechanical energy. Choose the reference point for potential energy at infinity (<InlineMath math="U_\infty = 0" />). At infinity, for minimum velocity, the kinetic energy is also 0 (<InlineMath math="K_\infty = 0" />). Therefore, the total mechanical energy at infinity is 0.
            </p>
            <p className="mb-4">
              The mechanical energy at the Earth's surface must equal the mechanical energy at infinity:
            </p>
            <BlockMath math="E_{surface} = E_\infty \implies K_{surface} + U_{surface} = 0" />
            <BlockMath math="\frac{1}{2} m v_2^2 - G \frac{M_E m}{R_E} = 0" />
            <p className="mb-4">
              Solving the equation for <InlineMath math="v_2" />:
            </p>
            <BlockMath math="v_2 = \sqrt{\frac{2 G M_E}{R_E}} = \sqrt{2 g R_E}" />
            <p className="mb-4 text-sm text-slate-600">
              The relationship between the first and second cosmic velocities: <InlineMath math="v_2 = \sqrt{2} v_1" />. For Earth, <InlineMath math="v_2 \approx 11.2 \text{ km/s}" />.
            </p>
          </div>

          <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
            <h3 className="text-lg font-medium text-slate-800 mb-4">Variation of g with Altitude</h3>
            <p className="mb-4">
              The acceleration due to gravity (<InlineMath math="g" />) is not constant; it decreases as you move further away from the center of the Earth.
            </p>
            <p className="mb-4">
              On the surface of the Earth (radius <InlineMath math="R_E" />, mass <InlineMath math="M_E" />), the gravitational acceleration is:
            </p>
            <BlockMath math="g_0 = G \frac{M_E}{R_E^2} \approx 9.8 \text{ m/s}^2" />
            <p className="mt-4 mb-4">
              At an altitude <InlineMath math="h" /> above the Earth's surface, the distance from the center becomes <InlineMath math="r = R_E + h" />. The new gravitational acceleration <InlineMath math="g_h" /> is:
            </p>
            <BlockMath math="g_h = G \frac{M_E}{(R_E + h)^2}" />
            <p className="mt-4 mb-4">
              We can express <InlineMath math="g_h" /> in terms of the surface gravity <InlineMath math="g_0" />:
            </p>
            <BlockMath math="g_h = g_0 \left( \frac{R_E}{R_E + h} \right)^2" />
            <p className="mt-4 text-sm text-slate-600">
              <strong>Note:</strong> For small altitudes where <InlineMath math="h \ll R_E" />, this can be approximated using the binomial expansion as <InlineMath math="g_h \approx g_0 \left(1 - \frac{2h}{R_E}\right)" />.
            </p>
          </div>

          <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
            <h3 className="text-lg font-medium text-slate-800 mb-4">Orbital Motion</h3>
            <p className="mb-4">
              When a smaller body (like a satellite or a planet) orbits a much larger body (like the Earth or the Sun) in a circular path, the gravitational force provides the necessary centripetal force.
            </p>
            <BlockMath math="G \frac{M m}{r^2} = m \frac{v^2}{r}" />
            <p className="mt-4 mb-4">
              From this, we can derive the <strong>orbital speed (<InlineMath math="v" />)</strong> of the satellite:
            </p>
            <BlockMath math="v = \sqrt{\frac{GM}{r}}" />
            <p className="mt-4 mb-4">
              And the <strong>orbital period (<InlineMath math="T" />)</strong> (Kepler's Third Law for circular orbits):
            </p>
            <BlockMath math="T^2 = \left( \frac{4\pi^2}{GM} \right) r^3" />
          </div>

        </div>
      </section>

      {/* AI Problem Generator */}
      <AIGenerator topic="Circular Motion and Universal Gravitation" />
    </div>
  );
}
