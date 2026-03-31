import React, { useState, useEffect } from 'react';
import { generatePhysicsProblem } from '../services/gemini';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react';

interface AIGeneratorProps {
  topic: string;
}

// Global cache to persist problems across tab switches
const problemCache: Record<string, { problem: string; solution: string }> = {};

export function AIGenerator({ topic }: AIGeneratorProps) {
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [loading, setLoading] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [solution, setSolution] = useState<string | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load from cache on mount
  useEffect(() => {
    const cacheKey = `${topic}-${difficulty}`;
    if (problemCache[cacheKey]) {
      setProblem(problemCache[cacheKey].problem);
      setSolution(problemCache[cacheKey].solution);
    } else {
      setProblem(null);
      setSolution(null);
    }
  }, [topic, difficulty]);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setProblem(null);
    setSolution(null);
    setShowSolution(false);

    try {
      const result = await generatePhysicsProblem(topic, difficulty);
      setProblem(result.problem);
      setSolution(result.solution);
      
      // Save to cache
      const cacheKey = `${topic}-${difficulty}`;
      problemCache[cacheKey] = {
        problem: result.problem,
        solution: result.solution
      };
    } catch (err) {
      setError("Failed to generate problem. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mt-8">
      <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <span className="text-indigo-600">✨</span> AI-Powered Problem Generator
      </h3>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 mb-1">Topic</label>
          <input 
            type="text" 
            value={topic} 
            disabled 
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-600 cursor-not-allowed"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 mb-1">Difficulty</label>
          <select 
            value={difficulty} 
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
            <option value="Expert">Expert</option>
          </select>
        </div>
        <div className="flex items-end">
          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Generate Problem'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {problem && (
        <div className="space-y-6">
          <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
            <h4 className="font-medium text-slate-800 mb-3">Problem Statement:</h4>
            <div className="prose prose-slate max-w-none prose-p:leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                {problem}
              </ReactMarkdown>
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <button 
              onClick={() => setShowSolution(!showSolution)}
              className="w-full flex items-center justify-between bg-slate-50 px-6 py-4 text-left font-medium text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <span>Step-by-Step Solution</span>
              {showSolution ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
            </button>
            
            {showSolution && solution && (
              <div className="p-6 bg-white border-t border-slate-200">
                <div className="prose prose-slate max-w-none prose-p:leading-relaxed">
                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {solution}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
