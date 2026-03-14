#!/bin/bash
# Fix Vite cache issues

echo "🧹 Cleaning Vite cache..."

# Remove node_modules/.vite
rm -rf node_modules/.vite

# Remove dist
rm -rf dist

# Clear npm cache (optional)
# npm cache clean --force

echo "✅ Cache cleaned!"
echo "Now run: npm run dev"
