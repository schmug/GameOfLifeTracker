#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Paths
const viteConfigPath = path.join(process.cwd(), 'vite.config.ts');
const packageJsonPath = path.join(process.cwd(), 'package.json');

// Read the vite config
console.log('📝 Modifying vite.config.ts for GitHub Pages deployment...');
let viteConfig = fs.readFileSync(viteConfigPath, 'utf8');

// Add base path for GitHub Pages
if (!viteConfig.includes('base:')) {
  viteConfig = viteConfig.replace(
    'export default defineConfig({',
    'export default defineConfig({\n  base: "/conways-game-of-life/",',
  );
} else {
  viteConfig = viteConfig.replace(
    /base: ["'].*["'],/,
    'base: "/conways-game-of-life/",',
  );
}

// Write the updated vite config
fs.writeFileSync(viteConfigPath, viteConfig);
console.log('✅ Updated vite.config.ts with GitHub Pages base path');

// Build a GitHub Pages-specific index.html that doesn't require a backend
console.log('📝 Creating a GitHub Pages compatible build...');

// Execute the build command
console.log('🚀 Building the application...');