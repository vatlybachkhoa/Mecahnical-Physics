import React, { useState, useMemo } from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import { Plus, Trash2 } from 'lucide-react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart
} from 'recharts';
import 'katex/dist/katex.min.css';

export function ErrorAnalysis() {
  // Data Processing State
  const [measurements, setMeasurements] = useState<string[]>(['9.81', '9.79', '9.83', '9.80', '9.82']);
  
  // Linear Regression State
  const [regressionData, setRegressionData] = useState<{x: string, y: string}[]>([
    { x: '0.1', y: '0.98' },
    { x: '0.2', y: '1.96' },
    { x: '0.3', y: '2.94' },
    { x: '0.4', y: '3.92' },
    { x: '0.5', y: '4.90' },
  ]);

  // --- Data Processing Calculations ---
  const validMeasurements = useMemo(() => {
    return measurements.map(m => parseFloat(m)).filter(m => !isNaN(m));
  }, [measurements]);

  const stats = useMemo(() => {
    const n = validMeasurements.length;
    if (n === 0) return { mean: 0, stdDev: 0, stdError: 0 };
    
    const mean = validMeasurements.reduce((a, b) => a + b, 0) / n;
    
    if (n === 1) return { mean, stdDev: 0, stdError: 0 };
    
    const variance = validMeasurements.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (n - 1);
    const stdDev = Math.sqrt(variance);
    const stdError = stdDev / Math.sqrt(n); // Standard error of the mean (confidence interval approx)
    
    return { mean, stdDev, stdError };
  }, [validMeasurements]);

  const handleMeasurementChange = (index: number, value: string) => {
    const newM = [...measurements];
    newM[index] = value;
    setMeasurements(newM);
  };

  const addMeasurement = () => setMeasurements([...measurements, '']);
  const removeMeasurement = (index: number) => {
    setMeasurements(measurements.filter((_, i) => i !== index));
  };

  // --- Linear Regression Calculations ---
  const validRegression = useMemo(() => {
    return regressionData
      .map(d => ({ x: parseFloat(d.x), y: parseFloat(d.y) }))
      .filter(d => !isNaN(d.x) && !isNaN(d.y));
  }, [regressionData]);

  const regressionResult = useMemo(() => {
    const n = validRegression.length;
    if (n < 2) return { slope: 0, intercept: 0, rSquared: 0, lineData: [] };

    const sumX = validRegression.reduce((a, b) => a + b.x, 0);
    const sumY = validRegression.reduce((a, b) => a + b.y, 0);
    const sumXY = validRegression.reduce((a, b) => a + b.x * b.y, 0);
    const sumX2 = validRegression.reduce((a, b) => a + b.x * b.x, 0);
    const sumY2 = validRegression.reduce((a, b) => a + b.y * b.y, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // R-squared
    const meanY = sumY / n;
    const ssTot = validRegression.reduce((a, b) => a + Math.pow(b.y - meanY, 2), 0);
    const ssRes = validRegression.reduce((a, b) => a + Math.pow(b.y - (slope * b.x + intercept), 2), 0);
    const rSquared = ssTot === 0 ? 1 : 1 - (ssRes / ssTot);

    // Generate line data for plotting
    const minX = Math.min(...validRegression.map(d => d.x));
    const maxX = Math.max(...validRegression.map(d => d.x));
    const padding = (maxX - minX) * 0.1 || 1;
    
    const lineData = [
      { x: minX - padding, y: slope * (minX - padding) + intercept },
      { x: maxX + padding, y: slope * (maxX + padding) + intercept }
    ];

    return { slope, intercept, rSquared, lineData };
  }, [validRegression]);

  const handleRegChange = (index: number, field: 'x' | 'y', value: string) => {
    const newData = [...regressionData];
    newData[index][field] = value;
    setRegressionData(newData);
  };

  const addRegPoint = () => setRegressionData([...regressionData, { x: '', y: '' }]);
  const removeRegPoint = (index: number) => {
    setRegressionData(regressionData.filter((_, i) => i !== index));
  };

  // Combine data for ComposedChart
  const chartData = validRegression.map(d => ({
    x: d.x,
    scatterY: d.y,
    lineY: regressionResult.slope * d.x + regressionResult.intercept
  }));

  // Add endpoints for the line to extend past points
  if (regressionResult.lineData.length > 0) {
    chartData.unshift({
      x: regressionResult.lineData[0].x,
      scatterY: undefined as any,
      lineY: regressionResult.lineData[0].y
    });
    chartData.push({
      x: regressionResult.lineData[1].x,
      scatterY: undefined as any,
      lineY: regressionResult.lineData[1].y
    });
  }

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Error Analysis in Mechanical Experiments</h1>
        <p className="text-lg text-slate-600">Theory of errors, data processing, and linear regression.</p>
      </header>

      {/* Theory Section */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
        <h2 className="text-2xl font-semibold text-slate-800 mb-6 border-b border-slate-100 pb-4">Theory</h2>
        
        <div className="prose prose-slate max-w-none text-slate-700 space-y-6">
          <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
            <h3 className="text-lg font-medium text-slate-800 mb-4">Types of Errors</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Systematic Error:</strong> Errors that consistently occur in the same direction (e.g., a poorly calibrated scale). They affect the <em>accuracy</em> of the measurement.
              </li>
              <li>
                <strong>Random Error:</strong> Unpredictable fluctuations in readings. They affect the <em>precision</em> of the measurement and can be reduced by taking multiple readings and calculating the mean.
              </li>
            </ul>
          </div>

          <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
            <h3 className="text-lg font-medium text-slate-800 mb-4">Absolute and Relative Error</h3>
            <p className="mb-2"><strong>Absolute Error (<InlineMath math="\Delta x" />):</strong> The difference between the measured value and the true (or mean) value.</p>
            <p className="mb-4"><strong>Relative Error (<InlineMath math="\delta x" />):</strong> The ratio of the absolute error to the true (or mean) value, often expressed as a percentage.</p>
            <BlockMath math="\delta x = \frac{\Delta x}{x} \times 100\%" />
          </div>

          <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
            <h3 className="text-lg font-medium text-slate-800 mb-4">Significant Figures</h3>
            <p className="mb-2">
              <strong>Significant Figures (SF)</strong> include all certain digits and the first uncertain digit.
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>
                All non-zero digits are significant. (e.g., 1.23 has 3 SF).
              </li>
              <li>
                Zeros between non-zero digits are significant. (e.g., 1.002 has 4 SF).
              </li>
              <li>
                Leading zeros are <strong>not</strong> significant. (e.g., 0.0012 has 2 SF).
              </li>
              <li>
                Trailing zeros in the decimal portion are significant. (e.g., 1.200 has 4 SF).
              </li>
            </ul>
            
            <h4 className="font-medium text-slate-800 mb-2 mt-4">Rounding Rules:</h4>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Addition and Subtraction:</strong> The result is rounded to the same number of <em>decimal places</em> as the measurement with the fewest decimal places.
                <br/><span className="text-sm text-slate-500">Ex: 1.23 + 0.4 = 1.63 &rarr; 1.6 (since 0.4 has 1 decimal place).</span>
              </li>
              <li>
                <strong>Multiplication and Division:</strong> The result is rounded to the same number of <em>significant figures</em> as the measurement with the fewest significant figures.
                <br/><span className="text-sm text-slate-500">Ex: 1.23 &times; 0.4 = 0.492 &rarr; 0.5 (since 0.4 has 1 SF).</span>
              </li>
            </ul>
            
            <p className="mt-4">
              <strong>Reporting Uncertainties:</strong> The absolute uncertainty (<InlineMath math="\Delta x" />) should generally be rounded to <strong>one significant figure</strong>. The mean value (<InlineMath math="\bar{x}" />) must be rounded to the same decimal place as the absolute uncertainty.
              <br/><span className="text-sm text-slate-500">Ex: If <InlineMath math="g = 9.8124" /> and <InlineMath math="\Delta g = 0.035" />, round <InlineMath math="\Delta g \approx 0.04" /> and report <InlineMath math="g = 9.81 \pm 0.04" />.</span>
            </p>
          </div>

          <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
            <h3 className="text-lg font-medium text-slate-800 mb-4">Propagation of Uncertainty</h3>
            <p className="mb-4">
              When a physical quantity <InlineMath math="f" /> is calculated from several measured independent variables <InlineMath math="x, y, z" />, the uncertainty <InlineMath math="\Delta f" /> is calculated using partial derivatives:
            </p>
            <BlockMath math="\Delta f = \sqrt{\left( \frac{\partial f}{\partial x} \Delta x \right)^2 + \left( \frac{\partial f}{\partial y} \Delta y \right)^2 + \dots}" />
            
            <h4 className="font-medium text-slate-800 mt-6 mb-4">Basic rules for propagation of uncertainty:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded border border-slate-200">
                <p className="font-medium text-slate-800 mb-2">1. Addition / Subtraction</p>
                <p className="text-sm text-slate-600 mb-2">If <InlineMath math="f = x \pm y" />:</p>
                <BlockMath math="\Delta f = \sqrt{(\Delta x)^2 + (\Delta y)^2}" />
                <p className="text-xs text-slate-500 mt-2">(Often use maximum absolute error: <InlineMath math="\Delta f \approx \Delta x + \Delta y" />)</p>
              </div>
              <div className="bg-white p-4 rounded border border-slate-200">
                <p className="font-medium text-slate-800 mb-2">2. Multiplication / Division</p>
                <p className="text-sm text-slate-600 mb-2">If <InlineMath math="f = x \cdot y" /> or <InlineMath math="f = \frac{x}{y}" />:</p>
                <BlockMath math="\frac{\Delta f}{f} = \sqrt{\left(\frac{\Delta x}{x}\right)^2 + \left(\frac{\Delta y}{y}\right)^2}" />
                <p className="text-xs text-slate-500 mt-2">(Often use relative error: <InlineMath math="\delta f \approx \delta x + \delta y" />)</p>
              </div>
              <div className="bg-white p-4 rounded border border-slate-200">
                <p className="font-medium text-slate-800 mb-2">3. Power</p>
                <p className="text-sm text-slate-600 mb-2">If <InlineMath math="f = x^n" />:</p>
                <BlockMath math="\frac{\Delta f}{f} = |n| \frac{\Delta x}{x}" />
              </div>
              <div className="bg-white p-4 rounded border border-slate-200">
                <p className="font-medium text-slate-800 mb-2">4. Multiplication by a constant</p>
                <p className="text-sm text-slate-600 mb-2">If <InlineMath math="f = k \cdot x" /> (where <InlineMath math="k" /> is a constant):</p>
                <BlockMath math="\Delta f = |k| \Delta x" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Data Processing Tool */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
        <h2 className="text-2xl font-semibold text-slate-800 mb-6 border-b border-slate-100 pb-4">Data Processing Tool</h2>
        <p className="text-slate-600 mb-6">Enter your experimental measurements (e.g., measuring <InlineMath math="g" />) to automatically calculate the mean, standard deviation, and standard error.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-slate-800">Measurements</h3>
              <button 
                onClick={addMeasurement}
                className="flex items-center gap-1 text-sm bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-md hover:bg-indigo-100 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Row
              </button>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
              {measurements.map((val, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-slate-400 w-6 text-sm">{idx + 1}.</span>
                  <input
                    type="number"
                    value={val}
                    onChange={(e) => handleMeasurementChange(idx, e.target.value)}
                    className="flex-1 border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Value"
                  />
                  <button 
                    onClick={() => removeMeasurement(idx)}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    disabled={measurements.length <= 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col justify-center">
            <h3 className="font-medium text-slate-800 mb-6 text-center">Statistical Results</h3>
            <div className="space-y-6">
              <div>
                <p className="text-sm text-slate-500 mb-1">Mean (<InlineMath math="\bar{x}" />)</p>
                <p className="text-2xl font-semibold text-indigo-600">{stats.mean.toFixed(4)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Sample Standard Deviation (<InlineMath math="s" />)</p>
                <p className="text-2xl font-semibold text-slate-700">{stats.stdDev.toFixed(4)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Standard Error / Confidence Interval (<InlineMath math="\Delta x = \frac{s}{\sqrt{n}}" />)</p>
                <p className="text-2xl font-semibold text-emerald-600">± {stats.stdError.toFixed(4)}</p>
              </div>
              <div className="pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-500 mb-1">Final Result Format</p>
                <p className="text-lg font-medium text-slate-800">
                  <InlineMath math={`x = ${stats.mean.toFixed(2)} \\pm ${stats.stdError.toFixed(2)}`} />
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Linear Regression Tool */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
        <h2 className="text-2xl font-semibold text-slate-800 mb-6 border-b border-slate-100 pb-4">Linear Regression (Least Squares Method)</h2>
        <p className="text-slate-600 mb-6">Enter (x, y) pairs to find the best-fit line <InlineMath math="y = ax + b" />. Useful for determining physical constants like spring constant or friction coefficient.</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-slate-800">Data Points</h3>
              <button 
                onClick={addRegPoint}
                className="flex items-center gap-1 text-sm bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-md hover:bg-indigo-100 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Point
              </button>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
              <div className="flex gap-2 mb-2 px-6">
                <span className="flex-1 text-xs font-medium text-slate-500 uppercase">X Value</span>
                <span className="flex-1 text-xs font-medium text-slate-500 uppercase">Y Value</span>
                <span className="w-8"></span>
              </div>
              {regressionData.map((pt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-slate-400 w-4 text-sm">{idx + 1}.</span>
                  <input
                    type="number"
                    value={pt.x}
                    onChange={(e) => handleRegChange(idx, 'x', e.target.value)}
                    className="flex-1 border border-slate-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="x"
                  />
                  <input
                    type="number"
                    value={pt.y}
                    onChange={(e) => handleRegChange(idx, 'y', e.target.value)}
                    className="flex-1 border border-slate-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="y"
                  />
                  <button 
                    onClick={() => removeRegPoint(idx)}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    disabled={regressionData.length <= 2}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="mt-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h4 className="font-medium text-slate-800 mb-3">Regression Results</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Slope (a):</span>
                  <span className="font-semibold text-slate-800">{regressionResult.slope.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Intercept (b):</span>
                  <span className="font-semibold text-slate-800">{regressionResult.intercept.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">R² Score:</span>
                  <span className="font-semibold text-slate-800">{regressionResult.rSquared.toFixed(4)}</span>
                </div>
                <div className="pt-2 mt-2 border-t border-slate-200">
                  <InlineMath math={`y = ${regressionResult.slope.toFixed(3)}x ${regressionResult.intercept >= 0 ? '+' : ''} ${regressionResult.intercept.toFixed(3)}`} />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 h-96 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="x" 
                  type="number" 
                  domain={['auto', 'auto']} 
                  label={{ value: 'X', position: 'insideBottom', offset: -10 }} 
                />
                <YAxis 
                  domain={['auto', 'auto']} 
                  label={{ value: 'Y', angle: -90, position: 'insideLeft', offset: 10 }} 
                />
                <Tooltip cursor={{strokeDasharray: '3 3'}} />
                <Scatter name="Data Points" dataKey="scatterY" fill="#4f46e5" />
                <Line 
                  name="Best Fit Line" 
                  type="linear" 
                  dataKey="lineY" 
                  stroke="#f97316" 
                  strokeWidth={2} 
                  dot={false} 
                  activeDot={false}
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  );
}
