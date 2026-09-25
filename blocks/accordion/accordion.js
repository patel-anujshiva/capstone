/*
 * Accordion Block
 * Recreate an accordion
 * https://www.hlx.live/developer/block-collection/accordion
 *
 * Content contract (collection): one row per item —
 *   cell 1 = the question/label, cell 2 = the answer/body.
 */

export default function decorate(block) {
  [...block.children].forEach((row) => {
    // decorate accordion item label
    const label = row.children[0];
    const summary = document.createElement('summary');
    summary.className = 'accordion-item-label';
    if (label) summary.append(...label.childNodes);
    // decorate accordion item body
    const body = row.children[1];
    if (body) body.className = 'accordion-item-body';
    // decorate accordion item
    const details = document.createElement('details');
    details.className = 'accordion-item';
    details.append(summary);
    if (body) details.append(body);
    row.replaceWith(details);
  });
}
