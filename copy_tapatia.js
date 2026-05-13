const fs = require('fs');
const path = require('path');

const srcDir = '/Users/eliasespinoza/.gemini/antigravity/brain/62815f13-fd35-4040-97f1-113008d514ef';
const destDir = path.join(__dirname, 'assets', 'images');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const files = fs.readdirSync(srcDir);
const tapatiaFile = files.find(f => f.startsWith('tapatia_barbacoa') && f.endsWith('.png'));

if (tapatiaFile) {
  fs.copyFileSync(path.join(srcDir, tapatiaFile), path.join(destDir, 'tapatia_barbacoa.png'));
  console.log(`Copied ${tapatiaFile} to tapatia_barbacoa.png`);
} else {
  console.log('Tapatia image not found');
}
