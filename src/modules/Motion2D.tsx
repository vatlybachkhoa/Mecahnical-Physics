import React, { useState } from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import { Simulation2D } from '../components/Simulation2D';
import { SimulationMovingCart } from '../components/SimulationMovingCart';
import { SimulationRelativeMotion } from '../components/SimulationRelativeMotion';
import { SimulationRocketLaunch } from '../components/SimulationRocketLaunch';
import { SimulationCycloid } from '../components/SimulationCycloid';
import { SimulationSpiral } from '../components/SimulationSpiral';
import { SimulationSoccerPass } from '../components/SimulationSoccerPass';
import { AIGenerator } from '../components/AIGenerator';
import 'katex/dist/katex.min.css';

export function Motion2D() {
  const [velocity, setVelocity] = useState(20);
  const [angle, setAngle] = useState(45);
  const [gravity, setGravity] = useState(9.81);
  const [mass, setMass] = useState(1);
  const [initialHeight, setInitialHeight] = useState(0);

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Two-Dimensional Motion</h1>
        <p className="text-lg text-slate-600">Explore projectile motion, trajectory equations, and vector kinematics.</p>
      </header>

      {/* Theoretical Summary */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
        <h2 className="text-2xl font-semibold text-slate-800 mb-6 border-b border-slate-100 pb-4">Theoretical Summary</h2>
        
        <div className="prose prose-slate max-w-none text-slate-700 space-y-6">
          <p>
            In two-dimensional projectile motion, an object is launched into the air and moves along a curved path under the influence of gravity alone. The horizontal and vertical motions are independent of each other.
          </p>

          <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
            <h3 className="text-lg font-medium text-slate-800 mb-4">Position Vectors</h3>
            <p className="mb-4">The position vector <InlineMath math="\vec{r}" /> at any time <InlineMath math="t" /> is given by:</p>
            <BlockMath math="\vec{r}(t) = x(t)\hat{i} + y(t)\hat{j}" />
            <p className="mt-4 mb-2">Where the components are:</p>
            <BlockMath math="x(t) = v_0 \cos(\theta_0) t" />
            <BlockMath math="y(t) = v_0 \sin(\theta_0) t - \frac{1}{2}gt^2" />
          </div>

          <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
            <h3 className="text-lg font-medium text-slate-800 mb-4">Velocity Vectors</h3>
            <p className="mb-4">The velocity vector <InlineMath math="\vec{v}" /> is the derivative of the position vector:</p>
            <BlockMath math="\vec{v}(t) = \frac{d\vec{r}}{dt} = v_x(t)\hat{i} + v_y(t)\hat{j}" />
            <p className="mt-4 mb-2">With components:</p>
            <BlockMath math="v_x(t) = v_0 \cos(\theta_0)" />
            <BlockMath math="v_y(t) = v_0 \sin(\theta_0) - gt" />
          </div>

          <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
            <h3 className="text-lg font-medium text-slate-800 mb-4">Trajectory Equation</h3>
            <p className="mb-4">By eliminating time <InlineMath math="t" /> from the position equations, we get the parabolic equation of the trajectory:</p>
            <BlockMath math="y(x) = (\tan \theta_0)x - \frac{g}{2(v_0 \cos \theta_0)^2}x^2" />
          </div>

          <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
            <h3 className="text-lg font-medium text-slate-800 mb-4">Relative Motion in Two Dimensions</h3>
            <p className="mb-4">
              Relative motion describes how the motion of an object appears to an observer in a different frame of reference. In two dimensions, this is analyzed using vector addition and subtraction.
            </p>
            <p className="mb-4">
              If object A is moving with velocity <InlineMath math="\vec{v}_A" /> and object B is moving with velocity <InlineMath math="\vec{v}_B" /> (both measured relative to the ground or a stationary frame), the velocity of object A relative to object B is denoted as <InlineMath math="\vec{v}_{A/B}" /> and is given by:
            </p>
            <BlockMath math="\vec{v}_{A/B} = \vec{v}_A - \vec{v}_B" />
            <p className="mt-4 mb-4">
              Alternatively, the velocity of a particle P relative to frame A can be found if we know its velocity relative to frame B and the velocity of frame B relative to frame A:
            </p>
            <BlockMath math="\vec{v}_{P/A} = \vec{v}_{P/B} + \vec{v}_{B/A}" />
            <p className="mt-4 text-sm text-slate-600">
              A common example is a boat crossing a river. The boat's velocity relative to the shore (<InlineMath math="\vec{v}_{boat/shore}" />) is the vector sum of the boat's velocity relative to the water (<InlineMath math="\vec{v}_{boat/water}" />) and the water's velocity relative to the shore (<InlineMath math="\vec{v}_{water/shore}" />).
            </p>
            
            <div className="mt-8">
              <SimulationRelativeMotion />
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
            <h3 className="text-lg font-medium text-slate-800 mb-4">Real-World Motions: Pulleys</h3>
            <p className="mb-4">
              Pulleys are simple machines used to change the direction of a force or to gain a mechanical advantage. They are common in 2D motion problems involving connected objects.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded border border-slate-200">
                <h4 className="font-semibold text-slate-800 mb-2">Fixed Pulley</h4>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li><strong>Function:</strong> Changes the direction of the applied force.</li>
                  <li><strong>Mechanical Advantage:</strong> 1 (No force multiplication).</li>
                  <li><strong>Tension (<InlineMath math="T" />):</strong> Uniform throughout the ideal (massless, frictionless) string.</li>
                  <li><strong>Displacement:</strong> If you pull the rope down by distance <InlineMath math="d" />, the load moves up by distance <InlineMath math="d" />.</li>
                  <li><strong>Equation (Equilibrium):</strong> <InlineMath math="F_{pull} = T = mg" /></li>
                </ul>
              </div>
              <div className="bg-white p-4 rounded border border-slate-200">
                <h4 className="font-semibold text-slate-800 mb-2">Movable Pulley</h4>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li><strong>Function:</strong> Multiplies the applied force (Mechanical Advantage = 2).</li>
                  <li><strong>Tension (<InlineMath math="T" />):</strong> The load is supported by <em>two</em> segments of the rope.</li>
                  <li><strong>Displacement:</strong> To lift the load by distance <InlineMath math="h" />, you must pull the rope by distance <InlineMath math="2h" />.</li>
                  <li><strong>Velocity/Acceleration:</strong> The acceleration of the load is half the acceleration of the pulled rope end (<InlineMath math="a_{load} = \frac{1}{2}a_{rope}" />).</li>
                  <li><strong>Equation (Equilibrium):</strong> <InlineMath math="2T = mg \implies F_{pull} = T = \frac{mg}{2}" /></li>
                </ul>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-600">
              <strong>Atwood Machine:</strong> A classic system with two masses (<InlineMath math="m_1" />, <InlineMath math="m_2" />) over a fixed pulley. The common acceleration is <InlineMath math="a = g\frac{|m_1 - m_2|}{m_1 + m_2}" /> and tension is <InlineMath math="T = \frac{2m_1m_2g}{m_1 + m_2}" />.
            </p>
          </div>
        </div>
      </section>

      {/* Simulation Controls */}
      <section className="mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h3 className="text-xl font-semibold text-slate-800 mb-6">Simulation Parameters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Initial Velocity (<InlineMath math="v_0" />): {velocity} m/s
              </label>
              <input 
                type="range" 
                min="1" 
                max="50" 
                value={velocity} 
                onChange={(e) => setVelocity(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Launch Angle (<InlineMath math="\theta_0" />): {angle}°
              </label>
              <input 
                type="range" 
                min="-90" 
                max="90" 
                value={angle} 
                onChange={(e) => setAngle(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Initial Height (<InlineMath math="h_0" />): {initialHeight} m
              </label>
              <input 
                type="range" 
                min="0" 
                max="100" 
                step="1"
                value={initialHeight} 
                onChange={(e) => setInitialHeight(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Gravity (<InlineMath math="g" />): {gravity} m/s²
              </label>
              <input 
                type="range" 
                min="1" 
                max="25" 
                step="0.1"
                value={gravity} 
                onChange={(e) => setGravity(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Mass (<InlineMath math="m" />): {mass} kg
              </label>
              <input 
                type="range" 
                min="0.1" 
                max="10" 
                step="0.1"
                value={mass} 
                onChange={(e) => setMass(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>
          </div>
        </div>

        <Simulation2D 
          initialVelocity={velocity} 
          angle={angle} 
          gravity={gravity} 
          mass={mass} 
          initialHeight={initialHeight}
        />
      </section>

      {/* Moving Cart Simulation */}
      <section className="mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-slate-800 mb-6 border-b border-slate-100 pb-2">Independence of Motion: The Moving Cart Problem</h2>
          <div className="prose prose-slate max-w-none">
            <p className="mb-4">
              A classic demonstration of the independence of horizontal and vertical motion involves a cart moving horizontally at a constant velocity (<InlineMath math="v_0" />). The cart fires a projectile straight up (relative to the cart) with an initial vertical velocity (<InlineMath math="v_{y0}" />).
            </p>
            <p className="mb-4">
              <strong>Will the projectile land behind the cart, in front of the cart, or back inside the cart?</strong>
            </p>
            <p className="mb-4">
              Because the projectile was moving horizontally with the cart before it was launched, it retains that horizontal velocity (<InlineMath math="v_x = v_0" />) due to inertia (assuming no air resistance). 
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Horizontal Motion:</strong> Both the cart and the projectile move horizontally at the exact same constant speed <InlineMath math="v_0" />. Therefore, at any time <InlineMath math="t" />, their horizontal positions are identical: <InlineMath math="x_{cart} = x_{projectile} = v_0 t" />.</li>
              <li><strong>Vertical Motion:</strong> The projectile moves up, slows down due to gravity, stops momentarily at its peak, and falls back down.</li>
            </ul>
            <p className="font-medium text-indigo-700 mb-8">
              Conclusion: The projectile will always remain directly above the cart and will land exactly back inside it!
            </p>
          </div>

          <SimulationMovingCart />
        </div>
      </section>

      {/* Rocket Launch Simulation */}
      <section className="mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-slate-800 mb-6 border-b border-slate-100 pb-2">Multi-Phase Motion: The Rocket Launch</h2>
          <div className="prose prose-slate max-w-none">
            <p className="mb-4">
              This problem explores a two-phase motion: a constant acceleration phase followed by a free-fall projectile phase.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-slate-50 p-4 rounded border border-slate-200">
                <h4 className="font-semibold text-slate-800 mb-2">Phase 1: Powered Flight (<InlineMath math="0 \le t \le T" />)</h4>
                <p className="text-sm">
                  The rocket starts from rest and accelerates at <InlineMath math="a = g" /> at an angle <InlineMath math="\theta = 53.1^\circ" />.
                </p>
                <ul className="list-disc pl-5 mt-2 text-sm">
                  <li><InlineMath math="a_x = 0.6g, \quad a_y = 0.8g" /></li>
                  <li><InlineMath math="v_x(T) = 0.6gT, \quad v_y(T) = 0.8gT" /></li>
                  <li><InlineMath math="x(T) = 0.3gT^2, \quad y(T) = 0.4gT^2" /></li>
                </ul>
              </div>
              <div className="bg-slate-50 p-4 rounded border border-slate-200">
                <h4 className="font-semibold text-slate-800 mb-2">Phase 2: Projectile Motion (<InlineMath math="t > T" />)</h4>
                <p className="text-sm">
                  The engines stop. The only force is gravity (<InlineMath math="a_x = 0, a_y = -g" />).
                </p>
                <ul className="list-disc pl-5 mt-2 text-sm">
                  <li><InlineMath math="v_x = v_x(T)" /> (Constant)</li>
                  <li><InlineMath math="v_y = v_y(T) - g(t-T)" /></li>
                  <li>Initial conditions are the final conditions of Phase 1.</li>
                </ul>
              </div>
            </div>
          </div>

          <SimulationRocketLaunch />
        </div>
      </section>

      {/* Cycloid Motion Simulation */}
      <section className="mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-slate-800 mb-6 border-b border-slate-100 pb-2">Rolling Motion: The Cycloid</h2>
          <div className="prose prose-slate max-w-none mb-8">
            <p className="mb-4">
              A <strong>cycloid</strong> is the curve traced by a point on the rim of a circular wheel as the wheel rolls along a straight line without slipping. This is a fascinating example of combined translational and rotational motion.
            </p>
            <p className="mb-4">
              The parametric equations for a cycloid generated by a circle of radius <InlineMath math="R" /> rolling with constant angular velocity <InlineMath math="\omega" /> are:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
                <BlockMath math="x(t) = R(\omega t - \sin \omega t)" />
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
                <BlockMath math="y(t) = R(1 - \cos \omega t)" />
              </div>
            </div>
            <p className="mb-4">
              Key properties of cycloid motion:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Velocity:</strong> The particle is momentarily at rest when it touches the ground (<InlineMath math="\omega t = 2n\pi" />). At the top of the wheel, its speed is <InlineMath math="2R\omega" /> (twice the speed of the center).</li>
              <li><strong>Acceleration:</strong> The magnitude of acceleration is constant: <InlineMath math="|a| = R\omega^2" />. This is identical to the centripetal acceleration of the point relative to the wheel's center.</li>
              <li><strong>Independence:</strong> While the path is complex, the acceleration magnitude remains constant, unlike many other 2D motions.</li>
            </ul>
          </div>

          <SimulationCycloid />
        </div>
      </section>

      {/* Spiraling Up Simulation */}
      <section className="mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-slate-800 mb-6 border-b border-slate-100 pb-2">Spiraling Up: Motion on a Thermal</h2>
          <div className="prose prose-slate max-w-none mb-8">
            <p className="mb-4">
              Birds of prey, like hawks and eagles, often rise upward on columns of warm air called thermals. Their path can be modeled as a <strong>spiral</strong> (or helix), which is a combination of uniform circular motion in a horizontal plane and a constant upward velocity.
            </p>
            <p className="mb-4">
              This motion is a beautiful example of how complex 3D paths can be decomposed into simpler components:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Horizontal Component:</strong> Uniform circular motion with radius <InlineMath math="R" /> and period <InlineMath math="T" />. The horizontal speed is <InlineMath math="v_h = \omega R = \frac{2\pi R}{T}" />.</li>
              <li><strong>Vertical Component:</strong> Constant velocity motion with speed <InlineMath math="v_z" />.</li>
              <li><strong>Acceleration:</strong> Since the vertical velocity is constant, the acceleration is purely centripetal, directed toward the center of the spiral in the horizontal plane: <InlineMath math="a = \omega^2 R" />.</li>
            </ul>
          </div>

          <SimulationSpiral />
        </div>
      </section>

      {/* Relative Velocity: Soccer Pass Simulation */}
      <section className="mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-slate-800 mb-6 border-b border-slate-100 pb-2">Relative Velocity: Soccer Pass</h2>
          <div className="prose prose-slate max-w-none mb-8">
            <p className="mb-4">
              Relative velocity in two dimensions is the vector difference between the velocities of two objects relative to a common reference frame (usually the ground).
            </p>
            <p className="mb-4">
              In this scenario, a soccer player (Messy) is running North, and a teammate passes the ball to him at an angle. To find the velocity of the ball <strong>relative to Messy</strong>, we use the vector subtraction:
            </p>
            <BlockMath math="\vec{v}_{BM} = \vec{v}_{Bg} - \vec{v}_{Mg}" />
            <ul className="list-disc pl-6 space-y-2">
              <li><InlineMath math="\vec{v}_{BM}" />: Velocity of the <strong>B</strong>all relative to <strong>M</strong>essy.</li>
              <li><InlineMath math="\vec{v}_{Bg}" />: Velocity of the <strong>B</strong>all relative to <strong>g</strong>round.</li>
              <li><InlineMath math="\vec{v}_{Mg}" />: Velocity of <strong>M</strong>essy relative to <strong>g</strong>round.</li>
            </ul>
          </div>

          <SimulationSoccerPass />
        </div>
      </section>

      {/* AI Problem Generator */}
      <AIGenerator topic="Two-Dimensional Projectile Motion" />
    </div>
  );
}
