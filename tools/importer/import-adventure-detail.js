/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import breadcrumbsParser from './parsers/breadcrumbs.js';
import carouselParser from './parsers/carousel.js';
import tabsParser from './parsers/tabs.js';

// TRANSFORMER IMPORTS
import wkndCleanupTransformer from './transformers/wknd-cleanup.js';
import wkndSectionsTransformer from './transformers/wknd-sections.js';

const PAGE_TEMPLATE = {
  name: 'adventure-detail',
  description: 'Detail page with breadcrumbs, an image carousel, and a tabbed information panel',
  urls: [
    'https://wknd.site/ca/en/adventures/bali-surf-camp.html',
  ],
  blocks: [
    { name: 'breadcrumbs', instances: ['.cmp-breadcrumb'] },
    { name: 'carousel', instances: ['.cmp-carousel'] },
    { name: 'tabs', instances: ['.cmp-tabs'] },
  ],
  sections: [
    {
      id: 'rc1', name: 'top', selector: ['main.cmp-layout-container--fixed', '.cmp-container > .aem-Grid'], style: null, blocks: ['breadcrumbs', 'carousel'], defaultContent: ['.title'],
    },
    {
      id: 'rc2', name: 'detail-body', selector: ['.cmp-tabs', 'main .container:last-of-type'], style: null, blocks: ['tabs'], defaultContent: [],
    },
  ],
};

const parsers = {
  breadcrumbs: breadcrumbsParser,
  carousel: carouselParser,
  tabs: tabsParser,
};

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
      document.querySelectorAll(selector).forEach((element) => {
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
