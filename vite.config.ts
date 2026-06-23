import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

import { exec } from 'child_process';

const upscalePlugin = () => ({
  name: 'upscale-plugin',
  configureServer(server) {
    server.middlewares.use('/api/upscale', (req, res) => {
      if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
          try {
            const { hotelId } = JSON.parse(body);
            exec(`node --env-file=.env scripts/upscale-single.mjs ${hotelId}`, (error, stdout, stderr) => {
              if (error) {
                console.error(stderr);
                res.statusCode = 500;
                res.end(JSON.stringify({ error: stderr }));
              } else {
                res.end(JSON.stringify({ status: 'done' }));
              }
            });
          } catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
        });
      }
    });

    server.middlewares.use('/api/scrape-hotel', (req, res) => {
      if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
          try {
            const { url } = JSON.parse(body);
            exec(`node scripts/scrape-images.mjs "${url}"`, (error, stdout, stderr) => {
              res.setHeader('Content-Type', 'application/json');
              if (error) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: stderr || error.message }));
                return;
              }
              try {
                // The script should output a JSON object with { images: [...] }
                const result = JSON.parse(stdout);
                res.end(JSON.stringify(result));
              } catch (e) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: 'Failed to parse scraper output', raw: stdout }));
              }
            });
          } catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
        });
      }
    });
  }
});

export default defineConfig(() => {
  return {
    base: "./",
    plugins: [react(), tailwindcss(), upscalePlugin()],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined;
            if (id.includes('motion')) return 'motion';
            if (id.includes('lucide-react')) return 'icons';
            if (id.includes('@supabase/supabase-js')) return 'supabase';
            if (
              id.includes('react-day-picker') ||
              id.includes('date-fns') ||
              id.includes('vaul') ||
              id.includes('radix-ui')
            ) {
              return 'ui-vendor';
            }
            return 'vendor';
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
