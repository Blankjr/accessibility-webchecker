import { useState } from 'react';
import type { Result, ImpactValue, NodeResult } from 'axe-core';
import axe from 'axe-core';

// Define our interfaces using axe-core's types
interface Violation extends Omit<Result, 'impact'> {
  impact: ImpactValue;
  nodes: Array<NodeResult>;
}

interface CheckResults {
  violations: Result[];
  passes: Result[];
  incomplete: Result[];
  inapplicable: Result[];
}

export default function AccessibilityChecker() {
  const [html, setHtml] = useState('');
  const [results, setResults] = useState<CheckResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAccessibilityCheck = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create a temporary container in the actual DOM
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.height = '0';
      tempContainer.style.overflow = 'hidden';
      tempContainer.innerHTML = html;
      document.body.appendChild(tempContainer);

      // Run axe analysis
      const results = await axe.run(tempContainer);
      
      // Cast the results to our interface
      setResults(results as unknown as CheckResults);

      // Cleanup
      document.body.removeChild(tempContainer);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Accessibility Checker</h1>
      
      <form onSubmit={runAccessibilityCheck} className="mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" htmlFor="html-input">
            HTML to Check:
          </label>
          <textarea
            id="html-input"
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            className="w-full h-48 p-3 border rounded-lg font-mono text-sm"
            placeholder="Paste your HTML here..."
          />
        </div>
        
        <button
          type="submit"
          disabled={loading || !html.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Checking...' : 'Check Accessibility'}
        </button>
      </form>

      {error && (
        <div className="p-4 mb-6 bg-red-50 border-l-4 border-red-500">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {results && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-700">{results.violations.length}</div>
              <div className="text-sm text-red-600">Violations</div>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-700">{results.incomplete.length}</div>
              <div className="text-sm text-yellow-600">Needs Review</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700">{results.passes.length}</div>
              <div className="text-sm text-green-600">Passed</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-700">{results.inapplicable.length}</div>
              <div className="text-sm text-gray-600">Not Applicable</div>
            </div>
          </div>

          {results.violations.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-red-600">Accessibility Issues Found</h2>
              {results.violations.map((violation, i) => (
                <div key={i} className="p-4 border-l-4 border-red-500 bg-white rounded-lg shadow">
                  <h3 className="font-bold mb-2">{violation.help}</h3>
                  <p className="text-gray-600 mb-2">{violation.description}</p>
                  <div className="mb-2">
                    <span className="px-2 py-1 bg-red-50 text-red-700 rounded text-sm">
                      Impact: {violation.impact || 'Unknown'}
                    </span>
                  </div>
                  {violation.nodes.map((node, j) => (
                    <div key={j} className="mt-2 p-2 bg-gray-50 rounded">
                      <p className="font-medium text-sm mb-1">Element:</p>
                      <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                        {node.html}
                      </pre>
                      {node.failureSummary && (
                        <div className="mt-2 text-sm text-gray-700">
                          <p className="font-medium">How to fix:</p>
                          <p>{node.failureSummary}</p>
                        </div>
                      )}
                    </div>
                  ))}
                  <a 
                    href={violation.helpUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 text-sm text-blue-600 hover:underline inline-block"
                  >
                    Learn more about this issue
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}