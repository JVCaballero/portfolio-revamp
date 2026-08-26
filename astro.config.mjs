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
      // Post-Sprint-2 fix: swapped from the golden master's own Space Mono
      // to Courier Prime at the project owner's explicit request, for a
      // more authentic vintage-typewriter look (referencing an actual
      // Royal Quiet Deluxe). This is a deliberate departure from the
      // golden master's own typography, not a fidelity bug — see
      // DESIGN_DEVIATIONS.md. Courier Prime offers real 400/700 weights
      // (no browser-synthesized faux-bold), matching every existing
      // font-weight:700 mono label sitewide without any other changes.
      name: 'Courier Prime',
      cssVariable: '--font-courier-prime',
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
