import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const isVercel = !!process.env.VERCEL

export default defineConfig({
  base: isVercel ? '/' : './',
  build: {
    assetsDir: '.',
    rollupOptions: {
      output: {
        manualChunks: undefined,
        inlineDynamicImports: true,
        entryFileNames: 'bundle.js',
        assetFileNames: '[name][extname]',
      }
    }
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: '竹笛每日练',
        short_name: '竹笛练习',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#f5f0e8',
        theme_color: '#2d5016',
        start_url: isVercel ? '/' : './',
        icons: [
          { src: isVercel ? '/icons/icon-192.png' : './icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: isVercel ? '/icons/icon-512.png' : './icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: isVercel ? '/icons/icon-512-maskable.png' : './icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg}']
      }
    })
  ]
})
