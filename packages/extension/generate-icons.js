#!/usr/bin/env node

/**
 * Generate icons for Chrome extension
 * This creates simple colored square icons with a 'B' for Beads
 */

const fs = require('fs');
const path = require('path');

// Create a minimal valid PNG file (1x1 pixel blue square)
// This is a base64-encoded minimal PNG
const minimalPNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

const sizes = [16, 48, 128];
const iconsDir = path.join(__dirname, 'icons');

// Create icons directory if it doesn't exist
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('Creating placeholder icons...');
console.log('Note: These are minimal placeholder icons.');
console.log('For production, replace with proper icons using create-icons.html\n');

// For now, create a script that will help generate proper icons
// Since we can't easily create PNGs without additional dependencies,
// we'll create a more detailed instruction file

const instructions = `# Icon Generation Instructions

Since automatic icon generation requires additional image processing libraries,
please use one of these methods:

## Method 1: Using create-icons.html (Easiest)
1. Open create-icons.html in your browser
2. Right-click each icon and "Save image as"
3. Save to this folder as icon16.png, icon48.png, icon128.png

## Method 2: Using Online Tools
- https://www.favicon-generator.org/
- https://realfavicongenerator.net/
- Upload a 128x128 image and download all sizes

## Method 3: Using Image Editor
Create three PNG files:
- icon16.png (16x16 pixels)
- icon48.png (48x48 pixels)
- icon128.png (128x128 pixels)

Use a blue background (#0366d6) with a white 'B' or lens icon.
`;

fs.writeFileSync(path.join(iconsDir, 'GENERATE_ICONS.md'), instructions);

console.log('Created icon generation instructions in icons/GENERATE_ICONS.md');
console.log('\nFor Chrome Web Store submission, you MUST have icon files.');
console.log('Please generate them using create-icons.html before creating the zip.\n');

// Try to use ImageMagick if available
const { execSync } = require('child_process');

let hasImageMagick = false;
try {
  execSync('which convert', { stdio: 'ignore' });
  hasImageMagick = true;
} catch (e) {
  // ImageMagick not available
}

if (hasImageMagick) {
  console.log('Found ImageMagick, generating icons...');
  try {
    for (const size of sizes) {
      const cmd = `convert -size ${size}x${size} xc:#0366d6 -fill white -gravity center -pointsize ${
        size * 0.6
      } -annotate +0+0 'B' ${iconsDir}/icon${size}.png`;
      execSync(cmd, { stdio: 'ignore' });
      console.log(`Created icon${size}.png`);
    }
    console.log('Icons created successfully!');
  } catch (e) {
    console.log('Error creating icons with ImageMagick:', e.message);
    console.log('Please use create-icons.html instead.');
  }
} else {
  console.log('ImageMagick not found. Please use create-icons.html to generate icons.');
}

