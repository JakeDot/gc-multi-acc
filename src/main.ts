import './index.css';
import { userscriptCode } from './userscript';
import { readmeCode } from './readme';

// Inline SVGs for icons
const icons = {
  fileCode: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 12.5 8 15l2 2.5"/><path d="m14 12.5 2 2.5-2 2.5"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/></svg>`,
  fileCodeSmall: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 12.5 8 15l2 2.5"/><path d="m14 12.5 2 2.5-2 2.5"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/></svg>`,
  fileTextSmall: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>`,
  copySmall: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`,
  checkSmall: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-600"><polyline points="20 6 9 17 4 12"/></svg>`
};

let activeTab: 'userscript' | 'readme' = 'userscript';
let copied = false;

function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function render() {
  const root = document.getElementById('root');
  if (!root) return;

  const content = activeTab === 'userscript' ? userscriptCode : readmeCode;
  const filename = activeTab === 'userscript' ? 'gc-multi-account-switcher.user.js' : 'README.md';

  root.innerHTML = `
    <div class="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <header class="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white shadow-sm">
            ${icons.fileCode}
          </div>
          <div>
            <h1 class="text-xl font-bold text-gray-900">Geocaching Multi-Account Switcher</h1>
            <p class="text-sm text-gray-500">Userscript Generator</p>
          </div>
        </div>
        
        <div class="flex bg-gray-100 p-1 rounded-lg">
          <button id="tab-userscript" class="px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'userscript' 
              ? 'bg-white text-green-700 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
          }">
            ${icons.fileCodeSmall}
            Userscript
          </button>
          <button id="tab-readme" class="px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'readme' 
              ? 'bg-white text-green-700 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
          }">
            ${icons.fileTextSmall}
            README
          </button>
        </div>
      </header>

      <main class="flex-grow p-6 max-w-6xl mx-auto w-full flex flex-col">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col flex-grow">
          
          <div class="bg-gray-50 border-b border-gray-200 px-4 py-3 flex justify-between items-center">
            <div class="text-sm font-mono text-gray-500">
              ${filename}
            </div>
            <button id="btn-copy" class="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1">
              ${copied ? icons.checkSmall : icons.copySmall}
              ${copied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>

          <div class="relative flex-grow bg-gray-900 overflow-auto">
            <pre class="p-6 text-sm text-gray-300 font-mono leading-relaxed whitespace-pre-wrap break-words">${escapeHtml(content)}</pre>
          </div>
          
        </div>
      </main>
    </div>
  `;

  // Attach event listeners
  document.getElementById('tab-userscript')?.addEventListener('click', () => {
    activeTab = 'userscript';
    render();
  });

  document.getElementById('tab-readme')?.addEventListener('click', () => {
    activeTab = 'readme';
    render();
  });

  document.getElementById('btn-copy')?.addEventListener('click', () => {
    navigator.clipboard.writeText(content).then(() => {
      copied = true;
      render();
      setTimeout(() => {
        copied = false;
        render();
      }, 2000);
    });
  });
}

// Initial render
render();
