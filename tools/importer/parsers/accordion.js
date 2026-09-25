/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion. Base block: accordion.
 * Source: https://wknd.site/ca/en/faqs.html
 * Selector: .cmp-accordion (AEM Core Component accordion)
 * Generated: 2026-09-24
 *
 * Source structure (from source.html / cleaned.html):
 *   .cmp-accordion > .cmp-accordion__item (one per FAQ; 7 on this page). Each item:
 *     h3.cmp-accordion__header > button.cmp-accordion__button >
 *       span.cmp-accordion__title  (the question/label)
 *     div.cmp-accordion__panel > .container > .cmp-container > .text > .cmp-text
 *       (the answer body, one or more <p>/<h*>).
 *   Repeating unit .cmp-accordion__item is a <div> (not interactive) and the
 *   question <button> is not nested inside an <a>/<button> — iterationSafe, no
 *   inline-wrapper collapse risk.
 *
 * Output (blocks/accordion convention, model `collection`): 2 columns —
 * block-name row, then one row per FAQ item: cell 1 = question/label,
 * cell 2 = answer/body content. Grid scaffolding is dropped in favour of the
 * inner .cmp-text bodies, falling back to the whole panel.
 */
export default function parse(element, { document }) {
  // One row per accordion item.
  let items = Array.from(
    element.querySelectorAll(':scope > .cmp-accordion__item'),
  );
  // Fallback for markup variations across pages (deeper nesting).
  if (!items.length) {
    items = Array.from(element.querySelectorAll('.cmp-accordion__item'));
  }

  // Empty-block guard: nothing to build.
  if (!items.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  items.forEach((item) => {
    // Cell 1: the question/label. Use the title span text; fall back to the
    // header/button text so a variant without the title span still resolves.
    const titleEl = item.querySelector(
      '.cmp-accordion__title, .cmp-accordion__header, .cmp-accordion__button',
    );
    const label = document.createElement('p');
    label.textContent = titleEl
      ? titleEl.textContent.replace(/\s+/g, ' ').trim()
      : '';

    // Cell 2: the answer/body. Prefer the inner .cmp-text bodies so container
    // grid scaffolding is dropped; fall back to the panel content.
    const panel = item.querySelector('.cmp-accordion__panel');
    let bodyNodes = [];
    if (panel) {
      const texts = Array.from(panel.querySelectorAll('.cmp-text'));
      if (texts.length) {
        texts.forEach((t) => bodyNodes.push(...Array.from(t.childNodes)));
      } else {
        bodyNodes = Array.from(panel.childNodes);
      }
    }

    // Row: [question cell, answer cell]. Pad the answer cell so every row keeps
    // 2 columns even when a panel is empty.
    cells.push([label, bodyNodes.length ? bodyNodes : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion', cells });
  element.replaceWith(block);
}
