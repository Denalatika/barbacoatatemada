const fs = require('fs');
const path = require('path');

const srcDir = '/Users/eliasespinoza/.gemini/antigravity/brain/62815f13-fd35-4040-97f1-113008d514ef';
const destDir = path.join(__dirname, 'assets', 'images');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const files = fs.readdirSync(srcDir);

files.forEach(file => {
  if (file.endsWith('.png')) {
    let destFile = '';
    if (file.includes('hero_barbacoa')) destFile = 'hero_barbacoa.png';
    else if (file.includes('sopes_barbacoa')) destFile = 'sopes_barbacoa.png';
    else if (file.includes('consome_barbacoa')) destFile = 'consome_barbacoa.png';
    else if (file.includes('orden_familiar')) destFile = 'orden_familiar.png';
    
    if (destFile) {
      fs.copyFileSync(path.join(srcDir, file), path.join(destDir, destFile));
      console.log(`Copied ${file} to ${destFile}`);
    }
  }
});
