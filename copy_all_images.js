const fs = require('fs');
const path = require('path');

const srcDir = '/Users/eliasespinoza/.gemini/antigravity/brain/62815f13-fd35-4040-97f1-113008d514ef';
const destDir = path.join(__dirname, 'assets', 'images');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const mapping = {
  'hero_barbacoa': 'hero_barbacoa.png',
  'sopes_barbacoa': 'sopes_barbacoa.png',
  'consome_barbacoa': 'consome_barbacoa.png',
  'orden_familiar': 'orden_familiar.png',
  'tapatia_barbacoa': 'tapatia_barbacoa.png',
  'taco_fundido_barbacoa': 'taco_fundido_barbacoa.png',
  'charreado_barbacoa': 'charreado_barbacoa.png',
  'chapala_especial_barbacoa': 'chapala_especial_barbacoa.png',
  'cafe_de_olla_barbacoa': 'cafe_de_olla.png',
  'aguas_frescas_barbacoa': 'aguas_frescas.png'
};

const files = fs.readdirSync(srcDir);

Object.keys(mapping).forEach(key => {
  const sourceFile = files.find(f => f.startsWith(key) && f.endsWith('.png'));
  if (sourceFile) {
    fs.copyFileSync(path.join(srcDir, sourceFile), path.join(destDir, mapping[key]));
    console.log(`Copied ${sourceFile} to ${mapping[key]}`);
  } else {
    console.log(`Image for ${key} not found`);
  }
});
