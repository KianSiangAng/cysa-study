/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/cysa-study/',
  plugins: [react(), tailwindcss()],
  test: {
    include: ['src/**/*.test.ts', 'scripts/**/*.test.ts'],
  },
})
