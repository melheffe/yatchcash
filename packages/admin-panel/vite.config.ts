import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  // Load env file from root directory
  const env = loadEnv(mode, process.cwd() + '/../../', '');
  
  const apiPort = env.API_PORT || '3001';
  const adminPort = env.ADMIN_PANEL_PORT || '3000';

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          maximumFileSizeToCacheInBytes: 5000000,
        },
        manifest: {
          name: 'YachtCash Admin',
          short_name: 'YachtCash Admin',
          description: 'Maritime petty cash management admin panel',
          theme_color: '#1976d2',
          background_color: '#ffffff',
          display: 'standalone',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        }
      })
    ],
    server: {
      port: parseInt(adminPort),
      proxy: {
        '/api': {
          target: `http://localhost:${apiPort}`,
          changeOrigin: true
        }
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: true
    },
    envDir: '../../', // Load .env from root directory
    envPrefix: ['VITE_', 'ADMIN_PANEL_', 'API_'] // Allow these prefixes
  };
}); 