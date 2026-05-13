const fs = require('fs');
const path = require('path');

const srcFile = '/Users/eliasespinoza/.gemini/antigravity/brain/62815f13-fd35-4040-97f1-113008d514ef/media__1778635137908.png';
const destDir = path.join(__dirname, 'assets', 'images');
const destFile = path.join(destDir, 'logo.png');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

fs.copyFileSync(srcFile, destFile);
console.log(`Copied logo to ${destFile}`);
