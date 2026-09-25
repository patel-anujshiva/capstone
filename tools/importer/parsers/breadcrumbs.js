/* eslint-disable */
/* global WebImporter */
/**
 * Parser for breadcrumbs. Base: breadcrumbs.
 * Source: https://wknd.site/ca/en/magazine/arctic-surfing.html
 * Selector: .cmp-breadcrumb
 * Generated: 2026-09-24
 *
 * Source structure (from source.html): a <nav class="cmp-breadcrumb"> containing
 * <ol class="cmp-breadcrumb__list"> with repeating <li class="cmp-breadcrumb__item">.
 * Each ancestor crumb wraps an <a class="cmp-breadcrumb__item-link"> (text in a <span>);
 * the final active crumb (.cmp-breadcrumb__item--active) is plain text (a <span>).
 *
 * Output (standalone breadcrumbs block): one content row whose cells are the crumbs,
 * in order — linked ancestor crumbs keep their <a>, the current page is plain text.
 * structure.json: repeating unit tag:li ×2, iterationSafe: true, no invalid nesting.
 */
export default function parse(element, { document }) {
  // Iterate the breadcrumb list items (the safe, stable repeating unit).
  const items = [...element.querySelectorAll('li.cmp-breadcrumb__item')];

  const crumbs = items
    .map((li) => {
      const link = li.querySelector('a.cmp-breadcrumb__item-link, a');
      const text = (link || li).textContent.replace(/\s+/g, ' ').trim();
      if (!text) return null;

      const isActive = li.classList.contains('cmp-breadcrumb__item--active');
      if (link && !isActive) {
        const a = document.createElement('a');
        a.href = link.getAttribute('href') || '#';
        a.textContent = text;
        return a;
      }
      const span = document.createElement('span');
      span.textContent = text;
      return span;
    })
    .filter(Boolean);

  // Empty-block guard: bail gracefully if no crumbs were found.
  if (!crumbs.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // One content row; each cell holds one crumb.
  const cells = [crumbs];

  const block = WebImporter.Blocks.createBlock(document, { name: 'breadcrumbs', cells });
  element.replaceWith(block);
}
