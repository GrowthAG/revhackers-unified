/**
 * Script para criar os ícones da extensão Ork
 * 
 * Execute: node create-icons.js
 * Requer: npm install canvas
 */

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const sizes = [16, 48, 128];
const iconsDir = path.join(__dirname, 'icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

function drawIcon(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    const padding = size * 0.05;
    const center = size / 2;
    const radius = size / 2 - padding;

    // Background - Black circle
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fill();

    // Inner ring - RevGreen
    ctx.strokeStyle = '#03FC3B';
    ctx.lineWidth = size * 0.12;
    ctx.beginPath();
    ctx.arc(center, center, radius * 0.7, 0, Math.PI * 2);
    ctx.stroke();

    // Center dot - RevGreen
    ctx.fillStyle = '#03FC3B';
    ctx.beginPath();
    ctx.arc(center, center, radius * 0.25, 0, Math.PI * 2);
    ctx.fill();

    return canvas.toBuffer('image/png');
}

// Generate all sizes
sizes.forEach(size => {
    const buffer = drawIcon(size);
    const filename = path.join(iconsDir, `icon${size}.png`);
    fs.writeFileSync(filename, buffer);
    console.log(`Created: ${filename}`);
});

console.log('\\nAll icons created successfully!');
