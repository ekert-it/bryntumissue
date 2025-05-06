import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url';
import { TAESY_URL_BASE } from './src/taesybase.js'
import { PrimeVueResolver } from '@primevue/auto-import-resolver';
import Components from 'unplugin-vue-components/vite';

export default defineConfig({
  optimizeDeps: {
    noDiscovery: true,
    include: [
      'quill',
      '@bryntum/grid',
    ]
  },
  plugins: [vue(),
    Components({
      resolvers: [PrimeVueResolver()]
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  base: TAESY_URL_BASE,
  server: {
    host: 'localhost',
  },

})
