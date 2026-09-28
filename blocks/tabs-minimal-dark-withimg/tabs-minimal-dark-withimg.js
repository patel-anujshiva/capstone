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
 *   - or query mode: settings rows (Folder / Template / Sort / Filters …, see
 *     scripts/query-index.js) — cards are built from the query index and each
 *     card's categories come from the Filters that match its tags.
 */

import { createOptimizedPicture, toClassName } from '../../scripts/aem.js';
import {
  readQueryConfig, queryPages, pagePicture, pageHeading, toList,
} from '../../scripts/query-index.js';

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

/**
 * Parses the Filters setting: one filter per line, "Label" (matches the tag of the same name)
 * or "Label = tag, tag" (matches any of the listed tags).
 * @param {string} value
 * @returns {{label: string, tags: string[]}[]}
 */
function parseFilters(value) {
  return (value || '').split('\n').map((line) => line.trim()).filter(Boolean).map((line) => {
    const [label, tags] = line.split('=').map((part) => part.trim());
    return { label, tags: (tags ? toList(tags) : [label]).map((t) => toClassName(t)) };
  });
}

/**
 * Query mode: builds one card row per matching index page; the eyebrow lists the filters
 * whose tags the page carries, so the filter strip is built from the index tags.
 * @param {Element} block
 * @param {Object} config
 */
async function buildQueryRows(block, config) {
  const filters = parseFilters(config.filters);
  const pages = await queryPages(config);
  const rows = pages.map((page) => {
    const row = document.createElement('div');
    const image = document.createElement('div');
    const picture = pagePicture(page);
    if (picture) image.append(picture);
    const content = document.createElement('div');
    const pageTags = toList(page.tags).map((t) => toClassName(t));
    const labels = filters
      .filter((f) => f.tags.some((t) => pageTags.includes(t)))
      .map((f) => f.label);
    if (labels.length) {
      const eyebrow = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = labels.join(', ');
      eyebrow.append(strong);
      content.append(eyebrow);
    }
    content.append(pageHeading(page, 'h3'));
    if (page.description) {
      const p = document.createElement('p');
      p.textContent = page.description;
      content.append(p);
    }
    row.append(image, content);
    return row;
  });
  block.replaceChildren(...rows);
}

export default async function decorate(block) {
  const config = readQueryConfig(block, ['filters']);
  if (config) await buildQueryRows(block, config);

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
