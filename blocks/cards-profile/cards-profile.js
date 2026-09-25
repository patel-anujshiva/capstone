/*
 * Cards (profile) — forked cards variant for contributor/guide profiles.
 * Each block holds one profile: image cell (circular avatar) + body cell
 * (name, role, social links). Forked variant: scoped to .cards-profile.
 *
 * The source social links use an icon font (unavailable in EDS), so we group
 * the plain text links into a single row and tag each with its network. CSS
 * then renders them as dark icon squares (SVG mask). Visible text is removed
 * but preserved as an aria-label for accessibility.
 */

import { createOptimizedPicture } from '../../scripts/aem.js';

function network(label) {
  const l = label.toLowerCase();
  if (l.includes('face')) return 'facebook';
  if (l.includes('tw')) return 'twitter';
  if (l.includes('insta')) return 'instagram';
  return '';
}

export default function decorate(block) {
  // Byline shape: the name is a top-level heading (h1/h2) rather than the
  // card's h3, e.g. an author bio at the end of an article. It renders as a
  // horizontal byline (small avatar left, text right) instead of a card.
  // Authors can also opt in explicitly with the "byline" variant.
  if (block.querySelector(':scope > div > div > :is(h1, h2)')) {
    block.classList.add('byline');
  }

  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-profile-card-image';
      } else {
        div.className = 'cards-profile-card-body';
      }
    });

    // Group social links (each is a <p><a>) into one row, tag network,
    // and swap visible text for an accessible label consumed by CSS icons.
    const body = li.querySelector('.cards-profile-card-body');
    if (body) {
      const linkParas = [...body.querySelectorAll(':scope > p')]
        .filter((p) => p.querySelector('a'));
      if (linkParas.length) {
        const social = document.createElement('div');
        social.className = 'cards-profile-social';
        linkParas.forEach((p) => {
          const a = p.querySelector('a');
          const label = a.textContent.trim();
          const net = network(label);
          a.className = 'cards-profile-icon';
          if (net) {
            a.classList.add(net);
            a.setAttribute('aria-label', label || net);
          }
          a.textContent = '';
          social.append(a);
          p.remove();
        });
        body.append(social);
      }
    }

    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);
}
