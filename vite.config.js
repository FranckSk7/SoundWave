import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons.svg'],
      manifest: {
        name: 'SoundWave CM',
        short_name: 'SoundWave',
        description: 'La musique camerounaise partout avec toi',
        theme_color: '#0a0a0a',
        background_color: '#0a0a0a',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: '/favicon.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any maskable' },
          { src: '/favicon.svg', sizes: '512x512', type: 'image/svg+xml' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/cdlplywmvqeidaddcmjg\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
          {
            urlPattern: /\.mp3$|\.m4a$|\.ogg$|\.wav$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'audio-cache',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 7 },
              rangeRequests: true,
            },
          },
        ],
      },
    }),
  ],
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        // Vite 8 uses rolldown — manualChunks must be a function
        manualChunks(id) {
          if (id.includes('node_modules/@supabase'))        return 'supabase'
          if (id.includes('node_modules/@tanstack'))        return 'query'
          if (id.includes('node_modules/zustand'))          return 'zustand'
          if (id.includes('node_modules/react-router-dom')) return 'router'
          if (id.includes('node_modules/react-dom'))        return 'react-dom'
          if (id.includes('node_modules/react/'))           return 'react'
        },
      },
    },
  },
})
