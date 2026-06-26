const fs = require('fs');

function updateFile() {
    let code = fs.readFileSync('src/App.tsx', 'utf-8');

    // Replacement for the <pre> tag section
    const startStr1 = "<pre className=\"text-slate-300 text-sm overflow-x-auto font-mono leading-relaxed h-[400px] whitespace-pre-wrap\">\n{`<script>";
    const endStr1 = "})();\n</script>`}\n                  </pre>";
    const startIndex1 = code.indexOf(startStr1);
    const endIndex1 = code.indexOf(endStr1, startIndex1) + endStr1.length;
    
    if (startIndex1 === -1 || endIndex1 === -1 || endIndex1 < startIndex1) {
        console.error("Could not find pre tag section!");
        process.exit(1);
    }
    
    const replaceNew1 = `<pre className="text-slate-300 text-sm overflow-x-auto font-mono leading-relaxed h-[180px] whitespace-pre-wrap">
{\`<script>
  window.AGENTVOX_CONFIG = {
    websiteName: "\${saasConfig.websiteName.replace(/"/g, '\\\\"')}",
    agentName: "\${saasConfig.agentName.replace(/"/g, '\\\\"')}",
    websiteLinks: \${JSON.stringify(saasConfig.websiteLinks.filter(l => l.trim()))},
    customInstructions: \${JSON.stringify(saasConfig.customInstructions)}
  };
</script>
<script src="\${window.location.origin}/embed.js" async></script>\`}
                  </pre>`;

    code = code.substring(0, startIndex1) + replaceNew1 + code.substring(endIndex1);

    // Replacement for the clipboard section
    const startStr2 = "onClick={() => {\n                        window.navigator.clipboard.writeText(`<script>";
    const endStr2 = "})();\n</script>`);";
    
    const startIndex2 = code.indexOf(startStr2);
    const endIndex2 = code.indexOf(endStr2, startIndex2) + endStr2.length;
    
    if (startIndex2 === -1 || endIndex2 === -1 || endIndex2 < startIndex2) {
        console.error("Could not find clipboard section!");
        process.exit(1);
    }
    
    const replaceNew2 = `onClick={() => {
                        window.navigator.clipboard.writeText(\`<script>
  window.AGENTVOX_CONFIG = {
    websiteName: "\${saasConfig.websiteName.replace(/"/g, '\\\\"')}",
    agentName: "\${saasConfig.agentName.replace(/"/g, '\\\\"')}",
    websiteLinks: \${JSON.stringify(saasConfig.websiteLinks.filter(l => l.trim()))},
    customInstructions: \${JSON.stringify(saasConfig.customInstructions)}
  };
</script>
<script src="\${window.location.origin}/embed.js" async></script>\`);`;
    
    code = code.substring(0, startIndex2) + replaceNew2 + code.substring(endIndex2);

    fs.writeFileSync('src/App.tsx', code);
    console.log("Updated App.tsx successfully");
}

updateFile();
