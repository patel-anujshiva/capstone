/*
 * Header block
 * Builds the site header from the nav fragment (nav.plain.html). All copy, links and
 * images come from the fragment; this file only adds structure, form controls and behavior.
 *
 * Fragment sections (top-level divs), in order:
 *   1. utility  — account link (href "#…") + current-locale paragraph + locale list
 *   2. brand    — logo link
 *   3. sections — primary navigation list
 *   4. tools    — search placeholder text
 *   5. modal    — account dialog copy (title, subtitle, field labels, help link, submit label)
 */

// full desktop layout breakpoint (mobile-first: everything below is the compact bar)
const isDesktop = window.matchMedia('(width >= 1200px)');

const SECTION_NAMES = ['utility', 'brand', 'sections', 'tools', 'modal'];

/**
 * Fetches the nav fragment. Metadata-independent: local dev server first, then site root.
 * @returns {Promise<{html: string, base: string}|null>}
 */
async function fetchNav() {
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
  if (!resp.ok) return null;
  return { html: await resp.text(), base: resp.url };
}

/**
 * Normalizes the fragment so authored (DA-converted) and raw markup decorate the same way:
 * <picture> is unwrapped to its <img>, image paths are resolved against the fragment URL
 * (not the page URL), and a <p> wrapping the start of a list item is unwrapped.
 * @param {Element} root
 * @param {string} base
 */
function normalizeFragment(root, base) {
  root.querySelectorAll('picture').forEach((picture) => {
    const img = picture.querySelector('img');
    if (img) picture.replaceWith(img); else picture.remove();
  });
  root.querySelectorAll('img[src]').forEach((img) => {
    img.src = new URL(img.getAttribute('src'), base).href;
    img.loading = 'eager';
  });
  root.querySelectorAll('li > p:first-child').forEach((p) => p.replaceWith(...p.childNodes));
}

/**
 * Normalizes a path for active-link comparison (drops /content prefix, .html, trailing slash).
 * @param {string} pathname
 * @returns {string}
 */
function normalizePath(pathname) {
  return pathname
    .replace(/^\/content(?=\/)/, '')
    .replace(/\.(plain\.)?html$/, '')
    .replace(/\/$/, '') || '/';
}

/**
 * Returns the direct text of an element (ignores text inside child elements).
 * @param {Element} el
 * @returns {string}
 */
function ownText(el) {
  return [...el.childNodes]
    .filter((n) => n.nodeType === Node.TEXT_NODE)
    .map((n) => n.textContent)
    .join('')
    .trim();
}

/**
 * Makes an anchor behave as a button for keyboard users (Space activates it).
 * @param {HTMLAnchorElement} a
 */
function anchorAsButton(a) {
  a.setAttribute('role', 'button');
  a.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
      e.preventDefault();
      a.click();
    }
  });
}

/**
 * Wires a toggle control to a panel: click toggles, click outside and Escape close.
 * @param {HTMLElement} button
 * @param {Element} panel
 * @param {Element} container Clicks inside this element don't close the panel
 */
function bindToggle(button, panel, container) {
  const setOpen = (open) => {
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
    panel.hidden = !open;
  };
  setOpen(false);
  // the panel's own hidden state is the source of truth (aria-expanded mirrors it)
  button.addEventListener('click', (e) => {
    e.preventDefault();
    setOpen(panel.hidden);
  });
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target)) setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.hidden) {
      setOpen(false);
      button.focus();
    }
  });
  return setOpen;
}

/**
 * Builds the locale selector from a "current locale" paragraph and a list of
 * country items (flag image + country name + nested list of locale links).
 * @param {Element} current
 * @param {Element} list
 * @returns {Element}
 */
