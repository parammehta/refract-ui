import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [
    react(),
    svgr({ svgrOptions: { svgo: false }, include: '**/*.svg' }),
    dts({ tsconfigPath: './tsconfig.build.json', rollupTypes: false }),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        model: resolve(__dirname, 'src/entries/model.ts'),
        carousel: resolve(__dirname, 'src/entries/carousel.ts'),
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'js' : 'cjs'}`,
    },
    cssCodeSplit: false,
    sourcemap: true,
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'framer-motion',
        'three',
        'three-stdlib',
      ],
      output: {
        assetFileNames: 'styles.css',
        preserveModules: false,
        banner: "'use client';",
      },
    },
  },
});
