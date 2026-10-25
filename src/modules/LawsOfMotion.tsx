import React, { useState } from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import { AIGenerator } from '../components/AIGenerator';
import { SimulationFriction } from '../components/SimulationFriction';
import { VisualizerFMA } from '../components/InteractiveVisualizers';
import { SimulationPulley } from '../components/SimulationPulley';
import { SimulationFrictionCart } from '../components/SimulationFrictionCart';
import { SimulationRotatingDisk } from '../components/SimulationRotatingDisk';
import { SimulationTwoBlocksPulley } from '../components/SimulationTwoBlocksPulley';
import 'katex/dist/katex.min.css';

export function LawsOfMotion() {
  const [normalForce, setNormalForce] = useState(100);
  const [muStatic, setMuStatic] = useState(0.4);
  const [muKinetic, setMuKinetic] = useState(0.3);
  const [appliedForce, setAppliedForce] = useState(0);

  // Ensure muKinetic is always <= muStatic
  const handleMuStaticChange = (val: number) => {
    setMuStatic(val);
    if (muKinetic > val) setMuKinetic(val);
  };

  const handleMuKineticChange = (val: number) => {
    if (val <= muStatic) setMuKinetic(val);
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">The Laws of Motion</h1>
        <p className="text-lg text-slate-600">Newton's laws, forces, and free-body diagrams.</p>
      </header>

      {/* Theoretical Summary */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
        <h2 className="text-2xl font-semibold text-slate-800 mb-6 border-b border-slate-100 pb-4">Theoretical Summary</h2>
        
        <div className="prose prose-slate max-w-none text-slate-700 space-y-6">
          <p>
            Dynamics is the study of the forces that cause objects and systems to move. Sir Isaac Newton's three laws of motion form the foundation of classical mechanics, describing the relationship between a body and the forces acting upon it, and its motion in response to those forces.
          </p>

          <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
            <h3 className="text-lg font-medium text-slate-800 mb-4">The Vector Nature of Force</h3>
            <p className="mb-4">
              Force is a <strong>vector quantity</strong>, meaning it has both a magnitude (how strong the push or pull is) and a direction. When multiple forces act on an object, they must be added together as vectors to find the <strong>net force</strong> (<InlineMath math="\vec{F}_{net}" />).
            </p>
            <BlockMath math="\vec{F}_{net} = \sum \vec{F} = \vec{F}_1 + \vec{F}_2 + \dots" />
            <p className="mb-4 mt-4">
              To analyze forces, we often resolve them into perpendicular components (usually x and y axes). A classic example is a block on an inclined plane, where it is convenient to align the x-axis parallel to the incline.
            </p>
            
            <div className="my-6 bg-white border border-slate-200 rounded-lg p-4 flex flex-col items-center">
              <h4 className="font-medium text-slate-700 mb-4">Forces on an Inclined Plane</h4>
              <svg width="400" height="300" viewBox="0 0 400 300" className="max-w-full h-auto">
                <defs>
                  <marker id="arrow-w" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
                  </marker>
                  <marker id="arrow-n" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
                  </marker>
                  <marker id="arrow-f" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
                  </marker>
                  <marker id="arrow-comp" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
                  </marker>
                </defs>

                {/* Incline */}
                <polygon points="50,250 350,76.8 350,250" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2" />
                
                {/* Angle theta at bottom left */}
                <path d="M 100 250 Q 100 235 93.3 225" fill="none" stroke="#64748b" strokeWidth="2" />
                <text x="105" y="240" fill="#64748b" fontSize="14" fontFamily="serif" fontStyle="italic">θ</text>

                {/* Rotated Frame for Block and Vectors */}
                <g transform="translate(200, 163.4) rotate(-30)">
                  {/* Axes */}
                  <line x1="-120" y1="0" x2="120" y2="0" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4,4" />
                  <line x1="0" y1="-120" x2="0" y2="120" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4,4" />
                  <text x="110" y="-10" fill="#94a3b8" fontSize="12">x</text>
                  <text x="10" y="-110" fill="#94a3b8" fontSize="12">y</text>

                  {/* Block */}
                  <rect x="-40" y="-40" width="80" height="40" fill="#e2e8f0" stroke="#64748b" strokeWidth="2" />
                  
                  {/* Center of Mass */}
                  <g transform="translate(0, -20)">
                    <circle cx="0" cy="0" r="3" fill="#0f172a" />

                    {/* Weight Components (Dashed) */}
                    <line x1="0" y1="0" x2="-50" y2="0" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4,4" markerEnd="url(#arrow-comp)" />
                    <line x1="0" y1="0" x2="0" y2="86.6" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4,4" markerEnd="url(#arrow-comp)" />
                    
                    {/* Component projections */}
                    <line x1="-50" y1="0" x2="-50" y2="86.6" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2,2" />
                    <line x1="0" y1="86.6" x2="-50" y2="86.6" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2,2" />

                    {/* Weight Vector */}
                    <line x1="0" y1="0" x2="-50" y2="86.6" stroke="#3b82f6" strokeWidth="3" markerEnd="url(#arrow-w)" />
                    
                    {/* Normal Force */}
                    <line x1="0" y1="0" x2="0" y2="-86.6" stroke="#10b981" strokeWidth="3" markerEnd="url(#arrow-n)" />
                    
                    {/* Friction Force */}
                    <line x1="0" y1="0" x2="40" y2="0" stroke="#ef4444" strokeWidth="3" markerEnd="url(#arrow-f)" />

                    {/* Angle theta between Wy and W */}
                    <path d="M 0 40 Q -10 40 -20 34.6" fill="none" stroke="#64748b" strokeWidth="2" />
                    <text x="-12" y="55" fill="#64748b" fontSize="12" fontFamily="serif" fontStyle="italic">θ</text>

                    {/* Labels */}
                    <text x="-60" y="105" fill="#3b82f6" fontSize="14" fontWeight="bold">W = mg</text>
                    <text x="-90" y="-10" fill="#94a3b8" fontSize="12">mg sin(θ)</text>
                    <text x="10" y="70" fill="#94a3b8" fontSize="12">mg cos(θ)</text>
                    <text x="10" y="-80" fill="#10b981" fontSize="14" fontWeight="bold">N</text>
                    <text x="25" y="-10" fill="#ef4444" fontSize="14" fontWeight="bold">f</text>
                  </g>
                </g>
              </svg>
            </div>
            <p className="text-sm text-slate-600">
              In this diagram, the weight vector (<InlineMath math="\vec{W}" />) points straight down towards the center of the Earth. To simplify calculations, we resolve it into two components: one parallel to the incline (<InlineMath math="mg \sin\theta" />) which pulls the block down the ramp, and one perpendicular to the incline (<InlineMath math="mg \cos\theta" />) which presses the block against the surface.
            </p>
          </div>

          <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
            <h3 className="text-lg font-medium text-slate-800 mb-4">Newton's First Law (Law of Inertia)</h3>
            <p className="mb-4">
              An object at rest remains at rest, and an object in motion remains in motion at constant speed and in a straight line unless acted on by an unbalanced (net) force.
            </p>
            <p className="mb-4">
              Inertia is the tendency of an object to resist changes in its state of motion. Mass is a quantitative measure of inertia.
            </p>
            <BlockMath math="\sum \vec{F} = 0 \implies \vec{v} = \text{constant}" />
          </div>

          <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
            <h3 className="text-lg font-medium text-slate-800 mb-4">Newton's Second Law</h3>
            <p className="mb-4">
              The acceleration of an object depends on the mass of the object and the amount of force applied. The net force acting on an object is equal to the rate of change of its momentum. For an object with constant mass, this simplifies to:
            </p>
            <BlockMath math="\sum \vec{F} = m\vec{a}" />
            <p className="mt-4 mb-4">
              Where <InlineMath math="\sum \vec{F}" /> is the net force vector, <InlineMath math="m" /> is the mass, and <InlineMath math="\vec{a}" /> is the acceleration vector. In component form:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded border border-slate-200 flex justify-center">
                <InlineMath math="\sum F_x = ma_x" />
              </div>
              <div className="bg-white p-4 rounded border border-slate-200 flex justify-center">
                <InlineMath math="\sum F_y = ma_y" />
              </div>
              <div className="bg-white p-4 rounded border border-slate-200 flex justify-center">
                <InlineMath math="\sum F_z = ma_z" />
              </div>
            </div>
            
            <VisualizerFMA />
          </div>

          <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
            <h3 className="text-lg font-medium text-slate-800 mb-4">Newton's Third Law</h3>
            <p className="mb-4">
              Whenever one object exerts a force on a second object, the second object exerts an equal and opposite force on the first.
            </p>
            <BlockMath math="\vec{F}_{12} = -\vec{F}_{21}" />
            
            <div className="mt-6 space-y-4">
              <h4 className="font-medium text-slate-800">Examples of Action-Reaction Pairs:</h4>
              <ul className="list-disc pl-6 space-y-2 text-sm text-slate-700">
                <li><strong>Walking:</strong> You push backward on the ground (action), and the ground pushes forward on you (reaction), propelling you forward.</li>
                <li><strong>Swimming:</strong> You push the water backward (action), and the water pushes you forward (reaction).</li>
                <li><strong>Earth and Moon:</strong> The Earth pulls on the Moon with a gravitational force (action), and the Moon pulls on the Earth with an equal and opposite gravitational force (reaction).</li>
              </ul>

              <div className="bg-amber-50 p-4 rounded border border-amber-200 mt-4">
                <h4 className="font-medium text-amber-800 mb-2">Common Misconception: Action-Reaction vs. Equilibrium</h4>
                <p className="text-sm text-amber-900 mb-2">
                  A very common mistake is confusing an action-reaction pair with two forces that cancel each other out to create equilibrium (like a book resting on a table).
                </p>
                <ul className="list-disc pl-6 space-y-2 text-sm text-amber-900">
                  <li>
                    <strong>Equilibrium Forces:</strong> Act on the <strong>same</strong> object. For a book on a table, the Earth pulls down on the book (Weight), and the table pushes up on the book (Normal force). These two forces act on the <em>book</em> and cancel out (<InlineMath math="\sum F = 0" />), but they are <strong>not</strong> an action-reaction pair.
                  </li>
                  <li>
                    <strong>Action-Reaction Pairs:</strong> Always act on <strong>different</strong> objects. The reaction to the Earth pulling down on the book is the <em>book pulling up on the Earth</em>. The reaction to the table pushing up on the book is the <em>book pushing down on the table</em>. Because they act on different objects, they never cancel each other out in a free-body diagram of a single object.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
            <h3 className="text-lg font-medium text-slate-800 mb-4">Common Forces & Constraint Forces</h3>
            <p className="mb-4">
              Constraint forces are forces that restrict the motion of an object in a specific way. They adjust their magnitude and direction to maintain the constraint (e.g., keeping an object on a surface or keeping a string taut).
            </p>
            <ul className="list-disc pl-6 space-y-4">
              <li>
                <strong>Weight (<InlineMath math="\vec{W}" /> or <InlineMath math="\vec{F}_g" />):</strong> The gravitational force exerted on an object by the Earth. It always points straight down toward the center of the Earth.
                <BlockMath math="\vec{W} = m\vec{g}" />
              </li>
              <li>
                <strong>Normal Force (<InlineMath math="\vec{N}" /> or <InlineMath math="\vec{F}_n" />):</strong> A constraint force exerted by a surface on an object in contact with it. It always acts <strong>perpendicular (normal)</strong> to the surface, preventing the object from passing through it. Its magnitude adjusts to balance other forces perpendicular to the surface.
              </li>
              <li>
                <strong>Friction (<InlineMath math="\vec{f}" />):</strong> A constraint force that opposes relative motion (or the tendency of such motion) between surfaces in contact. It acts parallel to the surface.
                <ul className="list-circle pl-6 mt-2 space-y-2">
                  <li><strong>Static Friction (<InlineMath math="f_s" />):</strong> Prevents motion from starting. It adjusts its magnitude to exactly cancel applied forces, up to a maximum limit: <InlineMath math="f_s \le \mu_s N" />.</li>
                  <li><strong>Kinetic Friction (<InlineMath math="f_k" />):</strong> Opposes ongoing motion. Its magnitude is generally constant: <InlineMath math="f_k = \mu_k N" />.</li>
                </ul>
              </li>
              <li>
                <strong>Tension (<InlineMath math="\vec{T}" />):</strong> A constraint force transmitted axially by means of a string, cable, chain, etc. It always pulls <strong>away</strong> from the object along the direction of the string. An ideal string is massless and inextensible, meaning tension is uniform throughout.
              </li>
            </ul>
          </div>

          <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
            <h3 className="text-lg font-medium text-slate-800 mb-4">Real-World Applications: Pulleys</h3>
            <p className="mb-4">
              Pulleys are simple machines used to change the direction of a force or to gain a mechanical advantage. They are common in dynamics problems involving connected objects.
            </p>
            
            <div className="my-6 bg-white border border-slate-200 rounded-lg p-4 flex flex-col items-center">
              <svg width="400" height="250" viewBox="0 0 400 250" className="max-w-full h-auto">
                <defs>
                  <marker id="arrow-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
                  </marker>
                </defs>
                {/* Fixed Pulley */}
                <g transform="translate(100, 40)">
                  <line x1="-40" y1="0" x2="40" y2="0" stroke="#94a3b8" strokeWidth="4" />
                  <line x1="0" y1="0" x2="0" y2="30" stroke="#64748b" strokeWidth="3" />
                  <circle cx="0" cy="50" r="20" fill="#e2e8f0" stroke="#64748b" strokeWidth="2" />
                  <circle cx="0" cy="50" r="3" fill="#0f172a" />
                  <path d="M -20 130 L -20 50 A 20 20 0 0 1 20 50 L 20 130" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                  <rect x="-35" y="130" width="30" height="30" fill="#f87171" stroke="#b91c1c" strokeWidth="2" />
                  <text x="-20" y="150" fill="white" fontSize="12" textAnchor="middle" fontWeight="bold">m</text>
                  <line x1="20" y1="130" x2="20" y2="170" stroke="#3b82f6" strokeWidth="3" markerEnd="url(#arrow-blue)" />
                  <text x="35" y="155" fill="#3b82f6" fontSize="14" fontWeight="bold">F</text>
                  <text x="0" y="-15" fill="#475569" fontSize="14" textAnchor="middle" fontWeight="bold">Fixed Pulley</text>
                </g>

                {/* Movable Pulley */}
                <g transform="translate(300, 40)">
                  <line x1="-40" y1="0" x2="40" y2="0" stroke="#94a3b8" strokeWidth="4" />
                  <line x1="-20" y1="0" x2="-20" y2="100" stroke="#cbd5e1" strokeWidth="3" />
                  <circle cx="0" cy="100" r="20" fill="#e2e8f0" stroke="#64748b" strokeWidth="2" />
                  <circle cx="0" cy="100" r="3" fill="#0f172a" />
                  <path d="M -20 100 A 20 20 0 0 0 20 100 L 20 30" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                  <line x1="0" y1="120" x2="0" y2="140" stroke="#64748b" strokeWidth="3" />
                  <rect x="-15" y="140" width="30" height="30" fill="#f87171" stroke="#b91c1c" strokeWidth="2" />
                  <text x="0" y="160" fill="white" fontSize="12" textAnchor="middle" fontWeight="bold">m</text>
                  <line x1="20" y1="30" x2="20" y2="-10" stroke="#3b82f6" strokeWidth="3" markerEnd="url(#arrow-blue)" />
                  <text x="35" y="15" fill="#3b82f6" fontSize="14" fontWeight="bold">F</text>
                  <text x="0" y="-15" fill="#475569" fontSize="14" textAnchor="middle" fontWeight="bold">Movable Pulley</text>
                </g>
              </svg>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded border border-slate-200">
                <h4 className="font-semibold text-slate-800 mb-2">Fixed Pulley</h4>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li><strong>Function:</strong> Changes the direction of the applied force.</li>
                  <li><strong>Mechanical Advantage:</strong> 1 (No force multiplication).</li>
                  <li><strong>Tension (<InlineMath math="T" />):</strong> Uniform throughout the ideal (massless, frictionless) string.</li>
                  <li><strong>Displacement:</strong> If you pull the rope down by distance <InlineMath math="d" />, the load moves up by distance <InlineMath math="d" />.</li>
                  <li><strong>Equation (Equilibrium):</strong> <InlineMath math="F = T = mg" /></li>
                </ul>
              </div>
              <div className="bg-white p-4 rounded border border-slate-200">
                <h4 className="font-semibold text-slate-800 mb-2">Movable Pulley</h4>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li><strong>Function:</strong> Multiplies the applied force (Mechanical Advantage = 2).</li>
                  <li><strong>Tension (<InlineMath math="T" />):</strong> The load is supported by <em>two</em> segments of the rope.</li>
                  <li><strong>Displacement:</strong> To lift the load by distance <InlineMath math="h" />, you must pull the rope by distance <InlineMath math="2h" />.</li>
                  <li><strong>Velocity/Acceleration:</strong> The acceleration of the load is half the acceleration of the pulled rope end (<InlineMath math="a_{load} = \frac{1}{2}a_{rope}" />).</li>
                  <li><strong>Equation (Equilibrium):</strong> <InlineMath math="2T = mg \implies F = T = \frac{mg}{2}" /></li>
                </ul>
              </div>
            </div>
            
            <SimulationPulley showPulleyMass={false} />
          </div>

          <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
            <h3 className="text-lg font-medium text-slate-800 mb-4">Free-Body Diagrams (FBD)</h3>
            <p className="mb-4">
              A free-body diagram is a crucial tool for solving mechanics problems. It is a sketch showing the object of interest (often represented as a dot) and all the external forces acting <strong>on</strong> it.
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Identify the object of interest.</li>
              <li>Draw a dot or simple shape to represent the object.</li>
              <li>Draw vectors representing all external forces acting on the object. Label each force.</li>
              <li>Establish a coordinate system (e.g., x-y axes). It's often helpful to align one axis with the direction of acceleration.</li>
              <li>Apply Newton's Second Law (<InlineMath math="\sum \vec{F} = m\vec{a}" />) along each axis.</li>
            </ol>
          </div>

          <div className="bg-white p-6 rounded-lg border border-indigo-200 shadow-sm">
            <h3 className="text-xl font-semibold text-indigo-900 mb-4">Worked Example: Block on an Incline</h3>
            <p className="mb-4 text-slate-700">
              <strong>Problem:</strong> A block of mass <InlineMath math="m = 5 \text{ kg}" /> is placed on a rough inclined plane that makes an angle <InlineMath math="\theta = 30^\circ" /> with the horizontal. The coefficient of kinetic friction is <InlineMath math="\mu_k = 0.2" />. Find the acceleration of the block as it slides down the incline. (Use <InlineMath math="g = 9.8 \text{ m/s}^2" />).
            </p>
            
            <div className="space-y-4 text-slate-700">
              <div>
                <strong className="text-slate-900">Step 1: Free-Body Diagram & Coordinate System</strong>
                <p>We choose the x-axis parallel to the incline (pointing down) and the y-axis perpendicular to the incline (pointing up). The forces are:</p>
                <ul className="list-disc pl-6 mt-2">
                  <li>Weight (<InlineMath math="mg" />) pointing straight down.</li>
                  <li>Normal force (<InlineMath math="N" />) pointing along the positive y-axis.</li>
                  <li>Kinetic friction (<InlineMath math="f_k" />) pointing up the incline (negative x-axis).</li>
                </ul>
              </div>

              <div>
                <strong className="text-slate-900">Step 2: Resolve Forces into Components</strong>
                <p>The weight vector must be resolved into x and y components:</p>
                <ul className="list-disc pl-6 mt-2">
                  <li><InlineMath math="W_x = mg \sin\theta" /> (down the incline)</li>
                  <li><InlineMath math="W_y = -mg \cos\theta" /> (into the incline)</li>
                </ul>
              </div>

              <div>
                <strong className="text-slate-900">Step 3: Apply Newton's Second Law</strong>
                <p className="mt-2"><strong>y-axis:</strong> There is no acceleration perpendicular to the incline (<InlineMath math="a_y = 0" />).</p>
                <BlockMath math="\sum F_y = N - mg \cos\theta = 0 \implies N = mg \cos\theta" />
                
                <p className="mt-4"><strong>x-axis:</strong> The block accelerates down the incline.</p>
                <BlockMath math="\sum F_x = mg \sin\theta - f_k = ma_x" />
              </div>

              <div>
                <strong className="text-slate-900">Step 4: Solve for Acceleration</strong>
                <p>Substitute <InlineMath math="f_k = \mu_k N = \mu_k (mg \cos\theta)" /> into the x-axis equation:</p>
                <BlockMath math="mg \sin\theta - \mu_k mg \cos\theta = ma_x" />
                <p>Cancel mass <InlineMath math="m" /> from both sides:</p>
                <BlockMath math="a_x = g (\sin\theta - \mu_k \cos\theta)" />
                <p>Plug in the values:</p>
                <BlockMath math="a_x = 9.8 \cdot (\sin 30^\circ - 0.2 \cdot \cos 30^\circ)" />
                <BlockMath math="a_x = 9.8 \cdot (0.5 - 0.2 \cdot 0.866) = 9.8 \cdot (0.5 - 0.1732) \approx 3.20 \text{ m/s}^2" />
              </div>
              
              <div className="p-4 bg-indigo-50 rounded border border-indigo-100 text-indigo-900">
                <strong>Answer:</strong> The block accelerates down the incline at approximately <strong><InlineMath math="3.20 \text{ m/s}^2" /></strong>.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simulation Controls */}
      <section className="mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h3 className="text-xl font-semibold text-slate-800 mb-6">Simulation Parameters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Normal Force (<InlineMath math="N" />): {normalForce} N
              </label>
              <input 
                type="range" 
                min="10" 
                max="500" 
                step="10"
                value={normalForce} 
                onChange={(e) => setNormalForce(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Static Friction Coeff (<InlineMath math="\mu_s" />): {muStatic.toFixed(2)}
              </label>
              <input 
                type="range" 
                min="0.1" 
                max="1.0" 
                step="0.05"
                value={muStatic} 
                onChange={(e) => handleMuStaticChange(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Kinetic Friction Coeff (<InlineMath math="\mu_k" />): {muKinetic.toFixed(2)}
              </label>
              <input 
                type="range" 
                min="0.05" 
                max="1.0" 
                step="0.05"
                value={muKinetic} 
                onChange={(e) => handleMuKineticChange(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Applied Force (<InlineMath math="F_{app}" />): {appliedForce} N
              </label>
              <input 
                type="range" 
                min="-200" 
                max="200" 
                step="5"
                value={appliedForce} 
                onChange={(e) => setAppliedForce(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>
          </div>
        </div>

        <SimulationFriction 
          normalForce={normalForce} 
          muStatic={muStatic} 
          muKinetic={muKinetic} 
          appliedForce={appliedForce} 
        />
        <div className="mt-8">
          <SimulationFrictionCart />
        </div>
        <div className="mt-8">
          <SimulationRotatingDisk />
        </div>
        <div className="mt-8">
          <SimulationTwoBlocksPulley />
        </div>
      </section>

      {/* AI Problem Generator */}
      <AIGenerator topic="Newton's Laws of Motion and Forces" />
    </div>
  );
}
