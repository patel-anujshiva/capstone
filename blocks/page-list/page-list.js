import { readQueryConfig, queryPages } from '../../scripts/query-index.js';

/**
 * Formats an index date (ISO 8601) like the source: "Thursday, 9 Jul 2020".
 * @param {string} value
 * @returns {string}
 */
function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const locale = document.documentElement.lang || 'en';
  const part = (options) => new Intl.DateTimeFormat(locale, options).format(date);
  return `${part({ weekday: 'long' })}, ${part({ day: 'numeric' })} ${part({ month: 'short' })} ${part({ year: 'numeric' })}`;
}

/**
 * Page list (e.g. "Up Next" on articles): a text list of page titles and dates, built from the
 * query index. Authored as settings rows (Folder / Template / Sort / Limit / Exclude); the
 * current page is always left out.
 * @param {Element} block
 */
export default async function decorate(block) {
  const config = readQueryConfig(block);
  if (!config) return;

  const pages = await queryPages(config);
  const ul = document.createElement('ul');
  pages.forEach((page) => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = page.path;
    link.className = 'page-list-link';
    const title = document.createElement('span');
    title.className = 'page-list-title';
    title.textContent = page.title || page.path;
    link.append(title);
    const date = formatDate(page.date);
    if (date) {
      const time = document.createElement('time');
      time.className = 'page-list-date';
      time.dateTime = page.date;
      time.textContent = date;
      link.append(time);
    }
    li.append(link);
    ul.append(li);
  });
  block.replaceChildren(ul);
}
