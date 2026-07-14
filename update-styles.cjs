const fs = require('fs');

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Input styles
  content = content.replace(/className="w-full bg-slate-50 border border-slate-200 rounded-xl px-10 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500\/10 focus:border-indigo-500\/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"/g, 'className="w-full bg-white border border-slate-300 rounded-xl px-10 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:cursor-not-allowed"');
  
  content = content.replace(/className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"/g, 'className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:cursor-not-allowed"');
  
  // Link inputs with flex-1
  content = content.replace(/className="flex-1 bg-transparent border-none focus:outline-none text-sm font-medium text-slate-900 placeholder:text-slate-400"/g, 'className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-sm font-medium text-slate-900 placeholder:text-slate-400"');
  
  // Link inputs wrapper (if it exists)
  content = content.replace(/className="flex items-center space-x-2 bg-white rounded-xl px-3 py-2 border border-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500\/10 transition-all"/g, 'className="flex items-center space-x-2 bg-white rounded-xl px-3 py-2 border border-slate-300 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all"');
  
  // Textarea
  content = content.replace(/className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-12 py-4 text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500\/10 focus:border-indigo-500\/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed resize-none"/g, 'className="w-full bg-white border border-slate-300 rounded-xl px-12 py-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:cursor-not-allowed resize-none"');
  
  content = content.replace(/className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"/g, 'className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:cursor-not-allowed resize-none"');

  // Select
  content = content.replace(/className="w-full bg-slate-50 border border-slate-200 rounded-xl px-10 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500\/10 focus:border-indigo-500\/50 transition-all appearance-none disabled:opacity-60"/g, 'className="w-full bg-white border border-slate-300 rounded-xl px-10 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:cursor-not-allowed"');

  // Small select
  content = content.replace(/className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500\/10"/g, 'className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"');

  // Buttons inside link wrapper
  content = content.replace(/className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"/g, 'className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:cursor-not-allowed"');

  fs.writeFileSync(filePath, content);
}

updateFile('src/components/AgentAnalytics.tsx');
updateFile('src/App.tsx');
