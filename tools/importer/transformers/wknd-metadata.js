/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND page metadata for the query index.
 *
 * Adds Template, Tags and Date rows to the page Metadata block so the EDS query
 * index (configured in the configuration service) can list, filter and sort pages.
 * Values come from the source page itself — nothing is invented:
 *  - Template: <meta name="template"> (e.g. "article-page-template" -> "article")
 *  - Tags:     page data layer xdm:tags (AEM tag titles), else <meta name="keywords">
 *  - Date:     page data layer repo:modifyDate (ISO 8601)
 * The page data layer is pushed by an inline script as
 *   window.adobeDataLayer.push({ page: JSON.parse("{\x22page-…\x22:{…}}") })
 * so it is read from window.adobeDataLayer, falling back to parsing that script.
 *
 * Hooks: reads the values on beforeTransform (before cleanup strips scripts) and appends
 * the rows on afterMetadata, which import scripts fire right after
 * WebImporter.rules.createMetadata(main, document). Other transformers ignore that hook.
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
  afterMetadata: 'afterMetadata',
};

let pageMeta = null;

function readDataLayerPage(document) {
  const win = document.defaultView || (typeof window !== 'undefined' ? window : null);
  const layer = win && Array.isArray(win.adobeDataLayer) ? win.adobeDataLayer : [];
  const fromLayer = layer
    .map((entry) => entry && entry.page)
    .filter(Boolean)
    .map((page) => Object.values(page)[0])
    .find((page) => page && /\/page$/.test(page['@type'] || ''));
  if (fromLayer) return fromLayer;

  const script = [...document.querySelectorAll('script')]
    .map((s) => s.textContent)
    .find((t) => t.includes('xdm:template'));
  if (!script) return null;
  const m = script.match(/page:\s*JSON\.parse\("(.*?)"\)/s);
  if (!m) return null;
  try {
    const decoded = m[1]
      .replace(/\\x([0-9a-f]{2})/gi, (all, hex) => String.fromCharCode(parseInt(hex, 16)))
      .replace(/\\u([0-9a-f]{4})/gi, (all, hex) => String.fromCharCode(parseInt(hex, 16)))
      .replace(/\\\//g, '/');
    return Object.values(JSON.parse(decoded))[0] || null;
  } catch (e) {
    return null;
  }
}

function readPageMeta(document) {
  const page = readDataLayerPage(document) || {};
  const templateMeta = document.querySelector('meta[name="template"]');
  const template = ((templateMeta && templateMeta.content) || (page['xdm:template'] || '').split('/').pop() || '')
    .trim()
    .replace(/-page-template$/, '');
  let tags = Array.isArray(page['xdm:tags']) ? page['xdm:tags'] : [];
  if (!tags.length) {
    const keywords = document.querySelector('meta[name="keywords"]');
    tags = keywords && keywords.content ? keywords.content.split(',') : [];
  }
  tags = tags.map((t) => t.trim()).filter(Boolean);
  const date = (page['repo:modifyDate'] || '').trim();
  return { template, tags, date };
}

/**
 * Appends Template / Tags / Date rows to the Metadata block created by createMetadata().
 * @param {Element} main
 * @param {Document} document
 */
function appendPageMetadata(main, document) {
  const meta = pageMeta || readPageMeta(document);
  const table = [...main.querySelectorAll('table')].reverse()
    .find((t) => (t.querySelector('tr > *') || {}).textContent?.trim().toLowerCase() === 'metadata');
  if (!table) return;
  const body = table.querySelector('tbody') || table;
  const rows = [
    ['Template', meta.template],
    ['Tags', meta.tags.join(', ')],
    ['Date', meta.date],
  ];
  rows.forEach(([key, value]) => {
    if (!value) return;
    const tr = document.createElement('tr');
    const k = document.createElement('td');
    k.textContent = key;
    const v = document.createElement('td');
    v.textContent = value;
    tr.append(k, v);
    body.append(tr);
  });
}

// afterMetadata: element is the page main, after createMetadata() added the Metadata table
export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    pageMeta = readPageMeta(payload.document);
  }
  if (hookName === TransformHook.afterMetadata) {
    appendPageMetadata(element, payload.document);
  }
}
