const fs = require('fs');
const path = require('path');

const srcDir = '/Users/eliasespinoza/.gemini/antigravity/brain/62815f13-fd35-4040-97f1-113008d514ef';
const destDir = '/Volumes/Programas/1.- Archivos de IA/1.- Proyectos Personales/1. Antigravity/Barbacoa Tatemada/assets/images';

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

const files = fs.readdirSync(srcDir);

const chilaquilesFile = files.find(f => f.startsWith('chilaquiles_barbacoa') && f.endsWith('.png'));
const birriaFile = files.find(f => f.startsWith('birria_en_caldo') && f.endsWith('.png'));

if (chilaquilesFile) {
    fs.copyFileSync(path.join(srcDir, chilaquilesFile), path.join(destDir, 'chilaquiles_barbacoa.png'));
    console.log('✅ Chilaquiles copiados correctamente.');
} else {
    console.log('❌ No se encontró la imagen de Chilaquiles.');
}

if (birriaFile) {
    fs.copyFileSync(path.join(srcDir, birriaFile), path.join(destDir, 'birria_en_caldo.png'));
    console.log('✅ Birria copiada correctamente.');
} else {
    console.log('❌ No se encontró la imagen de Birria.');
}
