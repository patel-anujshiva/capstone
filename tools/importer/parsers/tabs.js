/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs. Base block: tabs.
 * Source: https://wknd.site/ca/en/adventures/bali-surf-camp.html
 * Selector: .cmp-tabs (AEM Core Component tabs)
 * Generated: 2026-09-24
 *
 * Source structure (from source.html / cleaned.html):
 *   .cmp-tabs > ol.cmp-tabs__tablist > li.cmp-tabs__tab (labels: Overview /
 *   Itinerary / What to Bring), followed by one .cmp-tabs__tabpanel per tab in
 *   the same document order. Each panel wraps its content in
 *   .contentfragment > article.cmp-contentfragment.
 *   structure.json flags no invalid nesting; tabs/panels are iterationSafe.
 *
 * Output (blocks/tabs convention): 2 columns, block-name row then one row per
 * tab — first cell = tab label, second cell = the panel's content. Tabs and
 * panels are paired by index (tablist order matches tabpanel order).
 */
export default function parse(element, { document }) {
  // Tab labels, in order.
  const tabs = Array.from(
    element.querySelectorAll(':scope > .cmp-tabs__tablist > .cmp-tabs__tab'),
  );
  const tabsFallback = tabs.length
    ? tabs
    : Array.from(element.querySelectorAll('.cmp-tabs__tablist .cmp-tabs__tab'));

  // Panels, in the same order as the tabs.
  const panels = Array.from(
    element.querySelectorAll(':scope > .cmp-tabs__tabpanel'),
  );
  const panelsFallback = panels.length
    ? panels
    : Array.from(element.querySelectorAll('.cmp-tabs__tabpanel'));

  // Empty-block guard: bail if there is nothing to build a tab set from.
  if (!tabsFallback.length || !panelsFallback.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  tabsFallback.forEach((tab, i) => {
    // First cell: tab label text (plain text, no interactive markup).
    const label = document.createElement('p');
    label.textContent = tab.textContent.replace(/\s+/g, ' ').trim();

    // Second cell: the corresponding panel's content. Prefer the inner
    // content-fragment article/body so grid scaffolding is dropped, falling
    // back to the whole panel.
    const panel = panelsFallback[i];
    let contentSource = null;
    if (panel) {
      contentSource = panel.querySelector('.cmp-contentfragment__elements, .cmp-contentfragment, .contentfragment') || panel;
    }
    const contentNodes = contentSource
      ? Array.from(contentSource.childNodes)
      : [];

    // Row: [label cell, content cell]. Pad the content cell if a tab has no
    // matching panel so every row keeps 2 columns.
    cells.push([label, contentNodes.length ? contentNodes : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs', cells });
  element.replaceWith(block);
}