function buildLocaleSelector(current, list) {
  const wrapper = document.createElement('div');
  wrapper.className = 'nav-locale';

  const button = document.createElement('a');
  button.href = '#nav-locale-panel';
  button.className = 'nav-locale-toggle';
  anchorAsButton(button);
  const label = ownText(current) || current.textContent.trim();
  const flag = current.querySelector('img');
  if (flag) {
    flag.alt = '';
    flag.className = 'nav-locale-flag';
    button.append(flag);
  }
  const text = document.createElement('span');
  text.textContent = label;
  button.append(text);
  button.setAttribute('aria-label', `Toggle language ${label}`);
  button.setAttribute('aria-controls', 'nav-locale-panel');

  list.id = 'nav-locale-panel';
  list.className = 'nav-locale-panel';
  list.querySelectorAll(':scope > li').forEach((li) => {
    li.className = 'nav-locale-country';
    const img = li.querySelector(':scope > img');
    if (img) img.className = 'nav-locale-flag';
    const name = document.createElement('span');
    name.className = 'nav-locale-name';
    name.textContent = ownText(li);
    [...li.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE).forEach((n) => n.remove());
    const links = li.querySelector(':scope > ul');
    if (links) {
      links.className = 'nav-locale-links';
      li.insertBefore(name, links);
      links.querySelectorAll('a').forEach((a) => {
        if (a.textContent.trim().toLowerCase() === label.toLowerCase()) a.setAttribute('aria-current', 'true');
      });
    } else {
      li.append(name);
    }
  });

  wrapper.append(button, list);
  bindToggle(button, list, wrapper);
  return wrapper;
}

/**
 * Builds the account dialog from the modal section copy.
 * @param {Element} section
 * @returns {HTMLDialogElement}
 */
function buildAccountDialog(section) {
  const dialog = document.createElement('dialog');
  dialog.className = 'nav-modal';
  const panel = document.createElement('div');
  panel.className = 'nav-modal-panel';

  const title = section.querySelector('h1, h2');
  if (title) {
    title.className = 'nav-modal-title';
    title.id = 'nav-modal-title';
    dialog.setAttribute('aria-labelledby', title.id);
    panel.append(title);
  }
  const subtitle = section.querySelector('h3, h4');
  if (subtitle) {
    subtitle.className = 'nav-modal-subtitle';
    panel.append(subtitle);
  }

  const form = document.createElement('form');
  form.className = 'nav-modal-form';
  form.method = 'post';
  const fields = [...section.querySelectorAll('li')].map((li) => li.textContent.trim());
  fields.forEach((field, i) => {
    const input = document.createElement('input');
    const id = `nav-modal-field-${i}`;
    input.id = id;
    input.name = field.toLowerCase().replace(/\W+/g, '-');
    input.type = /pass/i.test(field) ? 'password' : 'text';
    input.autocomplete = input.type === 'password' ? 'current-password' : 'username';
    input.placeholder = field;
    input.setAttribute('aria-label', field);
    form.append(input);
  });

  const paragraphs = [...section.querySelectorAll(':scope > p')];
  const help = paragraphs.find((p) => p.querySelector('a'));
  if (help) {
    help.className = 'nav-modal-help';
    form.append(help);
  }
  const submitLabel = paragraphs.filter((p) => !p.querySelector('a')).pop();
  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'nav-modal-submit';
  submit.textContent = submitLabel ? submitLabel.textContent.trim() : 'Submit';
  form.append(submit);
  form.addEventListener('submit', (e) => e.preventDefault());

  panel.append(form, document.createElement('hr'));
  dialog.append(panel);
  // click on the backdrop area (outside the panel) closes the dialog
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });
  return dialog;
}

/**
 * Builds the search form from the tools section placeholder text.
 * @param {Element} section
 * @returns {HTMLFormElement}
 */
function buildSearch(section) {
  const placeholder = section.textContent.trim() || 'Search';
  const form = document.createElement('form');
  form.className = 'nav-search';
  form.role = 'search';
  form.action = '/search';
  form.method = 'get';
  const icon = document.createElement('span');
  icon.className = 'nav-search-icon';
  icon.setAttribute('aria-hidden', 'true');
  const input = document.createElement('input');
  input.type = 'search';
  input.name = 'q';
  input.placeholder = placeholder;
  input.setAttribute('aria-label', placeholder);
  form.append(icon, input);
  return form;
}

/**
 * Opens/closes the compact-bar drawer. The drawer pushes the page: the block gets
 * `menu-open` (header shifts) and the body gets `nav-open` (main/footer shift, styles.css).
 * @param {Element} block
 * @param {boolean|null} force
 */
function toggleMenu(block, force = null) {
  const nav = block.querySelector('#nav');
  const expanded = force !== null ? force : nav.getAttribute('aria-expanded') !== 'true';
  const open = expanded && !isDesktop.matches;
  nav.setAttribute('aria-expanded', open ? 'true' : 'false');
  block.classList.toggle('menu-open', open);
  document.body.classList.toggle('nav-open', open);
  const button = block.querySelector('.nav-hamburger button');
  if (button) {
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
    button.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  }
}

