/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-category-listing.js
  var import_category_listing_exports = {};
  __export(import_category_listing_exports, {
    default: () => import_category_listing_default
  });

  // tools/importer/parsers/hero.js
  function parse(element, { document: document2 }) {
    const image = element.querySelector(
      ".cmp-teaser__image img, .cmp-image img, img.cmp-image__image, img"
    );
    const heading = element.querySelector(
      '.cmp-teaser__title, h1, h2, [class*="teaser__title"]'
    );
    const description = element.querySelector(
      '.cmp-teaser__description, [class*="teaser__description"]'
    );
    const ctaLinks = Array.from(
      element.querySelectorAll(".cmp-teaser__action-link, .cmp-teaser__action-container a")
    );
    if (!image && !heading && !description) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (image) {
      cells.push([image]);
    }
    const contentCell = [];
    if (heading) contentCell.push(heading);
    if (description) contentCell.push(description);
    contentCell.push(...ctaLinks);
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-minimal-dark-withimg.js
  function parse2(element, { document: document2 }) {
    const tabLabels = Array.from(
      element.querySelectorAll(":scope > .cmp-tabs__tablist > li.cmp-tabs__tab, .cmp-tabs__tablist .cmp-tabs__tab")
    ).map((li) => li.textContent.trim());
    const panels = Array.from(
      element.querySelectorAll(":scope > .cmp-tabs__tabpanel, .cmp-tabs__tabpanel")
    );
    const cardSelector = "article.cmp-image-list__item-content, .cmp-image-list__item-content";
    let allPanel = element.querySelector(":scope > .cmp-tabs__tabpanel--active, .cmp-tabs__tabpanel--active");
    if (!allPanel || !allPanel.querySelector(cardSelector)) {
      const allIdx = tabLabels.findIndex((l) => /^all$/i.test(l));
      if (allIdx >= 0 && panels[allIdx] && panels[allIdx].querySelector(cardSelector)) {
        allPanel = panels[allIdx];
      }
    }
    if (!allPanel || !allPanel.querySelector(cardSelector)) {
      allPanel = panels.find((p) => p.querySelector(cardSelector)) || element;
    }
    const categoryByHref = /* @__PURE__ */ new Map();
    panels.forEach((panel, i) => {
      const label = tabLabels[i] || "";
      if (!label || /^all$/i.test(label)) return;
      panel.querySelectorAll(cardSelector).forEach((card) => {
        const link = card.querySelector("a.cmp-image-list__item-title-link, a.cmp-image-list__item-image-link, a[href]");
        const href = link && link.getAttribute("href");
        if (!href) return;
        const labels = categoryByHref.get(href) || [];
        if (!labels.includes(label)) labels.push(label);
        categoryByHref.set(href, labels);
      });
    });
    const cards = Array.from(allPanel.querySelectorAll(cardSelector));
    if (!cards.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    cards.forEach((card) => {
      const image = card.querySelector(".cmp-image-list__item-image img, .cmp-image img, img");
      const titleLink = card.querySelector("a.cmp-image-list__item-title-link, a.cmp-image-list__item-image-link");
      const titleText = card.querySelector(".cmp-image-list__item-title");
      const description = card.querySelector(".cmp-image-list__item-description");
      const contentCell = [];
      const href = titleLink && titleLink.getAttribute("href");
      const categories = href && categoryByHref.get(href) || [];
      if (categories.length) {
        const eyebrow = document2.createElement("p");
        const strong = document2.createElement("strong");
        strong.textContent = categories.join(", ");
        eyebrow.append(strong);
        contentCell.push(eyebrow);
      }
      if (titleText || titleLink) {
        const h = document2.createElement("h3");
        if (href) {
          const a = document2.createElement("a");
          a.setAttribute("href", href);
          a.textContent = (titleText || titleLink).textContent.trim();
          h.append(a);
        } else {
          h.textContent = (titleText || titleLink).textContent.trim();
        }
        contentCell.push(h);
      }
      if (description) {
        const p = document2.createElement("p");
        p.textContent = description.textContent.trim();
        contentCell.push(p);
      }
      cells.push([image || "", contentCell]);
    });
    const block = WebImporter.Blocks.createBlock(document2, {
      name: "tabs-minimal-dark-withimg",
      cells
    });
    element.replaceWith(block);
  }

  // tools/importer/transformers/wknd-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#destination_publishing_iframe_wkndsite_0",
        "iframe"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header.cmp-experiencefragment--header",
        "footer.cmp-experiencefragment--footer",
        "#toggleNav",
        "#mobileNav",
        "noscript"
      ]);
      element.querySelectorAll("[data-cmp-data-layer], [data-cmp-hook-image]").forEach((el) => {
        el.removeAttribute("data-cmp-data-layer");
        el.removeAttribute("data-cmp-hook-image");
      });
    }
  }

  // tools/importer/transformers/wknd-sections.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function querySection(root, selectors) {
    for (const sel of selectors) {
      const matches = root.querySelectorAll(sel);
      for (const el of matches) {
        if (el.closest("header, footer")) continue;
        return el;
      }
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections || [];
    if (hookName === TransformHook2.beforeTransform) {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = querySection(element, section.selector);
        if (!sectionEl) continue;
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === TransformHook2.afterTransform) {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || querySection(element, section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-category-listing.js
  var PAGE_TEMPLATE = {
    name: "category-listing",
    description: "Category landing page with a hero followed by a tabbed listing of items",
    urls: [
      "https://wknd.site/ca/en/adventures.html"
    ],
    blocks: [
      { name: "hero", instances: [".cmp-teaser"] },
      { name: "tabs-minimal-dark-withimg", instances: [".cmp-tabs"] }
    ],
    sections: [
      {
        id: "rc1",
        name: "header",
        selector: ["main.cmp-layout-container--fixed", ".cmp-container > .aem-Grid"],
        style: null,
        blocks: ["hero"],
        defaultContent: [".title"]
      },
      {
        id: "rc2",
        name: "listing",
        selector: [".cmp-tabs", "main .container:last-of-type"],
        style: null,
        blocks: ["tabs-minimal-dark-withimg"],
        defaultContent: []
      }
    ]
  };
  var parsers = {
    hero: parse,
    "tabs-minimal-dark-withimg": parse2
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        document2.querySelectorAll(selector).forEach((element) => {
          if (pageBlocks.some((b) => b.element === element)) return;
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_category_listing_default = {
    transform: (payload) => {
      const {
        document: document2,
        url,
        html,
        params
      } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_category_listing_exports);
})();
