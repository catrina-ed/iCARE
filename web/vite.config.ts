import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  // Served from https://catrina-ed.github.io/iCARE/, so assets need the repo
  // name as their base path. Vite's dev server ignores this.
  base: '/iCARE/',
  plugins: [react()],
  resolve: {
    alias: {
      shared: path.resolve(__dirname, '../shared'),
    },
  },
})
