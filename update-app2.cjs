const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf-8');

const startTarget1 = '{`<script>\\n(function() {';
const endTarget1 = '})();\\n</script>`}\\n                  </pre>';

let idx1 = code.indexOf(startTarget1);
let idx2 = code.indexOf(endTarget1);

if (idx1 !== -1 && idx2 !== -1) {
    let part1 = code.substring(0, idx1);
    let part2 = code.substring(idx2 + endTarget1.length);
    
    let replaceStr1 = '{`<script>\\n' +
    '  window.AGENTVOX_CONFIG = {\\n' +
    '    websiteName: ${JSON.stringify(saasConfig.websiteName)},\\n' +
    '    agentName: ${JSON.stringify(saasConfig.agentName)},\\n' +
    '    websiteLinks: ${JSON.stringify(saasConfig.websiteLinks.filter(l => l.trim()))},\\n' +
    '    customInstructions: ${JSON.stringify(saasConfig.customInstructions)}\\n' +
    '  };\\n' +
    '</script>\\n' +
    '<script src="${window.location.origin}/embed.js" async></script>`}\\n' +
    '                  </pre>';
    
    code = part1 + replaceStr1 + part2;
} else {
    console.log("Could not find targets 1");
}

const startTarget2 = 'window.navigator.clipboard.writeText(`<script>\\n(function() {';
const endTarget2 = '})();\\n</script>`);';

idx1 = code.indexOf(startTarget2);
idx2 = code.indexOf(endTarget2);

if (idx1 !== -1 && idx2 !== -1) {
    let part1 = code.substring(0, idx1);
    let part2 = code.substring(idx2 + endTarget2.length);
    
    let replaceStr2 = 'window.navigator.clipboard.writeText(`<script>\\n' +
    '  window.AGENTVOX_CONFIG = {\\n' +
    '    websiteName: ${JSON.stringify(saasConfig.websiteName)},\\n' +
    '    agentName: ${JSON.stringify(saasConfig.agentName)},\\n' +
    '    websiteLinks: ${JSON.stringify(saasConfig.websiteLinks.filter(l => l.trim()))},\\n' +
    '    customInstructions: ${JSON.stringify(saasConfig.customInstructions)}\\n' +
    '  };\\n' +
    '</script>\\n' +
    '<script src="${window.location.origin}/embed.js" async></script>`);';
    
    code = part1 + replaceStr2 + part2;
} else {
    console.log("Could not find targets 2");
}

fs.writeFileSync('src/App.tsx', code);
console.log('Success completely');
