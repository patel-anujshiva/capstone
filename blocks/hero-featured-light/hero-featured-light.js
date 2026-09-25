/*
 * Hero (featured-light) — forked hero variant for a featured-article teaser.
 * Light panel with a side-by-side layout: text column (eyebrow, title,
 * description, CTA) beside an image. Forked variant: scoped to
 * .hero-featured-light.
 *
 * Content contract:
 *   - one row, two cells: a content cell (eyebrow/title/text/CTA) and an
 *     image cell — in either order.
 */

import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const inner = document.createElement('div');
  inner.className = 'hero-featured-light-inner';

  [...block.children].forEach((row) => {
    [...row.children].forEach((cell) => {
      const img = cell.querySelector('img');
      if (img) {
        const media = document.createElement('div');
        media.className = 'hero-featured-light-image';
        media.append(cell.querySelector('picture') || createOptimizedPicture(img.src, img.alt, false));
        inner.append(media);
      } else if (cell.textContent.trim() || cell.querySelector('a')) {
        cell.className = 'hero-featured-light-content';
        inner.append(cell);
      }
    });
  });

  block.replaceChildren(inner);
}
