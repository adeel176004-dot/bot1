const fs = require('fs');

let content = fs.readFileSync('src/components/AgentAnalytics.tsx', 'utf8');

// Insert chart generation function after localConfig state
const chartLogic = `

  const chartData = React.useMemo(() => {
    if (stats.dailyUsage && stats.dailyUsage.length > 0) return stats.dailyUsage;
    
    // Generate fallback data if totalMessages exists but no daily usage recorded yet
    const data = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      data.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        messages: i === 0 ? stats.totalMessages : 0,
        minutes: 0
      });
    }
    return data;
  }, [stats.dailyUsage, stats.totalMessages]);
`;

content = content.replace(/(const \[localConfig, setLocalConfig\] = useState<VoiceGPTConfig>\([\s\S]*?\n  \}\);\n)/, `$1${chartLogic}`);

// Replace AreaChart data to use chartData
content = content.replace(/<AreaChart data=\{stats\.dailyUsage\}>/, `<AreaChart data={chartData}>`);
// And the empty state check:
content = content.replace(/\{stats\.dailyUsage && stats\.dailyUsage\.length > 0 \? \(/, `{stats.totalMessages > 0 || (stats.dailyUsage && stats.dailyUsage.length > 0) ? (`);

fs.writeFileSync('src/components/AgentAnalytics.tsx', content);
