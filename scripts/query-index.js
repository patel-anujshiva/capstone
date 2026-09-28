/*
 * Query index helpers for dynamic lists.
 *
 * A block switches to query mode when it is authored as key/value settings rows instead of
 * content rows, e.g.
 *   | Folder   | /us/en/magazine/                |
 *   | Template | article                         |
 *   | Sort     | date desc                       |
 *   | Limit    | 4                               |
 *   | Exclude  | /us/en/magazine/members-only/   |
 * Pages come from /query-index.json (path, title, description, image, template, tags, date),
 * so newly published pages appear without editing the lists. Folder matches its direct
 * children; Exclude takes page paths, or folder paths ending in "/".
 */

import { createOptimizedPicture, toClassName } from './aem.js';

const QUERY_KEYS = ['folder', 'template', 'tags', 'sort', 'limit', 'exclude'];

let indexPromise;

/**
 * Loads every row of the query index (paged), once per page view.
 * @param {string} [url]
 * @returns {Promise<Object[]>}
 */
export function fetchIndex(url = '/query-index.json') {
  if (!indexPromise) {
    indexPromise = (async () => {
      const rows = [];
      let total = Infinity;
      while (rows.length < total) {
        // eslint-disable-next-line no-await-in-loop
        const resp = await fetch(`${url}?offset=${rows.length}&limit=500`);
        if (!resp.ok) break;
        // eslint-disable-next-line no-await-in-loop
        const json = await resp.json();
        const data = json.data || [];
        rows.push(...data);
        total = json.total ?? rows.length;
        if (!data.length) break;
      }
      return rows;
    })();
  }
  return indexPromise;
}

/**
 * Splits a setting or index value into a list (comma/newline separated or a JSON array).
 * @param {string|string[]} value
 * @returns {string[]}
 */
export function toList(value) {
  if (Array.isArray(value)) return value.map((v) => `${v}`.trim()).filter(Boolean);
  const text = `${value ?? ''}`.trim();
  if (text.startsWith('[')) {
    try {
      return toList(JSON.parse(text));
    } catch {
      // not JSON, fall through
    }
  }
  return text.split(/[\n,]/).map((v) => v.trim()).filter(Boolean);
}

/**
 * Reads query settings from a block authored as key/value rows. Returns null when the block
 * holds regular content rows, so blocks keep working with hand-authored content.
 * @param {Element} block
 * @param {string[]} [extraKeys] block-specific settings (e.g. 'filters', 'link-text')
 * @returns {Object|null}
 */
export function readQueryConfig(block, extraKeys = []) {
  const keys = [...QUERY_KEYS, ...extraKeys];
  const rows = [...block.children];
  if (!rows.length) return null;
  const config = {};
  const isConfig = rows.every((row) => {
    const cells = [...row.children];
    if (cells.length !== 2 || cells[0].querySelector('picture, img')) return false;
    const key = toClassName(cells[0].textContent);
    if (!keys.includes(key)) return false;
    const paras = [...cells[1].querySelectorAll('p')];
    config[key] = (paras.length > 1 ? paras.map((p) => p.textContent) : [cells[1].textContent])
      .map((v) => v.trim()).join('\n');
    return true;
  });
  return isConfig && (config.folder || config.template) ? config : null;
}

/**
 * Current page path as it appears in the index (no /content prefix or .html).
 * @returns {string}
 */
function currentPath() {
  return window.location.pathname
    .replace(/^\/content(?=\/)/, '')
    .replace(/\.(plain\.)?html$/, '')
    .replace(/\/$/, '') || '/';
}

/**
 * Selects pages from the index according to query settings. The current page is excluded.
 * @param {Object} config settings from readQueryConfig
 * @returns {Promise<Object[]>}
 */
export async function queryPages(config) {
  const rows = await fetchIndex();
  const folder = config.folder ? `${config.folder.trim().replace(/\/?$/, '/')}` : '';
  const template = toClassName(config.template || '');
  const tags = toList(config.tags).map(toClassName);
  const excludes = toList(config.exclude).map((p) => p.replace(/\.html$/, ''));
  const here = currentPath();

  const isExcluded = (path) => path === here || excludes.some((ex) => (
    ex.endsWith('/') ? path.startsWith(ex) : path === ex.replace(/\/$/, '')));

  // a folder lists its direct children only (e.g. /magazine/ excludes /magazine/members-only/…)
  const inFolder = (path) => path.startsWith(folder) && !path.slice(folder.length).includes('/');
  const pages = rows.filter((page) => page.path
    && (!folder || inFolder(page.path))
    && (!template || toClassName(page.template || '') === template)
    && (!tags.length || toList(page.tags).map(toClassName).some((t) => tags.includes(t)))
    && !isExcluded(page.path));

  const [field = 'title', order = 'asc'] = (config.sort || 'title').toLowerCase().split(/\s+/);
  const key = field === 'date' ? 'date' : 'title';
  const direction = order === 'desc' ? -1 : 1;
  pages.sort((a, b) => (`${a[key] || ''}`.localeCompare(`${b[key] || ''}`) * direction)
    || `${a.title || ''}`.localeCompare(`${b.title || ''}`));

  const limit = parseInt(config.limit, 10);
  return limit > 0 ? pages.slice(0, limit) : pages;
}

/**
 * Builds the picture for an index row.
 * @param {Object} page
 * @param {boolean} [eager]
 * @returns {Element|null}
 */
export function pagePicture(page, eager = false) {
  if (!page.image || page.image.startsWith('/default-meta-image')) return null;
  return createOptimizedPicture(page.image, page.title || '', eager, [{ width: '750' }]);
}

/**
 * Builds a heading that links to the page.
 * @param {Object} page
 * @param {string} [tag]
 * @returns {Element}
 */
export function pageHeading(page, tag = 'h3') {
  const heading = document.createElement(tag);
  const link = document.createElement('a');
  link.href = page.path;
  link.textContent = page.title || page.path;
  heading.append(link);
  return heading;
}
