import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import { AIGenerator } from '../components/AIGenerator';
import { Simulation1D } from '../components/Simulation1D';
import { SimulationConstantVelocity } from '../components/SimulationConstantVelocity';
import { SimulationKinematicsGraph } from '../components/SimulationKinematicsGraph';
import { VisualizerKinematics } from '../components/InteractiveVisualizers';
import 'katex/dist/katex.min.css';

export function Motion1D() {
  return (
    <div className="max-w-5xl mx-auto pb-12">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Motion in One Dimension</h1>
        <p className="text-lg text-slate-600">Kinematics in 1D, displacement, velocity, and acceleration.</p>
      </header>

      {/* Theoretical Summary */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
        <h2 className="text-2xl font-semibold text-slate-800 mb-6 border-b border-slate-100 pb-4">Theoretical Summary</h2>
        
        <div className="prose prose-slate max-w-none text-slate-700 space-y-6">
          <p>
            Kinematics is the branch of mechanics that describes the motion of points, bodies, and systems of bodies without considering the forces that cause them to move. In one-dimensional (1D) motion, an object can only move along a straight line.
          </p>

          <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
            <h3 className="text-lg font-medium text-slate-800 mb-4">Position, Distance, and Displacement</h3>
            <p className="mb-4">
              <strong>Position</strong> (<InlineMath math="x" />) is the location of an object relative to a chosen reference point. 
              <strong>Displacement</strong> (<InlineMath math="\Delta x" />) is the change in position of the object. It is a vector quantity, meaning it has both magnitude and direction.
            </p>
            <BlockMath math="\Delta x = x_f - x_i" />
            <p className="mt-4 text-sm text-slate-500">
              Where <InlineMath math="x_f" /> is the final position and <InlineMath math="x_i" /> is the initial position.
            </p>
          </div>

          <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
            <h3 className="text-lg font-medium text-slate-800 mb-4">Velocity</h3>
            <p className="mb-4">
              <strong>Average velocity</strong> (<InlineMath math="v_{avg}" />) is the displacement divided by the time interval during which that displacement occurs.
            </p>
            <BlockMath math="v_{avg} = \frac{\Delta x}{\Delta t} = \frac{x_f - x_i}{t_f - t_i}" />
            <p className="mt-4 mb-4">
              <strong>Instantaneous velocity</strong> (<InlineMath math="v" />) is the limit of the average velocity as the time interval approaches zero. It is the derivative of position with respect to time.
            </p>
            <BlockMath math="v = \lim_{\Delta t \to 0} \frac{\Delta x}{\Delta t} = \frac{dx}{dt}" />
          </div>

          <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
            <h3 className="text-lg font-medium text-slate-800 mb-4">Motion with Constant Velocity</h3>
            <p className="mb-4">
              When an object moves with a constant velocity, its acceleration is zero (<InlineMath math="a = 0" />). This means the object covers equal displacements in equal time intervals.
            </p>
            <p className="mb-4">
              The kinematic equations simplify significantly. The velocity remains constant at its initial value (<InlineMath math="v = v_0" />), and the position changes linearly with time:
            </p>
            <BlockMath math="x = x_0 + vt" />
            <p className="mt-4 text-sm text-slate-500">
              On a position vs. time graph, this motion is represented by a straight line where the slope equals the constant velocity. On a velocity vs. time graph, it is a horizontal line.
            </p>
          </div>

          <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
            <h3 className="text-lg font-medium text-slate-800 mb-4">Acceleration</h3>
            <p className="mb-4">
              <strong>Average acceleration</strong> (<InlineMath math="a_{avg}" />) is the change in velocity divided by the time interval during which that change occurs.
            </p>
            <BlockMath math="a_{avg} = \frac{\Delta v}{\Delta t} = \frac{v_f - v_i}{t_f - t_i}" />
            <p className="mt-4 mb-4">
              <strong>Instantaneous acceleration</strong> (<InlineMath math="a" />) is the limit of the average acceleration as the time interval approaches zero. It is the derivative of velocity with respect to time, or the second derivative of position.
            </p>
            <BlockMath math="a = \lim_{\Delta t \to 0} \frac{\Delta v}{\Delta t} = \frac{dv}{dt} = \frac{d^2x}{dt^2}" />
          </div>

          <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
            <h3 className="text-lg font-medium text-slate-800 mb-4">Speeding Up vs. Slowing Down</h3>
            <p className="mb-4">
              A common misconception is that a negative acceleration always means an object is slowing down. In physics, the sign of acceleration only indicates its <strong>direction</strong> along the chosen axis. To determine if an object is speeding up or slowing down, you must look at the <strong>product of velocity and acceleration (<InlineMath math="v \cdot a" />)</strong>:
            </p>
            <ul className="list-disc pl-6 space-y-4 mb-4">
              <li>
                <strong>Speeding Up: <InlineMath math="v \cdot a > 0" /></strong>
                <br />
                If velocity and acceleration have the <strong>same sign</strong> (both positive or both negative), they point in the same direction. The acceleration is pushing the object in the direction it is already moving, causing its speed (magnitude of velocity) to increase.
              </li>
              <li>
                <strong>Slowing Down: <InlineMath math="v \cdot a < 0" /></strong>
                <br />
                If velocity and acceleration have <strong>opposite signs</strong> (one positive, one negative), they point in opposite directions. The acceleration is opposing the object's motion, causing its speed to decrease.
              </li>
            </ul>
            <p className="text-sm text-slate-600 mt-4">
              <strong>Example:</strong> If a car is moving backwards (negative velocity, <InlineMath math="v < 0" />) and you press the gas pedal to go faster backwards, the acceleration is also negative (<InlineMath math="a < 0" />). Here, <InlineMath math="v \cdot a > 0" />, so the car is speeding up in the negative direction.
            </p>
          </div>

          <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
            <h3 className="text-lg font-medium text-slate-800 mb-4">Kinematic Equations (Constant Acceleration)</h3>
            <p className="mb-4">
              When an object moves with a constant acceleration (<InlineMath math="a = \text{constant}" />), its motion can be described by four fundamental kinematic equations:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded border border-slate-200">
                <p className="text-sm text-slate-500 mb-2">Velocity as a function of time:</p>
                <BlockMath math="v = v_0 + at" />
              </div>
              <div className="bg-white p-4 rounded border border-slate-200">
                <p className="text-sm text-slate-500 mb-2">Position as a function of time:</p>
                <BlockMath math="x = x_0 + v_0t + \frac{1}{2}at^2" />
              </div>
              <div className="bg-white p-4 rounded border border-slate-200">
                <p className="text-sm text-slate-500 mb-2">Velocity as a function of position:</p>
                <BlockMath math="v^2 = v_0^2 + 2a(x - x_0)" />
              </div>
              <div className="bg-white p-4 rounded border border-slate-200">
                <p className="text-sm text-slate-500 mb-2">Position as a function of velocity and time:</p>
                <BlockMath math="x - x_0 = \frac{1}{2}(v_0 + v)t" />
              </div>
            </div>
            
            <VisualizerKinematics />
          </div>

          <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
            <h3 className="text-lg font-medium text-slate-800 mb-4">Relative Velocity and Velocity Addition</h3>
            <p className="mb-4">
              The velocity of an object depends on the frame of reference of the observer. The <strong>velocity addition formula</strong> allows us to relate the velocities of an object as measured in different reference frames.
            </p>
            <BlockMath math="\vec{v}_{AC} = \vec{v}_{AB} + \vec{v}_{BC}" />
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><InlineMath math="\vec{v}_{AC}" />: Velocity of object A relative to frame C (Absolute velocity).</li>
              <li><InlineMath math="\vec{v}_{AB}" />: Velocity of object A relative to frame B (Relative velocity).</li>
              <li><InlineMath math="\vec{v}_{BC}" />: Velocity of frame B relative to frame C (Drag velocity).</li>
            </ul>
            <p className="mb-4">
              Although this is a 1D motion module, this vector addition formula is universally applicable, including common 2D scenarios:
            </p>
            <ul className="list-disc pl-6 space-y-4">
              <li>
                <strong>Boat crossing a river:</strong> If a boat moves across a river with velocity <InlineMath math="\vec{v}_{boat,water}" /> and the river flows with <InlineMath math="\vec{v}_{water,shore}" />, the boat's actual velocity relative to the shore is <InlineMath math="\vec{v}_{boat,shore} = \vec{v}_{boat,water} + \vec{v}_{water,shore}" />. If the boat heads straight across (perpendicular to the flow), the magnitude is <InlineMath math="v_{boat,shore} = \sqrt{v_{boat,water}^2 + v_{water,shore}^2}" />.
              </li>
              <li>
                <strong>Airplane with crosswind:</strong> An airplane's velocity relative to the ground (<InlineMath math="\vec{v}_{plane,ground}" />) is the vector sum of its velocity relative to the air (<InlineMath math="\vec{v}_{plane,air}" />) and the wind's velocity relative to the ground (<InlineMath math="\vec{v}_{wind,ground}" />).
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Interactive Plots */}
      <SimulationConstantVelocity />
      <SimulationKinematicsGraph />
      <Simulation1D />

      {/* AI Problem Generator */}
      <AIGenerator topic="Motion in One Dimension" />
    </div>
  );
}
