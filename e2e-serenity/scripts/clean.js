const fs = require('fs');
const path = require('path');

const targets = ['target', 'reports'];

for (const dir of targets) {
  const fullPath = path.resolve(__dirname, '..', dir);
  if (fs.existsSync(fullPath)) {
    fs.rmSync(fullPath, { recursive: true, force: true });
  }
}
