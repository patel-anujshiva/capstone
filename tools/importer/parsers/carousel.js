/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel. Base block: carousel.
 * Sources:
 *   - https://wknd.site/ca/en/adventures/bali-surf-camp.html (image-only slide)
 *   - https://wknd.site/ca/en.html (hero teaser slides: image + title/description/CTA)
 * Selector: .cmp-carousel (AEM Core Component carousel)
 * Generated: 2026-09-24. Updated: 2026-09-25 (teaser slide content).
 *
 * Source structure:
 *   .cmp-carousel > .cmp-carousel__content > .cmp-carousel__item (one per slide).
 *   Item holds either an image (.image .cmp-image img) or a teaser
 *   (.cmp-teaser: .cmp-teaser__image img + .cmp-teaser__content with
 *   h2.cmp-teaser__title, .cmp-teaser__description (text or <p>s),
 *   a.cmp-teaser__action-link CTAs). Nav controls (.cmp-carousel__actions) and
 *   dots (.cmp-carousel__indicators) are ignored — blocks/carousel regenerates them.
 *   structure.json: .cmp-carousel__item is iterationSafe (no nested interactive elements).
 *
 * Output (blocks/carousel convention): one row per slide.
 *   cell 1 = slide image; cell 2 = slide content (h2 heading, p description,
 *   each CTA link in its own <p> so EDS decorates it as a button).
 *   Cell 2 is only emitted when the carousel has slide text; image-only
 *   carousels keep single-cell rows.
 */
export default function parse(element, { document }) {
  // One row per slide. Items are the direct children of the carousel content.
  let items = Array.from(
    element.querySelectorAll(':scope .cmp-carousel__content > .cmp-carousel__item'),
  );
  // Fallbacks for markup variations across pages.
  if (!items.length) {
    items = Array.from(element.querySelectorAll('.cmp-carousel__item'));
  }
  if (!items.length) {
    // Last resort: treat each direct image wrapper as a slide.
    items = Array.from(element.querySelectorAll(':scope .cmp-carousel__content > *'));
  }

  const text = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');

  const slides = [];
  items.forEach((item) => {
    const image = item.querySelector(
      '.cmp-teaser__image img, .cmp-image img, img.cmp-image__image, img',
    );

    const content = [];

    // Heading -> h2.
    const title = item.querySelector('.cmp-teaser__title, .cmp-title__text');
    if (title && text(title)) {
      const h2 = document.createElement('h2');
      h2.textContent = text(title);
      content.push(h2);
    }

    // Description -> p (keep existing <p> children when the rich text has them).
    const desc = item.querySelector('.cmp-teaser__description');
    if (desc && text(desc)) {
      const paras = Array.from(desc.querySelectorAll('p')).filter((p) => text(p));
      if (paras.length) {
        content.push(...paras);
      } else {
        const p = document.createElement('p');
        p.innerHTML = desc.innerHTML.trim();
        content.push(p);
      }
    }

    // CTA links -> each in its own <p> so EDS decorates them as buttons.
    const ctas = Array.from(item.querySelectorAll('a.cmp-teaser__action-link'));
    ctas.forEach((link) => {
      if (!text(link)) return;
      const a = document.createElement('a');
      a.href = link.getAttribute('href') || '';
      a.textContent = text(link);
      const p = document.createElement('p');
      p.append(a);
      content.push(p);
    });

    if (image || content.length) slides.push({ image, content });
  });

  // Empty-block guard: nothing to show if no slides were found.
  if (!slides.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Only use a second column when at least one slide has text content, so
  // image-only carousels keep exactly one cell per row.
  const hasContent = slides.some((s) => s.content.length);
  const cells = slides.map(({ image, content }) => (
    hasContent ? [image || '', content.length ? content : ''] : [image]
  ));

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel', cells });
  element.replaceWith(block);
}
