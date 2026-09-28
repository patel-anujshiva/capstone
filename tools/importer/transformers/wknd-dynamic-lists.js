/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND dynamic lists -> query blocks.
 *
 * The source builds its page lists from AEM queries (List / Image List components). Instead of
 * freezing today's items as hand-authored card rows, each list is imported as a block authored
 * with query settings (Folder / Template / Sort / Limit / Exclude …) that the EDS block resolves
 * against /query-index.json at runtime, so newly published pages appear automatically.
 *
 * Settings are inferred from the source list itself:
 *  - Folder:   common parent folder of the listed pages (lists show that folder's direct children)
 *  - Template: <meta name="template"> of a listed page ("article-page-template" -> "article")
 *  - Sort:     "title" / "title desc" when the items are in that order, else "date desc"
 *  - Limit:    the item count, unless the list sits on the folder's own landing page (full listing)
 *  - Exclude:  for limited date-sorted rails, pages featured on the same page (.cmp-teaser--featured)
 *
 * Handled source components:
 *  - .cmp-image-list (outside tabs)    -> Cards (query)            e.g. "Recent Articles"
 *  - .cmp-tabs with image-list panels  -> tabs-minimal-dark-withimg with Filters = tab -> tags
 *  - .cmp-list--upnext                 -> Page List (query)        article "Up Next" (moved to
 *                                         the end of the article body, see convertUpNext)
 *  - homepage adventure hero teaser    -> Hero (query), newest adventure ("Next Adventures")
 *
 * Listed pages' template/tags are read with synchronous same-origin requests (the importer runs
 * inside the source page), cached per path.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

const pageCache = {};

function toPath(href, document) {
  try {
    return new URL(href, document.location.href).pathname.replace(/\.html$/, '');
  } catch (e) {
    return '';
  }
}

function readSourcePage(path) {
  if (pageCache[path]) return pageCache[path];
  const info = { template: '', tags: [] };
  try {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `${path}.html`, false);
    xhr.send();
    if (xhr.status === 200) {
      const doc = new DOMParser().parseFromString(xhr.responseText, 'text/html');
      const template = doc.querySelector('meta[name="template"]');
      const keywords = doc.querySelector('meta[name="keywords"]');
      info.template = ((template && template.content) || '').trim().replace(/-page-template$/, '');
      info.tags = ((keywords && keywords.content) || '').split(',').map((t) => t.trim()).filter(Boolean);
    }
  } catch (e) {
    // keep defaults; the setting is simply omitted
  }
  pageCache[path] = info;
  return info;
}

function commonFolder(paths) {
  const parents = paths.map((p) => p.slice(0, p.lastIndexOf('/') + 1));
  if (!parents.length || parents.some((p) => p !== parents[0])) return '';
  return parents[0];
}

function inferSort(titles) {
  const cmp = (a, b) => a.localeCompare(b);
  const asc = titles.every((t, i) => i === 0 || cmp(titles[i - 1], t) <= 0);
  if (asc) return 'title';
  const desc = titles.every((t, i) => i === 0 || cmp(titles[i - 1], t) >= 0);
  return desc ? 'title desc' : 'date desc';
}

function featuredPaths(document, folder) {
  return [...document.querySelectorAll('.cmp-teaser--featured a[href]')]
    .map((a) => toPath(a.getAttribute('href'), document))
    .filter((p, i, all) => p.startsWith(folder) && all.indexOf(p) === i);
}

/**
 * Builds query settings for a list of linked items.
 * @returns {Array<[string, string]>|null}
 */
function inferSettings(document, items, { exclude = true } = {}) {
  const paths = items.map((i) => i.path).filter(Boolean);
  const folder = commonFolder(paths);
  if (!folder) return null;
  const template = readSourcePage(paths[0]).template;
  const sort = inferSort(items.map((i) => i.title));
  const here = toPath(document.location.href, document);
  const isFolderPage = `${here}/` === folder;
  const settings = [['Folder', folder]];
  if (template) settings.push(['Template', template]);
  settings.push(['Sort', sort]);
  if (!isFolderPage) settings.push(['Limit', `${items.length}`]);
  if (exclude && !isFolderPage && sort === 'date desc') {
    const featured = featuredPaths(document, folder).filter((p) => !paths.includes(p));
    if (featured.length) settings.push(['Exclude', featured.join(', ')]);
  }
  return settings;
}

function block(document, name, settings) {
  return WebImporter.Blocks.createBlock(document, { name, cells: settings });
}

function imageListItems(list, document) {
  return [...list.querySelectorAll('.cmp-image-list__item')].map((item) => {
    const link = item.querySelector('a[href]');
    const title = item.querySelector('.cmp-image-list__item-title');
    return {
      path: link ? toPath(link.getAttribute('href'), document) : '',
      title: (title || link || item).textContent.trim(),
    };
  });
}

