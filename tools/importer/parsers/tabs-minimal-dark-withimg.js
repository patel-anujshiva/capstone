/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-minimal-dark-withimg. Base block: tabs (FORKED variant).
 * Source: https://wknd.site/ca/en/adventures.html
 * Selector: .cmp-tabs (AEM Core Component tabs used as a filterable card grid)
 * Generated: 2026-09-24
 *
 * NOTE ON CONVENTION: The generic "tabs" library convention is 2 columns of
 * (tab label + tab content) per row. This variant is a *genuinely custom fork*
 * — see blocks/tabs-minimal-dark-withimg/tabs-minimal-dark-withimg.js, whose
 * decorate() expects ONE ROW PER CARD (image cell + content cell) and builds
 * the filter-tab strip itself from each card's category. The parser therefore
 * follows the actual forked block's content contract, not the generic tabs one.
 *
 * Source structure (from source.html / cleaned.html):
 *   .cmp-tabs
 *     > ol.cmp-tabs__tablist > li.cmp-tabs__tab  (All, Climbing, Cycling, Skiing, Surfing, Travel)
 *     > div.cmp-tabs__tabpanel (one per tab; the first is --active = "All")
 *         > .image-list > ul.cmp-image-list
 *             > li.cmp-image-list__item
 *                 > article.cmp-image-list__item-content
 *                     a.cmp-image-list__item-image-link > .cmp-image-list__item-image img
 *                     a.cmp-image-list__item-title-link  > span.cmp-image-list__item-title
 *                     span.cmp-image-list__item-description
 *
 *   The "All" panel contains every unique card (16 on this page); the other
 *   panels are category subsets that DUPLICATE cards already in "All". So we
 *   parse cards from the ALL panel only, to avoid duplicate rows.
 *
 *   Iteration key: article.cmp-image-list__item-content — a block-level element
 *   (not an <a>/<button>), so it is NOT subject to the nested-inline / html2md
 *   merge traps; item count is stable. The inner image/title links are distinct
 *   anchors with distinct hrefs and are never iterated directly.
 *
 * Category derivation: for each card we scan every NON-"All" tab panel; if the
 * card's detail href appears in that panel, the panel's tab label is one of that
 * card's categories (comma-separated when it sits in several panels). Emitted as a
 * leading <strong> eyebrow in the content cell so the block's readCategories()
 * (reads first <strong>/<em>) can build the filter tabs.
 *
 * Output (blocks/tabs-minimal-dark-withimg convention — collection):
 *   block-name row, then ONE row per unique card. Each card row = image cell +
 *   content cell (optional category eyebrow + heading link + description).
 */
export default function parse(element, { document }) {
  // Tab labels in DOM order (index-aligned with the tab panels).
  const tabLabels = Array.from(
    element.querySelectorAll(':scope > .cmp-tabs__tablist > li.cmp-tabs__tab, .cmp-tabs__tablist .cmp-tabs__tab'),
  ).map((li) => li.textContent.trim());

  // Tab panels in DOM order.
  const panels = Array.from(
    element.querySelectorAll(':scope > .cmp-tabs__tabpanel, .cmp-tabs__tabpanel'),
  );

  // The ALL panel holds every unique card: prefer the active panel, else the
  // panel whose label is "All", else the first panel with cards.
  const cardSelector = 'article.cmp-image-list__item-content, .cmp-image-list__item-content';
  let allPanel = element.querySelector(':scope > .cmp-tabs__tabpanel--active, .cmp-tabs__tabpanel--active');
  if (!allPanel || !allPanel.querySelector(cardSelector)) {
    const allIdx = tabLabels.findIndex((l) => /^all$/i.test(l));
    if (allIdx >= 0 && panels[allIdx] && panels[allIdx].querySelector(cardSelector)) {
      allPanel = panels[allIdx];
    }
  }
  if (!allPanel || !allPanel.querySelector(cardSelector)) {
    allPanel = panels.find((p) => p.querySelector(cardSelector)) || element;
  }

  // Build a href -> categories map from the non-"All" category panels. A card can sit in
  // several category panels (e.g. Cycling + Travel), so every matching label is kept.
  const categoryByHref = new Map();
  panels.forEach((panel, i) => {
    const label = tabLabels[i] || '';
    if (!label || /^all$/i.test(label)) return;
    panel.querySelectorAll(cardSelector).forEach((card) => {
      const link = card.querySelector('a.cmp-image-list__item-title-link, a.cmp-image-list__item-image-link, a[href]');
      const href = link && link.getAttribute('href');
      if (!href) return;
      const labels = categoryByHref.get(href) || [];
      if (!labels.includes(label)) labels.push(label);
      categoryByHref.set(href, labels);
    });
  });

  // One row per unique card in the ALL panel.
  const cards = Array.from(allPanel.querySelectorAll(cardSelector));

  // Empty-block guard.
  if (!cards.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  cards.forEach((card) => {
    // Image cell.
    const image = card.querySelector('.cmp-image-list__item-image img, .cmp-image img, img');

    // Title link (preserve the link + heading text).
    const titleLink = card.querySelector('a.cmp-image-list__item-title-link, a.cmp-image-list__item-image-link');
    const titleText = card.querySelector('.cmp-image-list__item-title');
    const description = card.querySelector('.cmp-image-list__item-description');

    const contentCell = [];

    // Optional category eyebrow (first <strong> is read by the block; comma-separated
    // when the card belongs to several categories).
    const href = titleLink && titleLink.getAttribute('href');
    const categories = (href && categoryByHref.get(href)) || [];
    if (categories.length) {
      const eyebrow = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = categories.join(', ');
      eyebrow.append(strong);
      contentCell.push(eyebrow);
    }

    // Heading as a linked H3 (preserves both link and heading semantics).
    if (titleText || titleLink) {
      const h = document.createElement('h3');
      if (href) {
        const a = document.createElement('a');
        a.setAttribute('href', href);
        a.textContent = (titleText || titleLink).textContent.trim();
        h.append(a);
      } else {
        h.textContent = (titleText || titleLink).textContent.trim();
      }
      contentCell.push(h);
    }

    // Description text.
    if (description) {
      const p = document.createElement('p');
      p.textContent = description.textContent.trim();
      contentCell.push(p);
    }

    // Image cell + content cell (2 columns, consistent for every row).
    cells.push([image || '', contentCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'tabs-minimal-dark-withimg',
    cells,
  });
  element.replaceWith(block);
}
