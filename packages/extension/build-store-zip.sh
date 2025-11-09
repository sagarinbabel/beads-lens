#!/bin/bash

# Build Chrome Web Store zip file
# This creates a zip with only the files needed for the Chrome Web Store

EXTENSION_DIR="$(cd "$(dirname "$0")" && pwd)"
ZIP_NAME="beads-lens-extension-v0.1.0.zip"
TEMP_DIR=$(mktemp -d)

echo "Building Chrome Web Store zip..."

# Copy necessary files directly to temp dir (no subdirectory)
# Copy manifest
cp "$EXTENSION_DIR/manifest.json" "$TEMP_DIR/"

# Copy HTML files (exclude dev files)
for file in "$EXTENSION_DIR"/*.html; do
  if [[ -f "$file" ]]; then
    filename=$(basename "$file")
    if [[ "$filename" != "create-icons.html" ]]; then
      cp "$file" "$TEMP_DIR/"
    fi
  fi
done

# Copy CSS files
cp "$EXTENSION_DIR"/*.css "$TEMP_DIR/" 2>/dev/null

# Copy JavaScript files (compiled, exclude dev files and source maps)
for file in "$EXTENSION_DIR"/*.js; do
  if [[ -f "$file" ]]; then
    filename=$(basename "$file")
    if [[ "$filename" != "*.map" && "$filename" != "create-icons.js" && "$filename" != "generate-icons.js" ]]; then
      cp "$file" "$TEMP_DIR/"
    fi
  fi
done

# Copy lib directory (JavaScript files only, no source maps)
mkdir -p "$TEMP_DIR/lib"
for file in "$EXTENSION_DIR/lib"/*.js; do
  if [[ -f "$file" && "$file" != *.map ]]; then
    cp "$file" "$TEMP_DIR/lib/"
  fi
done

# Copy icons
mkdir -p "$TEMP_DIR/icons"
cp "$EXTENSION_DIR/icons"/*.png "$TEMP_DIR/icons/" 2>/dev/null

# Create zip from temp dir (files at root level)
cd "$TEMP_DIR"
zip -r "$EXTENSION_DIR/$ZIP_NAME" . -x "*.DS_Store" "*.map" "*.ts" "*.tsx" "create-icons.*" "generate-icons.*" > /dev/null

# Cleanup
rm -rf "$TEMP_DIR"

echo "✅ Created: $ZIP_NAME"
echo ""
echo "Files included in zip:"
unzip -l "$EXTENSION_DIR/$ZIP_NAME" | grep -E "\.(js|html|css|json|png)$"

echo ""
echo "📍 Location: $EXTENSION_DIR/$ZIP_NAME"
echo "✅ Ready for Chrome Web Store submission!"

