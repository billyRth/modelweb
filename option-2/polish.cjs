const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace("const desktop = matchMedia('(min-width: 768px)');", "const useDesktop = matchMedia('(min-width: 768px)').matches;").replaceAll('desktop.matches', 'useDesktop');
const start = html.indexOf('  /* Hero entrances run in CSS');
const end = html.indexOf('  };\n  const startMotion', start);
html = html.slice(0, start) + html.slice(start, end).split('\n').map(line => line ? '  ' + line : line).join('\n') + html.slice(end);
fs.writeFileSync('index.html', html);
for (const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) {
  if (match[1].trim() && !match[0].includes('importmap')) new Function(match[1]);
}
console.log('All inline scripts parse.');
