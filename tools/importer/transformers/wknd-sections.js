/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND section breaks (magazine-article + any WKND template with 2+ sections).
 *
 * Reads payload.template.sections[] and inserts a bare <hr> before every
 * non-first section so the EDS import splits the page into the analyzed
 * sections. All WKND template sections currently have style === null, so no
 * Section Metadata blocks are emitted; the afterTransform metadata pass below
 * is retained per the reference implementation and will create a
 * "Section Metadata" block for any section that gains a style later.
 *
 * Selectors come straight from tools/importer/page-templates.json sections[]
 * and were verified against migration-work/cleaned.html:
 *  - rc2 article-body: "main.cmp-layout-container--fixed"  -> <main> line 162 (unique)
 *  - rc3 author-bio:   ".experiencefragment"               -> <div class="experiencefragment"> line 271
 *
 * IMPORTANT (verified in cleaned.html): the site header (line 5,
 * <header class="experiencefragment cmp-experiencefragment--header">) and
 * footer (line 378) both carry the generic `experiencefragment` class, so a
 * plain first-match on ".experiencefragment" would resolve to the header.
 * The header/footer are still present during beforeTransform (the cleanup
 * transformer only strips them in afterTransform), so querySection() below
 * skips any match that is, or lives inside, <header>/<footer> chrome. This
 * uses only the selectors already provided in sections[] — no new selectors.
 *
 * Break insertion runs in beforeTransform (while every section element still
 * exists, before block parsers replaceWith() them); metadata insertion runs in
 * afterTransform anchored to a marker <hr>. Sections are walked in reverse so
 * live-element inserts never disturb not-yet-processed sections.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };
const SECTION_MARKER_ATTR = 'data-excat-section-id';

// section.selector is an array of candidate selectors — try each in order, first
// match that is not site chrome (header/footer) wins.
function querySection(root, selectors) {
  for (const sel of selectors) {
    const matches = root.querySelectorAll(sel);
    for (const el of matches) {
      // Skip header/footer chrome that shares generic classes (e.g. `.experiencefragment`).
      if (el.closest('header, footer')) continue;
      return el;
    }
  }
  return null;
}

export default function transform(hookName, element, payload) {
  const sections = (payload && payload.template && payload.template.sections) || [];

  if (hookName === TransformHook.beforeTransform) {
    // Insert breaks now, before parsers can replace any section element.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (i === 0 && !section.style) continue; // first section: no leading break, no metadata
      const sectionEl = querySection(element, section.selector);
      if (!sectionEl) continue; // no selector matched on this page — skip, never guess a replacement

      const hr = document.createElement('hr');
      if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
      sectionEl.before(hr);
    }
  }

  if (hookName === TransformHook.afterTransform) {
    // Parsers have now run and may have replaced section elements. Anchor each
    // styled section's Section Metadata block to whichever still exists: the
    // marker <hr> placed above, or (first section, no marker inserted) the
    // original element itself. All current WKND sections have style === null,
    // so this loop is a no-op today but stays correct if a style is added.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;

      const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
      const anchor = marker || querySection(element, section.selector);
      if (!anchor) continue; // neither survived — no selector matched post-parse; skip

      const metadataBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      anchor.after(metadataBlock);

      if (marker) {
        marker.removeAttribute(SECTION_MARKER_ATTR);
        if (i === 0) marker.remove(); // section 0 never gets a real leading break
      }
    }
  }
}
