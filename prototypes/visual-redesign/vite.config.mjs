import { fileURLToPath } from 'node:url';
import path from 'node:path';
import react from '../../apps/web/node_modules/@vitejs/plugin-react/dist/index.js';
import tailwindcss from '../../apps/web/node_modules/@tailwindcss/vite/dist/index.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const project = path.resolve(root, '../..');
const modules = path.join(project, 'apps/web/node_modules');

export default {
  root,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      react: path.join(modules, 'react'),
      'react-dom': path.join(modules, 'react-dom'),
      three: path.join(modules, 'three'),
      '@fontsource-variable/archivo': path.join(modules, '@fontsource-variable/archivo'),
      '@fontsource/ibm-plex-sans-arabic': path.join(modules, '@fontsource/ibm-plex-sans-arabic'),
      tailwindcss: path.join(modules, 'tailwindcss/index.css'),
    },
  },
  server: { host: '127.0.0.1', port: 5174, strictPort: true, fs: { allow: [project] } },
  preview: { host: '127.0.0.1', port: 5175, strictPort: true },
  build: { outDir: 'dist', emptyOutDir: true },
};
