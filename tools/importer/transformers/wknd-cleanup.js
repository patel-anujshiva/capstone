/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND site-wide cleanup.
 *
 * Removes non-authorable site chrome from the AEM Sites / Core Components
 * markup so the import contains only page-level authorable content.
 * All selectors verified against migration-work/cleaned.html.
 *
 * Non-authorable elements removed (all auto-blocked or global chrome in EDS):
 *  - <header class="experiencefragment cmp-experiencefragment--header">  (line 5)
 *      contains sign-in-buttons, .languagenavigation, .cmp-navigation--header, .cmp-search--header
 *  - <footer class="experiencefragment cmp-experiencefragment--footer">  (line 575)
 *  - <iframe id="destination_publishing_iframe_wkndsite_0">              (line 676) Adobe ID-sync tracking iframe
 *  - #toggleNav                                                          (line 678) mobile nav toggle
 *  - #mobileNav                                                          (line 684) mobile navigation drawer
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Tracking iframe can block/confuse parsing; remove early. (line 676 in cleaned.html)
    WebImporter.DOMUtils.remove(element, [
      '#destination_publishing_iframe_wkndsite_0',
      'iframe',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable site chrome (header/footer are auto-blocked in EDS; utility/mobile nav is global).
    WebImporter.DOMUtils.remove(element, [
      'header.cmp-experiencefragment--header',
      'footer.cmp-experiencefragment--footer',
      '#toggleNav',
      '#mobileNav',
      'noscript',
    ]);

    // Strip AEM data-layer / accessibility tracking attributes left on authorable nodes.
    element.querySelectorAll('[data-cmp-data-layer], [data-cmp-hook-image]').forEach((el) => {
      el.removeAttribute('data-cmp-data-layer');
      el.removeAttribute('data-cmp-hook-image');
    });
  }
}
