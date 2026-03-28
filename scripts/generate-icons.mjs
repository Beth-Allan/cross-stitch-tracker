import sharp from "sharp";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

async function generateIcon(size) {
  // Emerald background with a white cross-stitch "X" motif
  const padding = Math.floor(size * 0.15);
  const strokeWidth = Math.floor(size * 0.06);
  const innerSize = size - padding * 2;

  // Create SVG with emerald background and cross-stitch X pattern
  const gridSize = Math.floor(size * 0.08);
  const gridStart = padding + Math.floor(innerSize * 0.2);
  const gridEnd = padding + Math.floor(innerSize * 0.8);

  // Build cross-stitch X pattern using small squares (like pixels)
  let stitchPixels = "";
  const pixelSize = gridSize;
  const cols = Math.floor((gridEnd - gridStart) / pixelSize);

  for (let i = 0; i < cols; i++) {
    const x1 = gridStart + i * pixelSize;
    const y1 = gridStart + i * pixelSize;
    // Main diagonal
    stitchPixels += `<rect x="${x1}" y="${y1}" width="${pixelSize}" height="${pixelSize}" fill="white" opacity="0.95" rx="${Math.floor(pixelSize * 0.1)}"/>`;
    // Anti-diagonal
    const x2 = gridStart + i * pixelSize;
    const y2 = gridStart + (cols - 1 - i) * pixelSize;
    stitchPixels += `<rect x="${x2}" y="${y2}" width="${pixelSize}" height="${pixelSize}" fill="white" opacity="0.95" rx="${Math.floor(pixelSize * 0.1)}"/>`;
  }

  // Add subtle grid lines for cross-stitch fabric texture
  let gridLines = "";
  for (let i = gridStart; i <= gridEnd; i += pixelSize) {
    gridLines += `<line x1="${gridStart}" y1="${i}" x2="${gridEnd}" y2="${i}" stroke="white" stroke-opacity="0.15" stroke-width="1"/>`;
    gridLines += `<line x1="${i}" y1="${gridStart}" x2="${i}" y2="${gridEnd}" stroke="white" stroke-opacity="0.15" stroke-width="1"/>`;
  }

  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" fill="#059669" rx="${Math.floor(size * 0.12)}"/>
    ${gridLines}
    ${stitchPixels}
  </svg>`;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(join(publicDir, `icon-${size}x${size}.png`));

  console.log(`Generated icon-${size}x${size}.png`);
}

await generateIcon(192);
await generateIcon(512);
console.log("PWA icons generated successfully");
