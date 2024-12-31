import { useState } from 'react';
import type { Result } from 'axe-core';
import axe from 'axe-core';

interface CheckResults {
  violations: Result[];
  passes: Result[];
  incomplete: Result[];
  inapplicable: Result[];
}

type ResultTab = 'violations' | 'passes' | 'incomplete' | 'inapplicable';

export default function AccessibilityChecker() {
  const [html, setHtml] = useState('');
  const [results, setResults] = useState<CheckResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ResultTab>('violations');
  const [showHelp, setShowHelp] = useState(false);

  const runAccessibilityCheck = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.height = '0';
      tempContainer.style.overflow = 'hidden';
      tempContainer.innerHTML = html;
      document.body.appendChild(tempContainer);

      const results = await axe.run(tempContainer);
      setResults(results as unknown as CheckResults);
      document.body.removeChild(tempContainer);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getTabStyles = (tab: ResultTab) => {
    const baseStyles = "p-4 rounded-lg transition-colors cursor-pointer";
    const activeStyles = {
      violations: 'bg-red-100 ring-2 ring-red-500',
      passes: 'bg-green-100 ring-2 ring-green-500',
      incomplete: 'bg-yellow-100 ring-2 ring-yellow-500',
      inapplicable: 'bg-gray-200 ring-2 ring-gray-500'
    };
    const inactiveStyles = {
      violations: 'bg-red-50 hover:bg-red-100',
      passes: 'bg-green-50 hover:bg-green-100',
      incomplete: 'bg-yellow-50 hover:bg-yellow-100',
      inapplicable: 'bg-gray-50 hover:bg-gray-100'
    };

    return `${baseStyles} ${activeTab === tab ? activeStyles[tab] : inactiveStyles[tab]}`;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Accessibility Checker</h1>
        <button
          onClick={() => setShowHelp(true)}
          className="w-10 h-10 flex items-center justify-center text-xl font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors border-2 border-blue-200 hover:border-blue-300"
          aria-label="Help Guide"
        >
          ?
        </button>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-3xl max-h-[80vh] overflow-y-auto m-4 p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">How to Use the Accessibility Checker</h2>
              <button
                onClick={() => setShowHelp(false)}
                className="w-8 h-8 flex items-center justify-center text-black bg-red-200 hover:bg-red-500 rounded-lg text-xl font-medium border-solid border-2 border-black"
                aria-label="Close help guide"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Basic Usage</h3>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Copy your HTML code</li>
                  <li>Paste it into the textarea below</li>
                  <li>Click "Check Accessibility"</li>
                  <li>Review the results in each category</li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Understanding Results</h3>
                <ul className="space-y-2">
                  <li><span className="font-medium text-red-600">Violations:</span> Critical issues that must be fixed</li>
                  <li><span className="font-medium text-yellow-600">Needs Review:</span> Issues that require human judgment</li>
                  <li><span className="font-medium text-green-600">Passed:</span> Elements that meet accessibility standards</li>
                  <li><span className="font-medium text-gray-600">Not Applicable:</span> Rules that don't apply to your content</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Common Issues to Check</h3>
                <ul className="space-y-2">
                  <li><span className="font-medium">Images:</span> Should have descriptive alt text</li>
                  <li><span className="font-medium">Forms:</span> All inputs should have labels</li>
                  <li><span className="font-medium">Links:</span> Should have meaningful text</li>
                  <li><span className="font-medium">Headings:</span> Should follow proper structure</li>
                  <li><span className="font-medium">Color:</span> Should have sufficient contrast</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Tips for Better Results</h3>
                <ul className="space-y-1">
                  <li>Use semantic HTML elements</li>
                  <li>Ensure all interactive elements are keyboard-accessible</li>
                  <li>Provide clear error messages and instructions</li>
                  <li>Use ARIA labels when necessary</li>
                  <li>Test with actual assistive technologies when possible</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowHelp(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Got it, thanks!
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={runAccessibilityCheck} className="mb-6">
        <div className="mb-4">
          <label className="block text-lg font-medium mb-2" htmlFor="html-input">
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
            <button
              onClick={() => setActiveTab('violations')}
              className={getTabStyles('violations')}
            >
              <div className="text-2xl font-bold text-red-700">{results.violations.length}</div>
              <div className="text-sm text-red-600">Violations</div>
            </button>
            <button
              onClick={() => setActiveTab('incomplete')}
              className={getTabStyles('incomplete')}
            >
              <div className="text-2xl font-bold text-yellow-700">{results.incomplete.length}</div>
              <div className="text-sm text-yellow-600">Needs Review</div>
            </button>
            <button
              onClick={() => setActiveTab('passes')}
              className={getTabStyles('passes')}
            >
              <div className="text-2xl font-bold text-green-700">{results.passes.length}</div>
              <div className="text-sm text-green-600">Passed</div>
            </button>
            <button
              onClick={() => setActiveTab('inapplicable')}
              className={getTabStyles('inapplicable')}
            >
              <div className="text-2xl font-bold text-gray-700">{results.inapplicable.length}</div>
              <div className="text-sm text-gray-600">Not Applicable</div>
            </button>
          </div>

          {/* Violations Panel */}
          {activeTab === 'violations' && results.violations.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-red-600">Accessibility Issues Found</h2>
              {results.violations.map((violation, i) => (
                <div key={i} className="p-4 border-l-4 border-red-500 bg-white rounded-lg shadow">
                  <div className="text-sm text-red-600 mb-1">Test: {violation.id}</div>
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

          {/* Needs Review Panel */}
          {activeTab === 'incomplete' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-yellow-600">Tests Needing Review</h2>
              <div className="bg-white rounded-lg shadow">
                {results.incomplete.map((item, i) => (
                  <div
                    key={i}
                    className="p-4 border-b last:border-b-0 hover:bg-gray-50"
                  >
                    <h3 className="font-medium text-yellow-700">{item.id}</h3>
                    <p className="text-sm text-gray-600 mb-2">{item.help}</p>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Passed Tests Panel */}
          {activeTab === 'passes' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-green-600">Passed Accessibility Tests</h2>
              <div className="bg-white rounded-lg shadow">
                {results.passes.map((pass, i) => (
                  <div
                    key={i}
                    className="p-4 border-b last:border-b-0 hover:bg-gray-50"
                  >
                    <h3 className="font-medium text-green-700">{pass.id}</h3>
                    <p className="text-sm text-gray-600">{pass.help}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Not Applicable Panel */}
          {activeTab === 'inapplicable' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-600">Not Applicable Tests</h2>
              <div className="bg-white rounded-lg shadow">
                {results.inapplicable.map((item, i) => (
                  <div
                    key={i}
                    className="p-4 border-b last:border-b-0 hover:bg-gray-50"
                  >
                    <h3 className="font-medium text-gray-700">{item.id}</h3>
                    <p className="text-sm text-gray-600">{item.help}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}