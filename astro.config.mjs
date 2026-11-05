// @ts-check
import { defineConfig } from 'astro/config';

// GitHub Pages first (SITE_URL set by the workflow), then ai-sf.it/preplancks.
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://ai-sf.it',
  base: '/preplancks',
});
