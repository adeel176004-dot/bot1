const fs = require('fs');

let content = fs.readFileSync('src/components/AgentAnalytics.tsx', 'utf8');

// Update total messages color
content = content.replace(/color: 'blue'/g, "color: 'indigo'");
content = content.replace(/color: 'purple'/g, "color: 'indigo'");

// Fix text-xs to text-[10px] for metric labels
content = content.replace(/<p className="text-slate-500 text-xs font-medium">{metric.label}<\/p>/g, '<p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{metric.label}</p>');
content = content.replace(/<span className="text-\[10px\] text-slate-400 font-bold uppercase">{metric.subValue}<\/span>/g, '<span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{metric.subValue}</span>');

// Fix card structure
content = content.replace(/<motion\.div\n            key={metric\.label}\n            initial={{ opacity: 0, y: 20 }}\n            animate={{ opacity: 1, y: 0 }}\n            transition={{ delay: idx \* 0\.1 }}\n            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow min-w-\[280px\] flex-1 max-w-sm"\n          >\n            <div className="flex justify-between items-start mb-4">\n              <div className={`p-2\.5 rounded-xl bg-\${metric\.color}-50 border border-\${metric\.color}-100`}>\n                <metric\.icon className={`w-5 h-5 text-\${metric\.color}-600`} \/>\n              <\/div>\n            <\/div>\n            <div>\n              <div className="flex items-center space-x-1\.5 mb-1">\n                <p className="text-\[10px\] font-bold text-slate-500 uppercase tracking-wider">{metric\.label}<\/p>\n                {metric\.tooltip && <InfoTooltip text={metric\.tooltip} \/>}\n              <\/div>\n              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{metric\.value}<\/h3>\n            <\/div>\n          <\/motion\.div>/g, 
`<motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow min-w-[280px] flex-1 max-w-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={\`p-2.5 rounded-xl bg-\${metric.color}-50 border border-\${metric.color}-100\`}>
                  <metric.icon className={\`w-5 h-5 text-\${metric.color}-600\`} />
                </div>
                <div className="flex items-center space-x-1.5">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{metric.label}</p>
                  {metric.tooltip && <InfoTooltip text={metric.tooltip} />}
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{metric.value}</h3>
            </div>
          </motion.div>`);

// Fix billing card structure
content = content.replace(/<motion\.div\n            key={metric\.label}\n            initial={{ opacity: 0, y: 20 }}\n            animate={{ opacity: 1, y: 0 }}\n            transition={{ delay: \(metrics\.length \+ idx\) \* 0\.1 }}\n            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden min-w-\[280px\] flex-1 max-w-sm"\n          >\n            <div className="flex justify-between items-start mb-4">\n              <div className={`p-2\.5 rounded-xl bg-\${metric\.color}-50 border border-\${metric\.color}-100`}>\n                <metric\.icon className={`w-5 h-5 text-\${metric\.color}-600`} \/>\n              <\/div>\n              {metric\.label === 'Current Plan' && plan !== 'free' && \(\n                <span className="text-\[10px\] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg uppercase tracking-wider">Active<\/span>\n              \)}\n            <\/div>\n            <div>\n              <div className="flex items-center space-x-1\.5 mb-1">\n                <p className="text-\[10px\] font-bold text-slate-500 uppercase tracking-wider">{metric\.label}<\/p>\n                {metric\.tooltip && <InfoTooltip text={metric\.tooltip} \/>}\n              <\/div>\n              <div className="flex items-baseline space-x-2">\n                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{metric\.value}<\/h3>\n                <span className="text-\[10px\] font-bold text-slate-400 uppercase tracking-wider">{metric\.subValue}<\/span>\n              <\/div>\n            <\/div>/g, 
`<motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (metrics.length + idx) * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden min-w-[280px] flex-1 max-w-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={\`p-2.5 rounded-xl bg-\${metric.color}-50 border border-\${metric.color}-100\`}>
                  <metric.icon className={\`w-5 h-5 text-\${metric.color}-600\`} />
                </div>
                <div className="flex items-center space-x-1.5">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{metric.label}</p>
                  {metric.tooltip && <InfoTooltip text={metric.tooltip} />}
                </div>
              </div>
              {metric.label === 'Current Plan' && plan !== 'free' && (
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-lg uppercase tracking-wider">Active</span>
              )}
            </div>
            <div>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{metric.value}</h3>
                {metric.subValue && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{metric.subValue}</span>}
              </div>
            </div>`);

// Add Activity to lucide-react if it doesn't exist
if (!content.includes('Activity,')) {
  content = content.replace(/import {([^}]*)} from 'lucide-react';/, "import {$1 Activity, BarChart2,} from 'lucide-react';");
} else {
  content = content.replace(/Activity,/, 'Activity, BarChart2,');
}

// Chart empty state
content = content.replace(/<ResponsiveContainer width="100%" height="100%">([\s\S]*?)<\/ResponsiveContainer>/, 
`{stats.dailyUsage && stats.dailyUsage.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">$1</ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                 <Activity className="w-8 h-8 opacity-40 text-slate-400" />
                 <p className="text-sm font-medium text-slate-500">No messages yet this period</p>
              </div>
            )}`);

fs.writeFileSync('src/components/AgentAnalytics.tsx', content);

