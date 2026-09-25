/* eslint-disable */
/* global WebImporter */
/**
 * Parser for quote. Base: quote.
 * Source: https://wknd.site/ca/en/magazine/arctic-surfing.html
 * Selector: .text blockquote, blockquote
 * Generated: 2026-09-24
 *
 * Source structure (from source.html): a plain inline pull-quote — a single
 * <blockquote> inside the article's .text body. This instance has no citation
 * and no image.
 *
 * Output (standalone quote block): a cell with the quotation text, plus optional
 * citation and image cells. For this plain inline pull-quote only the quote cell
 * is emitted. Handles variations: if a <cite>/<footer> attribution or an image is
 * present in other instances, add those cells too.
 */
export default function parse(element, { document }) {
  // The matched element is the <blockquote> itself (or contains one).
  const blockquote = element.matches('blockquote')
    ? element
    : element.querySelector('blockquote');

  const quoteText = (blockquote || element).textContent.replace(/\s+/g, ' ').trim();

  // Empty-block guard: bail gracefully if there is no quotation text.
  if (!quoteText) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Quote text cell (required).
  const quoteP = document.createElement('p');
  quoteP.textContent = quoteText;
  const quoteCell = [quoteP];

  // Optional citation (cite/footer) — kept out of the quote text if present.
  const cite = (blockquote || element).querySelector('cite, footer');
  const citeText = cite ? cite.textContent.replace(/\s+/g, ' ').trim() : '';

  // Optional image (some quote instances lead with an image).
  const img = element.querySelector('img');

  if (img) {
    // Image-led variant: image cell above the quote.
    cells.push([img]);
  }
  cells.push([quoteCell]);
  if (citeText) {
    const citeP = document.createElement('p');
    citeP.textContent = citeText;
    cells.push([[citeP]]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'quote', cells });
  element.replaceWith(block);
}
