import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

// Custom plugin to serve files from /outputs/ directly
// This bypasses Vite's HTML transform for terrain.html, which contains binary data
// that crashes parse5 with 'control-character-in-input-stream'
const serveOutputsPlugin = () => {
  return {
    name: 'serve-outputs-static',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith('/outputs/')) {
          // Remove query params if any
          const cleanUrl = req.url.split('?')[0];
          const filePath = path.join(process.cwd(), cleanUrl);
          if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath);
            if (cleanUrl.endsWith('.html')) {
              res.setHeader('Content-Type', 'text/html');
            } else if (cleanUrl.endsWith('.glb')) {
              res.setHeader('Content-Type', 'model/gltf-binary');
            } else if (cleanUrl.endsWith('.png')) {
              res.setHeader('Content-Type', 'image/png');
            } else if (cleanUrl.endsWith('.npy')) {
              res.setHeader('Content-Type', 'application/octet-stream');
            } else if (cleanUrl.endsWith('.tif') || cleanUrl.endsWith('.tiff')) {
              res.setHeader('Content-Type', 'image/tiff');
            }
            res.end(content);
            return;
          }
        }
        next();
      });
    }
  };
};

export default defineConfig({
  plugins: [react(), serveOutputsPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    fs: {
      allow: ['.', './outputs', './data'],
    },
  },
});
