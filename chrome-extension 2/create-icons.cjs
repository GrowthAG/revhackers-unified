/**
 * Script para criar os ícones da extensão Ork a partir de uma imagem fonte
 * AGORA COM CENTER CROP AUTOMÁTICO PARA ALINHAMENTO PERFEITO
 * Execute: node create-icons.cjs
 */

const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

const sizes = [16, 48, 128];
const iconsDir = path.join(__dirname, 'icons');
// Imagem de alvo enviada pelo usuário
const sourceImage = 'C:/Users/Pichau/.gemini/antigravity/brain/9924d782-5613-496f-8b49-3e8692dd1b78/uploaded_image_1768406652029.png';

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

async function createIcons() {
    try {
        console.log(`Loading source image from: ${sourceImage}`);
        const image = await loadImage(sourceImage);

        // Calculate Center Crop specifics
        const minDim = Math.min(image.width, image.height);
        const sx = (image.width - minDim) / 2;
        const sy = (image.height - minDim) / 2;

        console.log(`Original Size: ${image.width}x${image.height}`);
        console.log(`Center Crop: ${minDim}x${minDim} starting at (${sx}, ${sy})`);

        sizes.forEach(size => {
            const canvas = createCanvas(size, size);
            const ctx = canvas.getContext('2d');

            // Draw Image with Center Crop
            // context.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
            ctx.drawImage(image, sx, sy, minDim, minDim, 0, 0, size, size);

            const buffer = canvas.toBuffer('image/png');
            const filename = path.join(iconsDir, `icon${size}.png`);
            fs.writeFileSync(filename, buffer);
            console.log(`Created (aligned): ${filename}`);
        });

        console.log('\nAll icons updated with PERFECT ALIGNMENT!');
    } catch (error) {
        console.error('Error processing image:', error);
    }
}

createIcons();
