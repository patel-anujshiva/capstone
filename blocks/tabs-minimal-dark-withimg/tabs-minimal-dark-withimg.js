/*
 * Tabs (minimal-dark-withimg) — forked tabs variant.
 * A filter-tab strip above a card grid of items; selecting a tab filters
 * the grid by the item's category. Each item = image + heading + text,
 * with an optional category token.
 *
 * Content contract (collection):
 *   - optional first row: the list of filter labels (one cell each, or a
 *     single cell of comma/line-separated labels). If absent, filters are
 *     derived from item categories.
 *   - subsequent rows: one card each — image cell, then content cell(s).
 *     A card's category is read from a `data-category` on the row or the
 *     first bold/eyebrow token in its content.
 */

import { createOptimizedPicture, toClassName } from '../../scripts/aem.js';

/**
 * Reads a card's categories: `data-category` or the first bold/eyebrow token, which may
 * list several comma-separated categories (a card can appear under more than one filter).
 * @param {Element} card
 * @returns {string[]}
 */
function readCategories(card) {
  const raw = card.dataset.category
    || card.querySelector('strong, em')?.textContent
    || '';
  return raw.split(',').map((c) => toClassName(c)).filter(Boolean);
}

export default function decorate(block) {
  const rows = [...block.children];

  // Build card grid.
  const grid = document.createElement('div');
  grid.className = 'tabs-minimal-dark-withimg-grid';

  const categories = new Set();
  rows.forEach((row) => {
    const card = document.createElement('article');
    card.className = 'tabs-minimal-dark-withimg-item';

    [...row.children].forEach((cell) => {
      const img = cell.querySelector('img');
      if (img) {
        const media = document.createElement('div');
        media.className = 'tabs-minimal-dark-withimg-image';
        const pic = cell.querySelector('picture')
          || createOptimizedPicture(img.src, img.alt, false);
        media.append(pic);
        card.append(media);
      } else {
        cell.className = 'tabs-minimal-dark-withimg-content';
        card.append(cell);
      }
    });

    const cats = readCategories(card);
    if (cats.length) {
      card.dataset.category = cats.join(' ');
      cats.forEach((cat) => categories.add(cat));
    }
    grid.append(card);
    row.remove();
  });

  // Build filter tabs (All + discovered categories).
  const tablist = document.createElement('div');
  tablist.className = 'tabs-minimal-dark-withimg-list';
  tablist.setAttribute('role', 'tablist');

  const filters = ['all', ...[...categories].sort((a, b) => a.localeCompare(b))];
  filters.forEach((cat, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tabs-minimal-dark-withimg-tab';
    button.textContent = cat === 'all' ? 'All' : cat;
    button.dataset.filter = cat;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-selected', i === 0);
    button.addEventListener('click', () => {
      tablist.querySelectorAll('button').forEach((b) => b.setAttribute('aria-selected', false));
      button.setAttribute('aria-selected', true);
      grid.querySelectorAll('.tabs-minimal-dark-withimg-item').forEach((item) => {
        const show = cat === 'all' || (item.dataset.category || '').split(' ').includes(cat);
        item.hidden = !show;
      });
    });
    tablist.append(button);
  });

  block.replaceChildren(tablist, grid);
}
