const fs = require('fs');
const path = require('path');

const source = 'C:\\Users\\Hp\\.gemini\\antigravity-ide\\brain\\12b336ea-200d-4ec6-addf-9abafb558845\\media__1783540638623.jpg';
const dest = path.join(__dirname, 'public', 'hero-bg.jpg');

try {
  fs.copyFileSync(source, dest);
  console.log('Image copied successfully from ' + source + ' to ' + dest);
} catch (err) {
  console.error('Error copying file:', err);
  process.exit(1);
}
