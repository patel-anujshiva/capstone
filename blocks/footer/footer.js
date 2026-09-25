/*
 * Footer block
 * Builds the site footer from the footer fragment (footer.plain.html). All copy, links and
 * images come from the fragment; this file only adds structure and accessibility hooks.
 *
 * Fragment sections (top-level divs), in order:
 *   1. brand  — logo link
 *   2. nav    — root link (kept for parity, hidden) with a nested list of footer links
 *   3. social — heading + list of social links (icon image + network name)
 *   4. legal  — paragraphs of legal / attribution copy
 */

const SECTION_NAMES = ['brand', 'nav', 'social', 'legal'];

/**
 * Fetches the footer fragment. Metadata-independent: local dev server first, then site root.
 * @returns {Promise<{html: string, base: string}|null>}
 */
async function fetchFooter() {
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch('/footer.plain.html');
  if (!resp.ok) return null;
  return { html: await resp.text(), base: resp.url };
}

/**
 * Resolves relative image paths against the fragment URL (not the page URL).
 * @param {Element} root
 * @param {string} base
 */
function resolveImages(root, base) {
  root.querySelectorAll('img[src]').forEach((img) => {
    img.src = new URL(img.getAttribute('src'), base).href;
  });
}

/**
 * Turns the nav section into a labelled <nav>; a list item that wraps a nested list is the
 * root item, whose own link is hidden (only its children are shown).
 * @param {Element} section
 * @returns {Element}
 */
function buildNav(section) {
  const nav = document.createElement('nav');
  nav.className = 'footer-nav';
  nav.setAttribute('aria-label', 'Footer navigation');
  nav.append(...section.childNodes);
  nav.querySelectorAll('li').forEach((li) => {
    if (li.querySelector(':scope > ul')) li.classList.add('footer-nav-root');
  });
  return nav;
}

/**
 * Decorates the social section: heading and icon list become separate columns, each link keeps
 * its network name as an accessible label while only the icon is shown. The authored icon image
 * is painted as a CSS background (like the source's icon-font glyph) instead of an <img>.
 * @param {Element} section
 * @returns {Element}
 */
function buildSocial(section) {
  section.className = 'footer-social';
  const heading = section.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) {
    const title = document.createElement('div');
    title.className = 'footer-social-title';
    title.append(heading);
    section.prepend(title);
  }
  const list = section.querySelector('ul');
  if (list) list.classList.add('footer-social-list');
  section.querySelectorAll('a').forEach((a) => {
    const name = a.textContent.trim();
    a.classList.add('footer-social-link');
    if (name) a.setAttribute('aria-label', name);
    const icon = a.querySelector('img');
    if (icon) {
      a.style.setProperty('--footer-social-icon', `url("${icon.src}")`);
      icon.remove();
    }
    [...a.childNodes].forEach((n) => {
      if (n.nodeType === Node.TEXT_NODE && n.textContent.trim()) {
        const label = document.createElement('span');
        label.className = 'footer-social-label';
        label.textContent = n.textContent.trim();
        n.replaceWith(label);
      }
    });
  });
  return section;
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const fragment = await fetchFooter();
  if (!fragment) return;

  const tmp = document.createElement('div');
  tmp.innerHTML = fragment.html;
  resolveImages(tmp, fragment.base);

  const sections = {};
  [...tmp.children].forEach((section, i) => {
    const name = SECTION_NAMES[i] || `extra-${i}`;
    section.classList.add(`footer-${name}`);
    sections[name] = section;
  });

  const container = document.createElement('div');
  container.className = 'footer-container';

  const top = document.createElement('div');
  top.className = 'footer-top';
  if (sections.brand) top.append(sections.brand);
  if (sections.nav) top.append(buildNav(sections.nav));
  if (sections.social) top.append(buildSocial(sections.social));
  container.append(top);

  if (sections.legal) container.append(sections.legal);
  Object.keys(sections)
    .filter((name) => !SECTION_NAMES.includes(name))
    .forEach((name) => container.append(sections[name]));

  block.textContent = '';
  block.append(container);
}
