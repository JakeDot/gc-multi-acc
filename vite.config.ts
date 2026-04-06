import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import { VitePWA } from 'vite-plugin-pwa';
import manifest from './manifest.json';

export default defineConfig({
  plugins: [
    react(),
    // Extension support
    crx({ manifest }),
    // PWA support
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'GC Multi-Acc Pro',
        short_name: 'GCPro',
        description: 'Multi-account manager for Gartic.io',
        theme_color: '#0f172a',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ],
  server: {
    port: 3000,
    strictPort: true,
    hmr: { port: 3000 }
  }
});
