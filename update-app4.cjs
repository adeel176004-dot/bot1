const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace everything between {`<script> and </script>`} that has (function()
const regex1 = /\{`<script>[\s\S]*?\(function\(\) \{[\s\S]*?<\/script>`\}\\n\s*<\/pre>/;
const replacement1 = '{`<script>\\n' +
'  window.AGENTVOX_CONFIG = {\\n' +
'    websiteName: ${JSON.stringify(saasConfig.websiteName)},\\n' +
'    agentName: ${JSON.stringify(saasConfig.agentName)},\\n' +
'    websiteLinks: ${JSON.stringify(saasConfig.websiteLinks.filter(l => l.trim()))},\\n' +
'    customInstructions: ${JSON.stringify(saasConfig.customInstructions)}\\n' +
'  };\\n' +
'</script>\\n' +
'<script src="${window.location.origin}/embed.js" async></script>`}\\n' +
'                  </pre>';

code = code.replace(regex1, replacement1);

const regex2 = /window\.navigator\.clipboard\.writeText\(`<script>[\s\S]*?\(function\(\) \{[\s\S]*?<\/script>`\);/;
const replacement2 = 'window.navigator.clipboard.writeText(`<script>\\n' +
'  window.AGENTVOX_CONFIG = {\\n' +
'    websiteName: ${JSON.stringify(saasConfig.websiteName)},\\n' +
'    agentName: ${JSON.stringify(saasConfig.agentName)},\\n' +
'    websiteLinks: ${JSON.stringify(saasConfig.websiteLinks.filter(l => l.trim()))},\\n' +
'    customInstructions: ${JSON.stringify(saasConfig.customInstructions)}\\n' +
'  };\\n' +
'</script>\\n' +
'<script src="${window.location.origin}/embed.js" async></script>`);';

code = code.replace(regex2, replacement2);

fs.writeFileSync('src/App.tsx', code);
console.log("Done");
