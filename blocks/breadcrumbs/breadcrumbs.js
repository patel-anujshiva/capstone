/*
 * Breadcrumbs Block
 * Renders an authored list of links as a horizontal breadcrumb trail.
 * Content contract (standalone): each row/cell holds one crumb; links become
 * navigable crumbs, the final plain-text crumb is the current page.
 */

export default function decorate(block) {
  // Collect crumbs from whatever cells the author provided.
  const crumbs = [];
  [...block.children].forEach((row) => {
    [...row.children].forEach((cell) => {
      const link = cell.querySelector('a');
      const text = cell.textContent.trim();
      if (!text) return;
      if (link) {
        crumbs.push({ text: link.textContent.trim() || text, href: link.getAttribute('href') });
      } else {
        crumbs.push({ text });
      }
    });
  });

  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Breadcrumb');

  const list = document.createElement('ol');
  crumbs.forEach((crumb, i) => {
    const item = document.createElement('li');
    const isLast = i === crumbs.length - 1;
    if (crumb.href && !isLast) {
      const a = document.createElement('a');
      a.href = crumb.href;
      a.textContent = crumb.text;
      item.append(a);
    } else {
      item.textContent = crumb.text;
      if (isLast) item.setAttribute('aria-current', 'page');
    }
    list.append(item);
  });

  nav.append(list);
  block.replaceChildren(nav);
}
