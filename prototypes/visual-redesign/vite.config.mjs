import { fileURLToPath } from 'node:url';
import path from 'node:path';
import react from '../../apps/web/node_modules/@vitejs/plugin-react/dist/index.js';

const root = path.dirname(fileURLToPath(import.meta.url));
const project = path.resolve(root, '../..');
const modules = path.join(project, 'apps/web/node_modules');

export default {
  root,
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.join(root, 'src'),
      react: path.join(modules, 'react'),
      'react-dom': path.join(modules, 'react-dom'),
      three: path.join(modules, 'three'),
    },
  },
  server: { host: '127.0.0.1', port: 5174, strictPort: true, fs: { allow: [project] } },
  preview: { host: '127.0.0.1', port: 5175, strictPort: true },
  build: { outDir: 'dist', emptyOutDir: true },
};