/**
 * loads and decorates the header
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const navData = await fetchNav();
  if (!navData) return;

  const fragment = document.createElement('div');
  fragment.innerHTML = navData.html;
  normalizeFragment(fragment, navData.base);

  const sections = {};
  [...fragment.children].forEach((div, i) => {
    if (SECTION_NAMES[i]) sections[SECTION_NAMES[i]] = div;
  });

  block.textContent = '';
  const nav = document.createElement('div');
  nav.id = 'nav';
  nav.className = 'nav';

  // utility bar
  const utility = document.createElement('div');
  utility.className = 'nav-utility';
  const utilityInner = document.createElement('div');
  utilityInner.className = 'nav-utility-inner';
  let dialog = null;
  if (sections.utility) {
    const accountLink = [...sections.utility.querySelectorAll(':scope > p > a')]
      .find((a) => a.getAttribute('href')?.startsWith('#'));
    if (accountLink && sections.modal) {
      dialog = buildAccountDialog(sections.modal);
      accountLink.className = 'nav-account';
      anchorAsButton(accountLink);
      accountLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (dialog.open) dialog.close();
        else dialog.show();
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && dialog.open) dialog.close();
      });
      utilityInner.append(accountLink);
    }
    const current = [...sections.utility.querySelectorAll(':scope > p')].find((p) => p.querySelector('img'));
    const list = sections.utility.querySelector(':scope > ul');
    if (current && list) utilityInner.append(buildLocaleSelector(current, list));
  }
  utility.append(utilityInner);

  // main bar
  const main = document.createElement('div');
  main.className = 'nav-main';
  const mainInner = document.createElement('div');
  mainInner.className = 'nav-main-inner';

  const hamburger = document.createElement('div');
  hamburger.className = 'nav-hamburger';
  hamburger.innerHTML = `<button type="button" aria-controls="nav-drawer" aria-expanded="false" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(block));
  mainInner.append(hamburger);

  if (sections.brand) {
    sections.brand.className = 'nav-brand';
    mainInner.append(sections.brand);
  }
  let primary = null;
  if (sections.sections) {
    primary = document.createElement('nav');
    primary.id = 'nav-drawer';
    primary.className = 'nav-sections';
    primary.setAttribute('aria-label', 'Main');
    primary.append(...sections.sections.childNodes);
    // a single top-level item that wraps the whole list is the nav root (e.g. "Home")
    const topItems = primary.querySelectorAll(':scope > ul > li');
    if (topItems.length === 1 && topItems[0].querySelector(':scope > ul')) {
      topItems[0].classList.add('nav-root');
    }
    const here = normalizePath(window.location.pathname);
    primary.querySelectorAll('a[href]').forEach((a) => {
      if (a.parentElement.classList.contains('nav-root')) return;
      const target = normalizePath(new URL(a.href, window.location).pathname);
      if (target === here) a.setAttribute('aria-current', 'page');
    });
    mainInner.append(primary);
  }
  const tools = document.createElement('div');
  tools.className = 'nav-tools';
  if (sections.tools) tools.append(buildSearch(sections.tools));
  mainInner.append(tools);
  main.append(mainInner);

  nav.append(utility, main);
  nav.setAttribute('aria-expanded', 'false');

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
  if (dialog) block.append(dialog);

  // one primary nav element: inline in the bar on desktop, an off-canvas drawer
  // (outside the transformed wrapper) on the compact bar
  const placePrimary = () => {
    if (!primary) return;
    if (isDesktop.matches) mainInner.insertBefore(primary, tools);
    else block.append(primary);
  };
  placePrimary();

  // compact drawer closes on outside click, link activation and Escape
  document.addEventListener('click', (e) => {
    if (nav.getAttribute('aria-expanded') !== 'true') return;
    if (primary?.contains(e.target) && !e.target.closest('a')) return;
    if (hamburger.contains(e.target)) return;
    toggleMenu(block, false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.getAttribute('aria-expanded') === 'true') {
      toggleMenu(block, false);
      hamburger.querySelector('button').focus();
    }
  });

  // shrink the main bar once the page scrolls
  const onScroll = () => navWrapper.classList.toggle('scrolled', window.scrollY > 0);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // crossing the desktop breakpoint: close the drawer and move the nav back
  isDesktop.addEventListener('change', () => {
    toggleMenu(block, false);
    placePrimary();
  });
}