/** Tab filters: "Label" when the label is itself a tag covering the panel, else "Label = tags". */
function inferFilters(tabs, allPaths) {
  const tagsOf = (p) => readSourcePage(p).tags;
  return tabs.map(({ label, paths }) => {
    const inside = new Set(paths);
    const outside = allPaths.filter((p) => !inside.has(p));
    const exclusive = (tag) => !outside.some((p) => tagsOf(p).includes(tag));
    if (paths.every((p) => tagsOf(p).includes(label)) && exclusive(label)) return label;
    // greedy cover of the panel with tags that only occur on its pages
    const candidates = [...new Set(paths.flatMap(tagsOf))].filter(exclusive);
    const chosen = [];
    let uncovered = paths.filter(() => true);
    while (uncovered.length) {
      const best = candidates
        .map((tag) => ({ tag, hits: uncovered.filter((p) => tagsOf(p).includes(tag)).length }))
        .sort((a, b) => b.hits - a.hits || a.tag.localeCompare(b.tag))[0];
      if (!best || !best.hits) break;
      chosen.push(best.tag);
      uncovered = uncovered.filter((p) => !tagsOf(p).includes(best.tag));
    }
    return chosen.length ? `${label} = ${chosen.join(', ')}` : label;
  });
}

function convertTabs(document) {
  document.querySelectorAll('.cmp-tabs').forEach((tabsEl) => {
    const labels = [...tabsEl.querySelectorAll('.cmp-tabs__tab')].map((t) => t.textContent.trim());
    const panels = [...tabsEl.querySelectorAll('.cmp-tabs__tabpanel')];
    if (!panels.length || !panels[0].querySelector('.cmp-image-list')) return;
    const all = imageListItems(panels[0], document);
    const settings = inferSettings(document, all, { exclude: false });
    if (!settings) return;
    const allPaths = all.map((i) => i.path);
    const tabs = panels.slice(1).map((panel, i) => ({
      label: labels[i + 1],
      paths: imageListItems(panel, document).map((it) => it.path),
    })).filter((t) => t.label);
    const filters = inferFilters(tabs, allPaths);
    if (filters.length) {
      const cell = document.createElement('div');
      filters.forEach((f) => {
        const p = document.createElement('p');
        p.textContent = f;
        cell.append(p);
      });
      settings.push(['Filters', cell]);
    }
    tabsEl.replaceWith(block(document, 'tabs-minimal-dark-withimg', settings));
  });
}

function convertImageLists(document) {
  document.querySelectorAll('.cmp-image-list').forEach((list) => {
    if (list.closest('.cmp-tabs')) return;
    const settings = inferSettings(document, imageListItems(list, document));
    if (settings) list.replaceWith(block(document, 'Cards', settings));
  });
}

function convertUpNext(document) {
  document.querySelectorAll('.cmp-list--upnext').forEach((list) => {
    const items = [...list.querySelectorAll('.cmp-list__item')].map((item) => {
      const link = item.querySelector('a[href]');
      const title = item.querySelector('.cmp-list__item-title');
      return {
        path: link ? toPath(link.getAttribute('href'), document) : '',
        title: (title || link || item).textContent.trim(),
      };
    });
    const settings = inferSettings(document, items);
    if (!settings) return;
    // the source sidebar (.cmp-layoutcontainer--sidebar) follows the article body column in the
    // DOM; move the list into the body column, before the author experience fragment (which
    // starts the author section), so it stays in the article section (the block's CSS places
    // it back in the right-hand column on desktop)
    const sidebar = list.closest('.cmp-layoutcontainer--sidebar');
    const body = sidebar && sidebar.previousElementSibling;
    const listBlock = block(document, 'Page List', settings);
    const author = body && body.querySelector('.experiencefragment');
    if (author) {
      author.before(listBlock);
      list.remove();
    } else if (body) {
      body.append(listBlock);
      list.remove();
    } else {
      list.replaceWith(listBlock);
    }
  });
}

/** Homepage "Next Adventures": the adventure hero teaser becomes the newest adventure. */
function convertNextAdventure(document) {
  document.querySelectorAll('.cmp-teaser--hero').forEach((teaser) => {
    if (teaser.closest('.cmp-carousel')) return;
    const action = teaser.querySelector('.cmp-teaser__action-link, a[href]');
    const path = action ? toPath(action.getAttribute('href'), document) : '';
    const folder = path.slice(0, path.lastIndexOf('/') + 1);
    if (!/\/adventures\/$/.test(folder)) return;
    const settings = [['Folder', folder]];
    const template = readSourcePage(path).template;
    if (template) settings.push(['Template', template]);
    settings.push(['Sort', 'date desc'], ['Limit', '1'], ['Link Text', action.textContent.trim()]);
    teaser.replaceWith(block(document, 'Hero', settings));
  });
}

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    const { document } = payload;
    const templateName = payload.template && payload.template.name;
    convertTabs(document);
    convertImageLists(document);
    convertUpNext(document);
    if (templateName === 'homepage') convertNextAdventure(document);
  }
}
