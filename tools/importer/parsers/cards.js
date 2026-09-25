/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards. Base block: cards.
 * Source: WKND homepage — `.cmp-image-list` grids ("Recent Articles",
 * "Where do you want to go?"). Generated: 2026-09-24
 *
 * The import script matches each `.cmp-image-list` separately, so this parser
 * runs once per grid and receives ONE list element. It emits one row per card:
 *   [ image cell | body cell (title + description) ]  — per blocks/cards.
 *
 * Library convention (cards): 2 columns, multiple rows; row 1 = block name;
 * each subsequent row = one card [ image (cell 1) | text: title/description
 * (cell 2) ]. This parser matches that structure.
 *
 * Iteration key: `.cmp-image-list__item` (<li>). A <li> is not an interactive
 * element, so it is immune to the nested-anchor / inline-merge item-collapse
 * traps — the card count is stable across the live DOM and the html2md path.
 */
export default function parse(element, { document }) {
  const items = Array.from(element.querySelectorAll(':scope > .cmp-image-list__item, .cmp-image-list__item'))
    // de-dupe if fallback selectors overlap
    .filter((el, i, arr) => arr.indexOf(el) === i);

  const cells = [];

  items.forEach((item) => {
    // Image cell: prefer the article image (not the title-link).
    const image = item.querySelector('.cmp-image-list__item-image img, .cmp-image-list__item-image-link img, img');

    // Body cell: title (as a link, preserving href) + description.
    const titleLink = item.querySelector('.cmp-image-list__item-title-link');
    const titleText = item.querySelector('.cmp-image-list__item-title');
    const description = item.querySelector('.cmp-image-list__item-description, [class*="description"]');

    const bodyCell = [];

    // Build a heading that keeps the title's link, when present.
    if (titleLink || titleText) {
      const heading = document.createElement('h3');
      const label = (titleText ? titleText.textContent : titleLink.textContent).trim();
      const href = titleLink ? titleLink.getAttribute('href') : null;
      if (href) {
        const a = document.createElement('a');
        a.setAttribute('href', href);
        a.textContent = label;
        heading.append(a);
      } else {
        heading.textContent = label;
      }
      bodyCell.push(heading);
    }

    if (description) {
      const p = document.createElement('p');
      p.textContent = description.textContent.trim();
      bodyCell.push(p);
    }

    // Skip an empty card entirely.
    if (!image && bodyCell.length === 0) return;

    // 2-column row: image cell + body cell. Pad to keep column count consistent.
    cells.push([image || '', bodyCell.length ? bodyCell : '']);
  });

  // Empty-block guard: no cards extracted.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells });
  element.replaceWith(block);
}
