const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const s1 = '{`<script>\\n(function() {';
let start1 = code.indexOf(s1);
if (start1 === -1) {
    console.log("Could not find start1");
} else {
    let end1 = code.indexOf('</script>`}\\n                  </pre>', start1);
    if (end1 !== -1) {
        let replaceStr = '{`<script>\\n' +
        '  window.AGENTVOX_CONFIG = {\\n' +
        '    websiteName: ${JSON.stringify(saasConfig.websiteName)},\\n' +
        '    agentName: ${JSON.stringify(saasConfig.agentName)},\\n' +
        '    websiteLinks: ${JSON.stringify(saasConfig.websiteLinks.filter(l => l.trim()))},\\n' +
        '    customInstructions: ${JSON.stringify(saasConfig.customInstructions)}\\n' +
        '  };\\n' +
        '</script>\\n' +
        '<script src="${window.location.origin}/embed.js" async></script>`}\\n' +
        '                  </pre>';
        code = code.substring(0, start1) + replaceStr + code.substring(end1 + '</script>`}\\n                  </pre>'.length);
    }
}

const s2 = 'window.navigator.clipboard.writeText(`<script>\\n(function() {';
let start2 = code.indexOf(s2);
if (start2 === -1) {
    console.log("Could not find start2");
} else {
    let end2 = code.indexOf('</script>`);', start2);
    if (end2 !== -1) {
        let replaceStr = 'window.navigator.clipboard.writeText(`<script>\\n' +
        '  window.AGENTVOX_CONFIG = {\\n' +
        '    websiteName: ${JSON.stringify(saasConfig.websiteName)},\\n' +
        '    agentName: ${JSON.stringify(saasConfig.agentName)},\\n' +
        '    websiteLinks: ${JSON.stringify(saasConfig.websiteLinks.filter(l => l.trim()))},\\n' +
        '    customInstructions: ${JSON.stringify(saasConfig.customInstructions)}\\n' +
        '  };\\n' +
        '</script>\\n' +
        '<script src="${window.location.origin}/embed.js" async></script>`);';
        code = code.substring(0, start2) + replaceStr + code.substring(end2 + '</script>`);'.length);
    }
}

fs.writeFileSync('src/App.tsx', code);
console.log("Done");
