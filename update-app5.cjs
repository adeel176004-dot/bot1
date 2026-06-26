const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

let replaceStr = '{`<script>\\n' +
'  window.AGENTVOX_CONFIG = {\\n' +
'    websiteName: ${JSON.stringify(saasConfig.websiteName)},\\n' +
'    agentName: ${JSON.stringify(saasConfig.agentName)},\\n' +
'    websiteLinks: ${JSON.stringify(saasConfig.websiteLinks.filter(l => l.trim()))},\\n' +
'    customInstructions: ${JSON.stringify(saasConfig.customInstructions)}\\n' +
'  };\\n' +
'</script>\\n' +
'<script src="${window.location.origin}/embed.js" async></script>`}';

let replaceStr2 = 'window.navigator.clipboard.writeText(`<script>\\n' +
'  window.AGENTVOX_CONFIG = {\\n' +
'    websiteName: ${JSON.stringify(saasConfig.websiteName)},\\n' +
'    agentName: ${JSON.stringify(saasConfig.agentName)},\\n' +
'    websiteLinks: ${JSON.stringify(saasConfig.websiteLinks.filter(l => l.trim()))},\\n' +
'    customInstructions: ${JSON.stringify(saasConfig.customInstructions)}\\n' +
'  };\\n' +
'</script>\\n' +
'<script src="${window.location.origin}/embed.js" async></script>`);';

const start1 = code.indexOf('{`<script>');
const end1 = code.indexOf('</script>`}', start1);
if (start1 !== -1 && end1 !== -1) {
    code = code.substring(0, start1) + replaceStr + code.substring(end1 + '</script>`}'.length);
}

const start2 = code.indexOf('window.navigator.clipboard.writeText(`<script>');
const end2 = code.indexOf('</script>`);', start2);
if (start2 !== -1 && end2 !== -1) {
    code = code.substring(0, start2) + replaceStr2 + code.substring(end2 + '</script>`);'.length);
}

fs.writeFileSync('src/App.tsx', code);
console.log('Done');
