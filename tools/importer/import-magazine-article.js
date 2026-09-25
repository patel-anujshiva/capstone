/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import breadcrumbsParser from './parsers/breadcrumbs.js';
import quoteParser from './parsers/quote.js';
import cardsProfileParser from './parsers/cards-profile.js';

// TRANSFORMER IMPORTS
import wkndCleanupTransformer from './transformers/wknd-cleanup.js';
import wkndSectionsTransformer from './transformers/wknd-sections.js';

// PAGE TEMPLATE CONFIGURATION - embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'magazine-article',
  description: 'Long-form article layout with hero, breadcrumbs, pull quotes, and stacked text/image body sections',
  urls: [
    'https://wknd.site/ca/en/magazine/arctic-surfing.html',
  ],
  blocks: [
    { name: 'breadcrumbs', instances: ['.cmp-breadcrumb'] },
    { name: 'quote', instances: ['.text blockquote', 'blockquote'] },
    {
      name: 'cards-profile',
      instances: [
        '.cmp-experiencefragment--jacob-wester',
        '.experiencefragment [class*="cmp-experiencefragment--"]:not(.cmp-experiencefragment--header):not(.cmp-experiencefragment--footer)',
      ],
    },
  ],
  sections: [
    {
      id: 'rc1', name: 'hero', selector: ['.cmp-image', 'main .image:first-of-type'], style: null, blocks: [], defaultContent: ['.cmp-image'],
    },
    {
      id: 'rc2', name: 'article-body', selector: ['main.cmp-layout-container--fixed', '.cmp-container > .aem-Grid'], style: null, blocks: ['breadcrumbs', 'quote'], defaultContent: ['.title', '.text'],
    },
    {
      id: 'rc3', name: 'author-bio', selector: ['.experiencefragment', '.cmp-experiencefragment--jacob-wester'], style: null, blocks: ['cards-profile'], defaultContent: [],
    },
  ],
};

// PARSER REGISTRY
const parsers = {
  breadcrumbs: breadcrumbsParser,
  quote: quoteParser,
  'cards-profile': cardsProfileParser,
};

// TRANSFORMER REGISTRY — section transformer runs when template has 2+ sections
const transformers = [
  wkndCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [wkndSectionsTransformer] : []),
];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        // avoid double-matching the same element via multiple fallback selectors
        if (pageBlocks.some((b) => b.element === element)) return;
        pageBlocks.push({
          name: blockDef.name, selector, element, section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    executeTransformers('afterTransform', main, payload);

    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
