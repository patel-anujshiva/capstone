/*
 * Hero (minimal-dark-withimg) — forked hero variant.
 * A section heading followed by a row of image teasers (image + title + text).
 * Forked variant: scoped entirely to .hero-minimal-dark-withimg.
 *
 * Content contract:
 *   - first row (single cell): the section heading
 *   - each following row: one teaser — image cell + content cell(s)
 */

import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const rows = [...block.children];

  const wrapper = document.createElement('div');
  wrapper.className = 'hero-minimal-dark-withimg-inner';

  // First row that has no image is treated as the heading.
  let headingRow = null;
  const teaserRows = [];
  rows.forEach((row) => {
    if (!headingRow && !row.querySelector('img')) {
      headingRow = row;
    } else {
      teaserRows.push(row);
    }
  });

  if (headingRow) {
    const head = document.createElement('div');
    head.className = 'hero-minimal-dark-withimg-heading';
    head.append(...headingRow.childNodes);
    wrapper.append(head);
  }

  if (teaserRows.length) {
    const grid = document.createElement('div');
    grid.className = 'hero-minimal-dark-withimg-grid';
    teaserRows.forEach((row) => {
      const item = document.createElement('article');
      item.className = 'hero-minimal-dark-withimg-item';
      [...row.children].forEach((cell) => {
        const img = cell.querySelector('img');
        if (img) {
          const media = document.createElement('div');
          media.className = 'hero-minimal-dark-withimg-image';
          media.append(cell.querySelector('picture') || createOptimizedPicture(img.src, img.alt, false));
          item.append(media);
        } else {
          cell.className = 'hero-minimal-dark-withimg-content';
          item.append(cell);
        }
      });
      grid.append(item);
    });
    wrapper.append(grid);
  }

  block.replaceChildren(wrapper);
}
