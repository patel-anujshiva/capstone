/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-profile. Base block: cards.
 * Sources:
 *   - WKND About Us — `.cmp-experience-fragment--contributor` experience fragments
 *     (avatar `.cmp-image img`, name `h3.cmp-title__text`, role `h5.cmp-title__text`).
 *   - WKND magazine articles — author byline fragment `.cmp-experiencefragment--{author}`
 *     (avatar `.cmp-byline__image img`, name `h2.cmp-byline__name`,
 *     role `p.cmp-byline__occupations`).
 * Generated: 2026-09-24. Updated: 2026-09-25 (byline name/role support).
 *
 * Each instance selector match is one profile, so this parser runs once per
 * profile and emits a single-card cards-profile block: block-name row + one
 * row = [image cell, content cell].
 * Content cell: name heading (source level kept: h3 on About Us, h2 in bylines),
 * role (h5 on About Us, p in bylines), then each social link in its own <p>.
 * Library convention (cards): 2 columns, image cell + text content cell.
 */
export default function parse(element, { document }) {
  // Column 1: avatar image.
  const image = element.querySelector('.cmp-image img, img.cmp-image__image, img');

  // Column 2: name + role.
  // Name: primary title heading (About Us h3.cmp-title__text) or byline name (h2).
  const name = element.querySelector(
    'h1.cmp-title__text, h2.cmp-title__text, h3.cmp-title__text, h4.cmp-title__text, .cmp-byline__name',
  ) || element.querySelector('h2, h3');

  // Role: h5 title (About Us) or byline occupations paragraph (articles).
  let role = element.querySelector('h5.cmp-title__text, h6.cmp-title__text, .cmp-byline__occupations');
  if (!role) {
    // Fallback: any other title heading after the name, then any h5.
    role = Array.from(element.querySelectorAll('.cmp-title__text, h5'))
      .find((el) => el !== name) || null;
  }

  // Social links (facebook / twitter / instagram) — icon-only buttons.
  const socialLinks = Array.from(element.querySelectorAll('a.cmp-button, .cmp-buildingblock--btn-list a, a[href]'))
    .filter((el, i, arr) => arr.indexOf(el) === i);

  // Empty-block guard: nothing meaningful to emit.
  if (!image && !name && !role && socialLinks.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Wrap each social link in its own <p>. Several profiles share an equal or
  // empty href across their three social anchors; if these are placed as
  // adjacent inline siblings in the cell, html2md's preProcess merges them into
  // a single anchor (3 links collapse to 1). Block-level <p> separation keeps
  // each link distinct regardless of href value.
  const socialParagraphs = socialLinks.map((link) => {
    const p = document.createElement('p');
    p.append(link);
    return p;
  });

  const contentCell = [];
  if (name) contentCell.push(name);
  if (role && role !== name) contentCell.push(role);
  contentCell.push(...socialParagraphs);

  const cells = [];
  // 2-column card row: image cell + content cell. Pad image cell if absent
  // so the row keeps a consistent column count.
  cells.push([image || '', contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-profile', cells });
  element.replaceWith(block);
}
