import { writeFileSync, mkdirSync } from 'fs';
import { createCanvas } from 'canvas';

const sizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];
const dir = 'public/icons';
mkdirSync(dir, { recursive: true });

for (const size of sizes) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#572580');
  gradient.addColorStop(1, '#8553ac');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  
  // Warning triangle (white)
  const cx = size / 2;
  const cy = size / 2;
  const triSize = size * 0.45;
  const h = triSize * Math.sqrt(3) / 2;
  
  ctx.beginPath();
  ctx.moveTo(cx, cy - h * 2/3);
  ctx.lineTo(cx + triSize/2, cy + h/3);
  ctx.lineTo(cx - triSize/2, cy + h/3);
  ctx.closePath();
  ctx.fillStyle = 'white';
  ctx.fill();
  
  // Exclamation mark
  const markSize = size * 0.15;
  ctx.fillStyle = '#572580';
  ctx.beginPath();
  ctx.roundRect(cx - markSize/2, cy - h/3, markSize, h * 0.6, markSize/2);
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(cx, cy + h/3 - markSize * 1.2, markSize/2, 0, Math.PI * 2);
  ctx.fill();
  
  const buffer = canvas.toBuffer('image/png');
  writeFileSync(`${dir}/${size}x${size}.png`, buffer);
  console.log(`Generated ${size}x${size}.png`);
}

// Also create 128x128@2x.png
const canvas2x = createCanvas(256, 256);
const ctx2x = canvas2x.getContext('2d');
const gradient2x = ctx2x.createLinearGradient(0, 0, 256, 256);
gradient2x.addColorStop(0, '#572580');
gradient2x.addColorStop(1, '#8553ac');
ctx2x.fillStyle = gradient2x;
ctx2x.fillRect(0, 0, 256, 256);

const cx2 = 128;
const cy2 = 128;
const triSize2 = 115;
const h2 = triSize2 * Math.sqrt(3) / 2;

ctx2x.beginPath();
ctx2x.moveTo(cx2, cy2 - h2 * 2/3);
ctx2x.lineTo(cx2 + triSize2/2, cy2 + h2/3);
ctx2x.lineTo(cx2 - triSize2/2, cy2 + h2/3);
ctx2x.closePath();
ctx2x.fillStyle = 'white';
ctx2x.fill();

const markSize2 = 38;
ctx2x.fillStyle = '#572580';
ctx2x.beginPath();
ctx2x.roundRect(cx2 - markSize2/2, cy2 - h2/3, markSize2, h2 * 0.6, markSize2/2);
ctx2x.fill();
ctx2x.beginPath();
ctx2x.arc(cx2, cy2 + h2/3 - markSize2 * 1.2, markSize2/2, 0, Math.PI * 2);
ctx2x.fill();

writeFileSync(`${dir}/128x128@2x.png`, canvas2x.toBuffer('image/png'));
console.log('Generated 128x128@2x.png');

// Create ICO and ICNS using the 256px version
const icoCanvas = createCanvas(256, 256);
const icoCtx = icoCanvas.getContext('2d');
icoCtx.drawImage(canvas2x, 0, 0);
writeFileSync('src-tauri/icons/icon.ico', icoCanvas.toBuffer('image/png'));
console.log('Generated icon.ico (as png, will need conversion)');

const icnsCanvas = createCanvas(1024, 1024);
const icnsCtx = icnsCanvas.getContext('2d');
icnsCtx.drawImage(canvas2x, 0, 0, 1024, 1024);
writeFileSync('src-tauri/icons/icon.icns', icnsCanvas.toBuffer('image/png'));
console.log('Generated icon.icns (as png, will need conversion)');

console.log('All icons generated. Note: .ico and .icns need proper conversion tools.');