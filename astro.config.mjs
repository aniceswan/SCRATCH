import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import remarkBreaks from 'remark-breaks';

// Setelah punya domain, isi `site` supaya canonical & OG url benar.
// site: 'https://scratch.pages.dev',

export default defineConfig({
  markdown: {
    // Setiap baris baru di file .md jadi <br>, persis seperti menulis puisi.
    processor: unified({
      remarkPlugins: [remarkBreaks],
    }),
  },
  prefetch: true,
});
