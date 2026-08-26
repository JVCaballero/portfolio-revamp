import mdx from '@astrojs/mdx';
import { defineConfig, fontProviders } from 'astro/config';

export default defineConfig({
  integrations: [mdx()],
  output: 'static',
  trailingSlash: 'always',
  // Golden-master font vocabulary (reference/newsstand-original). Weights/styles
  // are restricted to what the design actually uses, not the wider Google Fonts
  // request the original export declared.
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Archivo Black',
      cssVariable: '--font-archivo-black',
      weights: [400],
      styles: ['normal'],
      fallbacks: ['sans-serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'Barlow Condensed',
      cssVariable: '--font-barlow-condensed',
      // The golden master only ever renders this family at weight 600.
      weights: [600],
      styles: ['normal'],
      fallbacks: ['sans-serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'Source Serif 4',
      cssVariable: '--font-source-serif-4',
      weights: [400],
      styles: ['normal', 'italic'],
      fallbacks: ['serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'Space Mono',
      cssVariable: '--font-space-mono',
      // Golden master requests weight 600 in one folio label, but the source's
      // own Google Fonts request only ever provides 400/700 for this family.
      // Preserving that available-face behavior rather than manufacturing a
      // real 600 weight that never existed in the original.
      weights: [400, 700],
      styles: ['normal'],
      fallbacks: ['monospace'],
    },
    {
      provider: fontProviders.google(),
      name: 'Architects Daughter',
      cssVariable: '--font-architects-daughter',
      weights: [400],
      styles: ['normal'],
      fallbacks: ['cursive'],
    },
  ],
});
