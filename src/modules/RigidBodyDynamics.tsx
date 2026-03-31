import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import { AIGenerator } from '../components/AIGenerator';
import { SimulationAngularMomentum } from '../components/SimulationAngularMomentum';
import { SimulationRolling } from '../components/SimulationRolling';
import { VectorVisualizer } from '../components/VectorVisualizer';
import { SimulationPulley } from '../components/SimulationPulley';
import { VisualizerTorque, VisualizerInertia } from '../components/InteractiveVisualizers';
import 'katex/dist/katex.min.css';

export function RigidBodyDynamics() {
  return (
    <div className="max-w-5xl mx-auto pb-12">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Dynamics of Rigid Bodies</h1>
        <p className="text-lg text-slate-600">Kinetics, moments of inertia, angular momentum, and rotational work.</p>
      </header>

      {/* Theoretical Summary */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
        <h2 className="text-2xl font-semibold text-slate-800 mb-6 border-b border-slate-100 pb-4">Theoretical Summary</h2>
        
        <div className="prose prose-slate max-w-none text-slate-700 space-y-6">
          
          {/* 4.1 Kinetics of rigid body */}
          <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
            <h3 className="text-xl font-medium text-slate-800 mb-4">4.1 Kinetics of Rigid Body</h3>
            
            <h4 className="font-medium text-slate-800 mb-2">4.1.1 Translation of Rigid Body, Center of Mass</h4>
            <p className="mb-4">
              A rigid body is an idealized solid body in which deformation is neglected. In pure translation, every point of the body moves with the same velocity and acceleration. The motion of the body can be completely described by the motion of its <strong>Center of Mass (CM)</strong>.
            </p>
            <BlockMath math="\vec{r}_{cm} = \frac{1}{M} \int \vec{r} \, dm \quad ; \quad \sum \vec{F}_{ext} = M \vec{a}_{cm}" />
            
            <h4 className="font-medium text-slate-800 mb-2 mt-6">4.1.2 Rotation of Rigid Body about a Fixed Axis</h4>
            <p className="mb-4">
              In pure rotation, every particle of the body moves in a circle whose center lies on the axis of rotation. The angular position <InlineMath math="\theta" />, angular velocity <InlineMath math="\omega" />, and angular acceleration <InlineMath math="\alpha" /> are the same for all particles in the rigid body.
            </p>
            <BlockMath math="\omega = \frac{d\theta}{dt} \quad ; \quad \alpha = \frac{d\omega}{dt} = \frac{d^2\theta}{dt^2}" />
            <p className="mt-2 text-sm text-slate-500 mb-4">
              The linear velocity and tangential acceleration of a point at distance <InlineMath math="r" /> from the axis are <InlineMath math="v = \omega r" /> and <InlineMath math="a_t = \alpha r" />.
            </p>

            <h4 className="font-medium text-slate-800 mb-2 mt-6">Rule for Determining the Direction of Angular Velocity and Angular Acceleration Vectors</h4>
            <p className="mb-2">
              In rotational motion, angular velocity (<InlineMath math="\vec{\omega}" />) and angular acceleration (<InlineMath math="\vec{\alpha}" />) are vector quantities directed along the axis of rotation.
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>
                <strong>Angular Velocity Vector (<InlineMath math="\vec{\omega}" />):</strong> The direction is determined by the <em>Right-Hand Rule</em>. Curl the fingers of your right hand in the direction of the object's rotation, and your extended thumb points in the direction of <InlineMath math="\vec{\omega}" />.
              </li>
              <li>
                <strong>Angular Acceleration Vector (<InlineMath math="\vec{\alpha}" />):</strong> Characterizes the change in angular velocity.
                <ul className="list-circle pl-6 mt-1">
                  <li>If the object is rotating <strong>faster</strong> (speeding up): <InlineMath math="\vec{\alpha}" /> is in the same direction as <InlineMath math="\vec{\omega}" />.</li>
                  <li>If the object is rotating <strong>slower</strong> (slowing down): <InlineMath math="\vec{\alpha}" /> is in the opposite direction to <InlineMath math="\vec{\omega}" />.</li>
                  <li>If the object is rotating <strong>uniformly</strong> (constant speed): <InlineMath math="\vec{\alpha} = 0" />.</li>
                </ul>
              </li>
            </ul>
          </div>

          {/* 4.2 Moment of force and moment of inertia */}
          <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
            <h3 className="text-xl font-medium text-slate-800 mb-4">4.2 Moment of Force and Moment of Inertia</h3>
            
            <h4 className="font-medium text-slate-800 mb-2">4.2.1 Moment of a Force (Torque)</h4>
            <p className="mb-4">
              The moment of a force, or <strong>Torque (<InlineMath math="\vec{\tau}" />)</strong>, is the tendency of a force to rotate an object about an axis. It is a vector quantity defined as the cross product of the position vector <InlineMath math="\vec{r}" /> (from the axis of rotation to the point of application of the force) and the force vector <InlineMath math="\vec{F}" />.
            </p>
            <BlockMath math="\vec{\tau} = \vec{r} \times \vec{F}" />
            <p className="mt-4 mb-2">
              The magnitude of the torque is given by the scalar form:
            </p>
            <BlockMath math="\tau = r F \sin\theta = F d" />
            <ul className="list-disc pl-6 space-y-2 mb-4 text-sm text-slate-600">
              <li><InlineMath math="\theta" /> is the angle between the position vector <InlineMath math="\vec{r}" /> and the force vector <InlineMath math="\vec{F}" />.</li>
              <li><InlineMath math="d = r \sin\theta" /> is called the <strong>moment arm</strong> (or lever arm). It is the perpendicular distance from the axis of rotation to the line of action of the force.</li>
            </ul>
            <p className="text-sm text-slate-600 mb-4">
              <em>Note:</em> A force applied directly towards or away from the axis of rotation (<InlineMath math="\theta = 0^\circ" /> or <InlineMath math="180^\circ" />) produces zero torque because the moment arm is zero.
            </p>
            
            <VisualizerTorque />

            <h4 className="font-medium text-slate-800 mb-2 mt-6">4.2.2 Moment of Inertia and Mass Distribution</h4>
            <p className="mb-4">
              The <strong>Moment of Inertia (<InlineMath math="I" />)</strong> is the rotational analog of mass. It represents a body's resistance to changes in its rotational motion. Unlike mass, which is an intrinsic property, the moment of inertia depends heavily on <strong>how the mass is distributed</strong> relative to the axis of rotation.
            </p>
            <p className="mb-4">
              Mass located further from the axis of rotation contributes much more to the moment of inertia because of the <InlineMath math="r^2" /> dependence. This is why a hollow hoop is harder to start spinning than a solid disk of the same mass and radius.
            </p>
            <BlockMath math="I = \sum m_i r_i^2 \quad \text{(discrete)} \quad ; \quad I = \int r^2 \, dm \quad \text{(continuous)}" />
            
            <div className="bg-white p-4 rounded-lg border border-slate-200 my-6">
              <h5 className="font-medium text-slate-800 mb-3">Moments of Inertia for Common Shapes</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-slate-600">Point Mass (at distance <InlineMath math="r" />)</span>
                  <InlineMath math="I = mr^2" />
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-slate-600">Solid Cylinder / Disk (center axis)</span>
                  <InlineMath math="I = \frac{1}{2}MR^2" />
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-slate-600">Hoop / Thin Cylindrical Shell (center axis)</span>
                  <InlineMath math="I = MR^2" />
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-slate-600">Solid Sphere (center axis)</span>
                  <InlineMath math="I = \frac{2}{5}MR^2" />
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-slate-600">Thin Rod (axis through center)</span>
                  <InlineMath math="I = \frac{1}{12}ML^2" />
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-slate-600">Thin Rod (axis through one end)</span>
                  <InlineMath math="I = \frac{1}{3}ML^2" />
                </div>
              </div>
            </div>

            <p className="mt-4 mb-2"><strong>Parallel-Axis Theorem:</strong></p>
            <p className="text-sm text-slate-600 mb-2">
              If you know the moment of inertia about an axis passing through the center of mass (<InlineMath math="I_{cm}" />), you can find the moment of inertia about any parallel axis located a distance <InlineMath math="d" /> away using:
            </p>
            <BlockMath math="I = I_{cm} + M d^2" />
            
            <VisualizerInertia />
            
            <SimulationRolling />
            
            <SimulationPulley showPulleyMass={true} />
          </div>

          {/* 4.3 Angular momentum */}
          <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
            <h3 className="text-xl font-medium text-slate-800 mb-4">4.3 Angular Momentum</h3>
            
            <h4 className="font-medium text-slate-800 mb-2">4.3.1 Angular Momentum</h4>
            <p className="mb-4">
              The angular momentum <InlineMath math="\vec{L}" /> of a particle is defined as the cross product of its position vector and its linear momentum. For a rigid body rotating about a fixed axis of symmetry, it simplifies to:
            </p>
            <BlockMath math="\vec{L} = \vec{r} \times \vec{p} \quad ; \quad L = I \omega" />
            
            <h4 className="font-medium text-slate-800 mb-2 mt-6">4.3.2 Theorems for Angular Momentum</h4>
            <p className="mb-4">
              The net external torque acting on a system equals the rate of change of its angular momentum (Newton's Second Law for rotation).
            </p>
            <BlockMath math="\sum \vec{\tau}_{ext} = \frac{d\vec{L}}{dt}" />

            <h4 className="font-medium text-slate-800 mb-2 mt-6">4.3.3 Conservation of Angular Momentum</h4>
            <p className="mb-4">
              The law of conservation of angular momentum states that if the net external torque acting on a system is zero, the total angular momentum of the system remains constant (is conserved).
            </p>
            <BlockMath math="\sum \vec{\tau}_{ext} = 0 \implies \vec{L}_i = \vec{L}_f \implies I_i \vec{\omega}_i = I_f \vec{\omega}_f" />
            <p className="mb-4">
              This is a powerful principle that applies to both single objects and complex systems. Because angular momentum is a vector (<InlineMath math="\vec{L}" />), both its <strong>magnitude</strong> and <strong>direction</strong> are conserved.
            </p>
            <ul className="list-disc pl-6 space-y-4 mb-4 text-slate-700">
              <li>
                <strong>Magnitude Conservation:</strong> If an object's moment of inertia (<InlineMath math="I" />) changes, its angular velocity (<InlineMath math="\omega" />) must change inversely to keep the product <InlineMath math="I \omega" /> constant. 
                <br />
                <span className="text-sm text-slate-600"><em>Example:</em> A figure skater spins faster (<InlineMath math="\omega" /> increases) when pulling their arms in (because <InlineMath math="I" /> decreases).</span>
              </li>
              <li>
                <strong>Direction Conservation:</strong> The axis of rotation tends to remain fixed in space unless acted upon by an external torque.
                <br />
                <span className="text-sm text-slate-600"><em>Example:</em> A spinning gyroscope or a bicycle wheel resists changes to its orientation, which is why it's easier to balance on a moving bicycle than a stationary one.</span>
              </li>
              <li>
                <strong>System of Objects:</strong> For a system of interacting objects (like a star and planets, or two disks dropping onto each other), the total angular momentum before an event equals the total angular momentum after, provided no external torques act on the system.
                <BlockMath math="I_1 \omega_{1i} + I_2 \omega_{2i} = I_1 \omega_{1f} + I_2 \omega_{2f}" />
              </li>
            </ul>
          </div>

          {/* 4.4 Work and power */}
          <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
            <h3 className="text-xl font-medium text-slate-800 mb-4">4.4 Work and Power in Rotational Motion</h3>
            
            <h4 className="font-medium text-slate-800 mb-2">4.4.1 Work Done by a Torque</h4>
            <p className="mb-4">
              The work done by a torque as a rigid body rotates through an angle <InlineMath math="d\theta" /> is <InlineMath math="dW = \tau \, d\theta" />.
            </p>
            <BlockMath math="W = \int_{\theta_1}^{\theta_2} \tau \, d\theta" />
            <p className="mt-4 mb-2"><strong>Power (<InlineMath math="P" />):</strong> The rate at which work is done by a torque.</p>
            <BlockMath math="P = \frac{dW}{dt} = \tau \omega" />

            <h4 className="font-medium text-slate-800 mb-2 mt-6">4.4.2 Rotational Kinetic Energy</h4>
            <p className="mb-4">
              The kinetic energy associated with the rotation of a rigid body is:
            </p>
            <BlockMath math="K_{rot} = \frac{1}{2} I \omega^2" />
            <p className="mt-4 mb-2"><strong>Work-Energy Theorem for Rotation:</strong></p>
            <BlockMath math="W_{net} = \Delta K_{rot} = \frac{1}{2} I \omega_f^2 - \frac{1}{2} I \omega_i^2" />
          </div>

        </div>
      </section>

      {/* Vector Visualizer (Includes Torque & Kinematics) */}
      <VectorVisualizer />

      {/* Interactive Simulation */}
      <SimulationAngularMomentum />

      {/* AI Problem Generator */}
      <AIGenerator topic="Dynamics of Rigid Bodies, Moment of Inertia, and Angular Momentum" />
    </div>
  );
}
