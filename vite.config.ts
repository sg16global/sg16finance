import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { devDashboardApi } from './vite-plugin-dev-api.js';

export default defineConfig({
  plugins: [react(), tailwindcss(), devDashboardApi()],
});
