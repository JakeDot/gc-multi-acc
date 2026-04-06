/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { FileCode, FileText, Check, Copy } from 'lucide-react';
import { userscriptCode } from './userscript';
import { readmeCode } from './readme';

export default function App() {
  const [activeTab, setActiveTab] = useState<'userscript' | 'readme'>('userscript');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = activeTab === 'userscript' ? userscriptCode : readmeCode;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white shadow-sm">
            <FileCode size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Geocaching Power Tools</h1>
            <p className="text-sm text-gray-500">Userscript Generator</p>
          </div>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('userscript')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'userscript' 
                ? 'bg-white text-green-700 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            }`}
          >
            <FileCode size={16} />
            Userscript
          </button>
          <button
            onClick={() => setActiveTab('readme')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'readme' 
                ? 'bg-white text-green-700 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            }`}
          >
            <FileText size={16} />
            README
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-6 max-w-6xl mx-auto w-full flex flex-col">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col flex-grow">
          
          {/* Toolbar */}
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex justify-between items-center">
            <div className="text-sm font-mono text-gray-500">
              {activeTab === 'userscript' ? 'gc-power-tools.user.js' : 'README.md'}
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
            >
              {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>

          {/* Code Area */}
          <div className="relative flex-grow bg-gray-900 overflow-auto">
            <pre className="p-6 text-sm text-gray-300 font-mono leading-relaxed whitespace-pre-wrap break-words">
              {activeTab === 'userscript' ? userscriptCode : readmeCode}
            </pre>
          </div>
          
        </div>
      </main>
    </div>
  );
}

