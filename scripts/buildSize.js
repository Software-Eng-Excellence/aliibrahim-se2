const fs = require('fs');
const path = require('path');

function dirSize(dir) {
  let total = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name);
    total += entry.isDirectory() ? dirSize(entryPath) : fs.statSync(entryPath).size;
  }
  return total;
}

const buildDir = path.join(__dirname, '..', 'build');
const kb = dirSize(buildDir) / 1024;
console.log(`Build size: ${kb.toFixed(2)} KB`);
