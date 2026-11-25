import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendTarget = env.VITE_BACKEND_URL || env.VITE_API_BASE_URL || 'http://localhost:8080';

  const allowedHosts = ['.run.app', '.vercel.app', 'localhost', '127.0.0.1'];

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 3000,
      host: '0.0.0.0',
      allowedHosts,
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    preview: {
      port: 3000,
      host: '0.0.0.0',
      allowedHosts,
    },
  };
});
