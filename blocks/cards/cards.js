import { createOptimizedPicture } from '../../scripts/aem.js';
import {
  readQueryConfig, queryPages, pagePicture, pageHeading,
} from '../../scripts/query-index.js';

/**
 * Query mode: builds one card row (image | title + description) per matching index page.
 * @param {Element} block
 * @param {Object} config
 */
async function buildQueryRows(block, config) {
  const pages = await queryPages(config);
  const rows = pages.map((page) => {
    const row = document.createElement('div');
    const image = document.createElement('div');
    const picture = pagePicture(page);
    if (picture) image.append(picture);
    const body = document.createElement('div');
    body.append(pageHeading(page, 'h3'));
    if (page.description) {
      const p = document.createElement('p');
      p.textContent = page.description;
      body.append(p);
    }
    row.append(image, body);
    return row;
  });
  block.replaceChildren(...rows);
}

export default async function decorate(block) {
  const config = readQueryConfig(block);
  if (config) await buildQueryRows(block, config);

  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.replaceChildren(ul);
}
