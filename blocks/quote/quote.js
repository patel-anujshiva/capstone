/*
 * Quote Block
 * Renders an authored pull-quote with optional citation and optional image.
 * Content contract (standalone):
 *   - a cell containing the quotation text (rendered as <blockquote>)
 *   - an optional cell with the attribution/citation
 *   - an optional image cell (shown above the quote for the withimg option)
 * Options: minimal-dark-withimg (image-led variant on a muted panel).
 */

import { createOptimizedPicture } from '../../scripts/aem.js';

const OPTION_CLASSES = ['minimal-dark-withimg'];

export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));

  let picture = null;
  let citation = '';
  const quoteParts = [];

  [...block.children].forEach((row) => {
    [...row.children].forEach((cell) => {
      const img = cell.querySelector('img');
      if (img) {
        picture = cell.querySelector('picture') || img;
        return;
      }
      const text = cell.textContent.trim();
      if (!text) return;
      // Short leading-dash or single-line line is treated as the citation.
      if (/^[-–—]/.test(text) || (quoteParts.length && text.length < 60)) {
        citation = text.replace(/^[-–—]\s*/, '');
      } else {
        quoteParts.push(cell.innerHTML);
      }
    });
  });

  const figure = document.createElement('figure');

  if (picture) {
    const media = document.createElement('div');
    media.className = 'quote-image';
    const optimized = picture.tagName === 'PICTURE'
      ? picture
      : createOptimizedPicture(picture.src, picture.alt, false);
    media.append(optimized);
    figure.append(media);
  }

  if (quoteParts.length) {
    const blockquote = document.createElement('blockquote');
    blockquote.innerHTML = quoteParts.join('');
    figure.append(blockquote);
  }

  if (citation) {
    const figcaption = document.createElement('figcaption');
    figcaption.textContent = citation;
    figure.append(figcaption);
  }

  block.replaceChildren(figure);

  // keep option classes on the block for CSS targeting
  active.forEach((c) => block.classList.add(c));
}
