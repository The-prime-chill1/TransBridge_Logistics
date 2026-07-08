import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// Automatically copy the uploaded background image from the session artifacts into public folder
const sourcePath = 'C:\\Users\\Hp\\.gemini\\antigravity-ide\\brain\\12b336ea-200d-4ec6-addf-9abafb558845\\media__1783540638623.jpg';
const destPath = path.resolve(__dirname, 'public/hero-bg.jpg');
try {
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath);
    console.log('Successfully copied background image to public/hero-bg.jpg!');
  } else {
    console.warn('Source background image not found at: ' + sourcePath);
  }
} catch (err) {
  console.error('Failed to copy background image:', err);
}

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          animations: ['framer-motion', 'gsap'],
        },
      },
    },
  },
})
