/*
  Sprint 2H Letters click-to-copy email. Mirrors the golden master's
  `onClick={{ copyEmail }}` span on the Letters email address (reference/
  newsstand-original/source/Newsstand - Full Site.dc.html, the `isLetters`
  sc-if block, ~line 589) and its `copied`-gated confirmation line
  (~line 594).

  Production upgrades that fragile div-onClick to a real, keyboard-operable
  `<a href="mailto:...">` (src/pages/letters/index.astro) with a
  `data-copy-email` attribute carrying the real address to copy. This
  module progressively enhances that anchor: if the Clipboard API is
  available, the click is intercepted (preventDefault, no mailto
  navigation), the address is copied, and the golden master's own
  "copied!" line is shown plus announced via its aria-live region. If the
  Clipboard API is unavailable, or the copy attempt itself rejects, the
  click is left alone and the mailto: fallback navigates normally — no
  confirmation is ever shown for a copy that didn't actually happen.

  The confirmation message's `dv-scrawl` entrance animation
  (`.letters-copied` in src/styles/letters.css) needs no reduced-motion
  handling here: like every other handwriting-style entrance in this
  codebase (e.g. Cover's handnote scrawl), it is driven by the
  `--duration-scrawl-fade` token, which the global reduced-motion media
  query in src/styles/global.css already collapses to 0.01ms — this module
  only ever toggles the `hidden` attribute, never touches the animation
  itself.
*/
import type { InteractionModule } from './interaction-controller';

const PATHNAME = '/letters/';
const LINK_SELECTOR = '[data-copy-email]';
const CONFIRMATION_SELECTOR = '[data-copy-confirmation]';
const AUTO_HIDE_MS = 3500;

export const clipboardCopy: InteractionModule = {
  name: 'clipboard-copy',
  init(context) {
    if (context.pathname !== PATHNAME) return;

    const link = document.querySelector<HTMLAnchorElement>(LINK_SELECTOR);
    const confirmation = document.querySelector<HTMLElement>(
      CONFIRMATION_SELECTOR,
    );
    if (!link || !confirmation) return;

    const email = link.getAttribute('data-copy-email');
    if (!email) return;

    let hideTimer: ReturnType<typeof setTimeout> | undefined;

    const clearHideTimer = () => {
      if (hideTimer !== undefined) {
        clearTimeout(hideTimer);
        hideTimer = undefined;
      }
    };

    const showConfirmation = () => {
      clearHideTimer();
      confirmation.hidden = false;
      confirmation.textContent = `copied! now tell me the actual problem →`;
      hideTimer = setTimeout(() => {
        confirmation.hidden = true;
      }, AUTO_HIDE_MS);
    };

    const onClick = (event: MouseEvent) => {
      const clipboard = navigator.clipboard;
      if (!clipboard?.writeText) {
        // No Clipboard API support: let the mailto: fallback navigate.
        return;
      }

      event.preventDefault();
      clipboard.writeText(email).then(
        () => showConfirmation(),
        () => {
          // Copy failed (permissions, insecure context, etc.) — do not
          // show a false confirmation. The click was already intercepted,
          // so fall back to opening the mail client directly.
          window.location.href = link.href;
        },
      );
    };

    link.addEventListener('click', onClick, { signal: context.signal });

    return () => {
      clearHideTimer();
      confirmation.hidden = true;
    };
  },
};
