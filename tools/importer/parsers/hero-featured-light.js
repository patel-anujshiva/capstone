/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-featured-light. Base block: hero (forked variant).
 * Source: WKND homepage — `.cmp-teaser--featured` featured-article teaser.
 * Generated: 2026-09-24
 *
 * NOTE: This is a genuinely custom forked variant, NOT the base hero block.
 * The generic "hero" library convention (1 column / 3 rows) does NOT apply.
 * blocks/hero-featured-light/hero-featured-light.js decorates by iterating each
 * cell of a single row and routing the cell that holds an <img> to the image
 * slot and the other cell to the content slot. The content contract is:
 *   ONE row with TWO cells: [ content cell | image cell ].
 * Content cell = eyebrow (first paragraph) + title + description + CTA.
 */
export default function parse(element, { document }) {
  // The teaser's content region. In the live DOM the title h2 can sit as a
  // sibling of .cmp-teaser__content rather than inside it, so title (and every
  // other piece) is queried from the whole element using its specific
  // .cmp-teaser__* class, with a content-scoped fallback for variation.
  const content = element.querySelector('.cmp-teaser__content') || element;
  const imageWrap = element.querySelector('.cmp-teaser__image') || element;

  // Content cell pieces (eyebrow first, per block contract).
  const eyebrow = element.querySelector('.cmp-teaser__pretitle, [class*="pretitle"]');
  const title = element.querySelector('.cmp-teaser__title')
    || content.querySelector('h1, h2, h3, [class*="title"]');
  const description = element.querySelector('.cmp-teaser__description, [class*="description"]');
  const cta = element.querySelector('.cmp-teaser__action-link, .cmp-teaser__action-container a')
    || content.querySelector('a[href]');

  // Image cell.
  const image = imageWrap.querySelector('picture, img.cmp-image__image, img')
    || element.querySelector('.cmp-teaser__image img, picture, img');

  // Empty-block guard.
  if (!title && !description && !image) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const contentCell = [];
  if (eyebrow) contentCell.push(eyebrow);
  if (title) contentCell.push(title);
  if (description) contentCell.push(description);
  if (cta) contentCell.push(cta);

  const cells = [];
  // One row, two cells: content | image. Pad a missing cell to keep 2 columns.
  cells.push([contentCell.length ? contentCell : '', image || '']);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-featured-light', cells });
  element.replaceWith(block);
}
