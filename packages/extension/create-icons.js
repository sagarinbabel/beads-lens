#!/usr/bin/env node

/**
 * Simple script to create placeholder icons for the extension
 * 
 * Usage: node create-icons.js
 * 
 * Note: This requires a canvas library. If you don't have one installed,
 * use create-icons.html instead (open in browser and save the images).
 */

const fs = require('fs');
const path = require('path');

const sizes = [16, 48, 128];
const iconsDir = path.join(__dirname, 'icons');

// Create icons directory if it doesn't exist
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('Icon creation script');
console.log('===================');
console.log('');
console.log('For the fastest setup, use create-icons.html:');
console.log('1. Open create-icons.html in your browser');
console.log('2. Right-click each icon and "Save image as"');
console.log('3. Save to the icons/ folder');
console.log('');
console.log('Alternatively, install a canvas library and run this script:');
console.log('  npm install canvas');
console.log('');
console.log('Or create icons manually using any image editor.');
console.log('');
console.log(`Icons directory: ${iconsDir}`);
console.log(`Required files: icon16.png, icon48.png, icon128.png`);

