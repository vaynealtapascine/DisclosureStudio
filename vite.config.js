import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({
  plugins: [
    svelte(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt'],
      manifest: {
        name: 'Disclosure Studio',
        short_name: 'Disclosure',
        description: 'AI transparency disclosure cards',
        theme_color: '#572580',
        background_color: '#f6f3f8',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        icons: [
          { src: 'icons/72x72.png', sizes: '72x72', type: 'image/png', purpose: 'any maskable' },
          { src: 'icons/96x96.png', sizes: '96x96', type: 'image/png', purpose: 'any maskable' },
          { src: 'icons/128x128.png', sizes: '128x128', type: 'image/png', purpose: 'any maskable' },
          { src: 'icons/144x144.png', sizes: '144x144', type: 'image/png', purpose: 'any maskable' },
          { src: 'icons/152x152.png', sizes: '152x152', type: 'image/png', purpose: 'any maskable' },
          { src: 'icons/192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: 'icons/384x384.png', sizes: '384x384', type: 'image/png', purpose: 'any maskable' },
          { src: 'icons/512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,ttf,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        cleanupOutdatedCaches: true
      }
    })
  ],
  base: './',
  server: { host: '127.0.0.1', port: 5178, strictPort: true }
});