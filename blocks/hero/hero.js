import { readQueryConfig, queryPages, pagePicture } from '../../scripts/query-index.js';

/**
 * Hero is styled from authored rows (image row, then title/description/link row). In query
 * mode (settings rows, e.g. Folder / Template / Sort / Link Text) it features the first
 * matching index page and builds those same rows.
 * @param {Element} block
 */
export default async function decorate(block) {
  const config = readQueryConfig(block, ['link-text']);
  if (!config) return;

  const [page] = await queryPages({ ...config, limit: 1 });
  if (!page) {
    block.replaceChildren();
    return;
  }

  const imageRow = document.createElement('div');
  const imageCell = document.createElement('div');
  const picture = pagePicture(page, true);
  if (picture) imageCell.append(picture);
  imageRow.append(imageCell);

  const textRow = document.createElement('div');
  const textCell = document.createElement('div');
  const title = document.createElement('h2');
  title.textContent = page.title || '';
  textCell.append(title);
  if (page.description) {
    const p = document.createElement('p');
    p.textContent = page.description;
    textCell.append(p);
  }
  const cta = document.createElement('p');
  const link = document.createElement('a');
  link.href = page.path;
  link.textContent = config['link-text'] || page.title || page.path;
  cta.append(link);
  textCell.append(cta);
  textRow.append(textCell);

  block.replaceChildren(imageRow, textRow);
}
