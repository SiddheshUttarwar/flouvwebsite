import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Honor a port assigned via the environment (e.g. by the preview launcher);
    // falls back to Vite's default when unset.
    port: process.env.PORT ? Number(process.env.PORT) : undefined,
    proxy: {
      '/api': 'http://localhost:8000',
      // Blog/CMS media is served by the API from backend/uploads in production.
      // Only /uploads/blog is proxied — the rest of /uploads holds page assets that
      // Vite itself serves from the project root during dev.
      '/uploads/blog': 'http://localhost:8000'
    }
  }
});
