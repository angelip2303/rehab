// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://angelip2303.github.io',
  base: '/rehab',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
