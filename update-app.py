import os

with open('src/App.tsx', 'r') as f:
    code = f.read()

# Pre block replacement
pre_start = '{`<script>\\n(function() {\\n    var config = {'
pre_end = '})();\\n</script>`}\\n                  </pre>'

idx_start = code.find(pre_start)
idx_end = code.find(pre_end)
if idx_start != -1 and idx_end != -1:
    idx_end += len(pre_end)
    replacement = """{`<script>
  window.AGENTVOX_CONFIG = {
    websiteName: "${saasConfig.websiteName.replace(/\"/g, '\\\\\"')}",
    agentName: "${saasConfig.agentName.replace(/\"/g, '\\\\\"')}",
    websiteLinks: ${JSON.stringify(saasConfig.websiteLinks.filter(l => l.trim()))},
    customInstructions: ${JSON.stringify(saasConfig.customInstructions)}
  };
</script>
<script src="${window.location.origin}/embed.js" async></script>`}
                  </pre>"""
    code = code[:idx_start] + replacement + code[idx_end:]


# Clipboard replacement
clip_start = 'window.navigator.clipboard.writeText(`<script>\\n(function() {\\n    var config = {'
clip_end = '})();\\n</script>`);'

idx_start = code.find(clip_start)
idx_end = code.find(clip_end)
if idx_start != -1 and idx_end != -1:
    idx_end += len(clip_end)
    replacement = """window.navigator.clipboard.writeText(`<script>
  window.AGENTVOX_CONFIG = {
    websiteName: "${saasConfig.websiteName.replace(/\"/g, '\\\\\"')}",
    agentName: "${saasConfig.agentName.replace(/\"/g, '\\\\\"')}",
    websiteLinks: ${JSON.stringify(saasConfig.websiteLinks.filter(l => l.trim()))},
    customInstructions: ${JSON.stringify(saasConfig.customInstructions)}
  };
</script>
<script src="${window.location.origin}/embed.js" async></script>`);"""
    code = code[:idx_start] + replacement + code[idx_end:]


with open('src/App.tsx', 'w') as f:
    f.write(code)

print("Updated App.tsx successfully")
