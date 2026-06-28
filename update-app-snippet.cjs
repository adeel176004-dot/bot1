const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const searchPre = '{`<script>\\n  window.VOICEGPT_CONFIG = {\\n    websiteName: ${JSON.stringify(saasConfig.websiteName)},\\n    agentName: ${JSON.stringify(saasConfig.agentName)},\\n    websiteLinks: ${JSON.stringify(saasConfig.websiteLinks.filter(l => l.trim()))},\\n    customInstructions: ${JSON.stringify(saasConfig.customInstructions)}\\n  };\\n</script>\\n<script src="${window.location.origin}/embed.js" async></script>`}';

const replacementPre = '{`<script>\\n' +
'  window.AGENTVOX_CONFIG = {\\n' +
'    websiteName: ${JSON.stringify(saasConfig.websiteName)},\\n' +
'    agentName: ${JSON.stringify(saasConfig.agentName)},\\n' +
'    websiteLinks: ${JSON.stringify(saasConfig.websiteLinks.filter(l => l.trim()))},\\n' +
'    customInstructions: ${JSON.stringify(saasConfig.customInstructions)}\\n' +
'  };\\n' +
'  var script = document.createElement("script");\\n' +
'  script.src = "${window.location.origin}/embed.js";\\n' +
'  document.body.appendChild(script);\\n' +
'</script>`}';

code = code.replace(searchPre, replacementPre);

const searchClip = 'window.navigator.clipboard.writeText(`<script>\\n  window.VOICEGPT_CONFIG = {\\n    websiteName: ${JSON.stringify(saasConfig.websiteName)},\\n    agentName: ${JSON.stringify(saasConfig.agentName)},\\n    websiteLinks: ${JSON.stringify(saasConfig.websiteLinks.filter(l => l.trim()))},\\n    customInstructions: ${JSON.stringify(saasConfig.customInstructions)}\\n  };\\n</script>\\n<script src="${window.location.origin}/embed.js" async></script>`);';

const replacementClip = 'window.navigator.clipboard.writeText(`<script>\\n' +
'  window.AGENTVOX_CONFIG = {\\n' +
'    websiteName: ${JSON.stringify(saasConfig.websiteName)},\\n' +
'    agentName: ${JSON.stringify(saasConfig.agentName)},\\n' +
'    websiteLinks: ${JSON.stringify(saasConfig.websiteLinks.filter(l => l.trim()))},\\n' +
'    customInstructions: ${JSON.stringify(saasConfig.customInstructions)}\\n' +
'  };\\n' +
'  var script = document.createElement("script");\\n' +
'  script.src = "${window.location.origin}/embed.js";\\n' +
'  document.body.appendChild(script);\\n' +
'</script>`);';

code = code.replace(searchClip, replacementClip);

fs.writeFileSync('src/App.tsx', code);
console.log('Done');
