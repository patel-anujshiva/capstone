/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero. Base block: hero.
 * Source: https://wknd.site/ca/en/adventures.html
 * Selector: .cmp-teaser (AEM Core Component teaser used as a page hero)
 * Generated: 2026-09-24
 *
 * Source structure (from source.html):
 *   .cmp-teaser
 *     > .cmp-teaser__content > h2.cmp-teaser__title + .cmp-teaser__description > p
 *     > .cmp-teaser__image  > .cmp-image > img.cmp-image__image
 *   (an optional CTA .cmp-teaser__action-link may appear on other pages)
 *
 * Output (EDS hero library convention — 1 column, 3 rows):
 *   Row 1: block name (added by createBlock).
 *   Row 2: single cell — background image (optional).
 *   Row 3: single cell — title (heading) + subheading text + optional CTA.
 *   1-column block: each content row holds a single cell.
 */
export default function parse(element, { document }) {
  // Background image (row 2).
  const image = element.querySelector(
    '.cmp-teaser__image img, .cmp-image img, img.cmp-image__image, img',
  );

  // Title (row 3, heading).
  const heading = element.querySelector(
    '.cmp-teaser__title, h1, h2, [class*="teaser__title"]',
  );

  // Subheading / description (row 3, rich text — may contain one or more <p>).
  const description = element.querySelector(
    '.cmp-teaser__description, [class*="teaser__description"]',
  );

  // Optional CTA link(s) — present on some teaser variants, absent here.
  const ctaLinks = Array.from(
    element.querySelectorAll('.cmp-teaser__action-link, .cmp-teaser__action-container a'),
  );

  // Empty-block guard: nothing meaningful to render.
  if (!image && !heading && !description) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 2: background image cell (optional — only if present).
  if (image) {
    cells.push([image]);
  }

  // Row 3: content cell — title + subheading + optional CTA.
  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (description) contentCell.push(description);
  contentCell.push(...ctaLinks);
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero', cells });
  element.replaceWith(block);
}
