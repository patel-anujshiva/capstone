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

  // tools/importer/import-magazine-article.js
  var import_magazine_article_exports = {};
  __export(import_magazine_article_exports, {
    default: () => import_magazine_article_default
  });

  // tools/importer/parsers/breadcrumbs.js
  function parse(element, { document: document2 }) {
    const items = [...element.querySelectorAll("li.cmp-breadcrumb__item")];
    const crumbs = items.map((li) => {
      const link = li.querySelector("a.cmp-breadcrumb__item-link, a");
      const text = (link || li).textContent.replace(/\s+/g, " ").trim();
      if (!text) return null;
      const isActive = li.classList.contains("cmp-breadcrumb__item--active");
      if (link && !isActive) {
        const a = document2.createElement("a");
        a.href = link.getAttribute("href") || "#";
        a.textContent = text;
        return a;
      }
      const span = document2.createElement("span");
      span.textContent = text;
      return span;
    }).filter(Boolean);
    if (!crumbs.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [crumbs];
    const block = WebImporter.Blocks.createBlock(document2, { name: "breadcrumbs", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/quote.js
  function parse2(element, { document: document2 }) {
    const blockquote = element.matches("blockquote") ? element : element.querySelector("blockquote");
    const quoteText = (blockquote || element).textContent.replace(/\s+/g, " ").trim();
    if (!quoteText) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    const quoteP = document2.createElement("p");
    quoteP.textContent = quoteText;
    const quoteCell = [quoteP];
    const cite = (blockquote || element).querySelector("cite, footer");
    const citeText = cite ? cite.textContent.replace(/\s+/g, " ").trim() : "";
    const img = element.querySelector("img");
    if (img) {
      cells.push([img]);
    }
    cells.push([quoteCell]);
    if (citeText) {
      const citeP = document2.createElement("p");
      citeP.textContent = citeText;
      cells.push([[citeP]]);
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "quote", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-profile.js
  function parse3(element, { document: document2 }) {
    const image = element.querySelector(".cmp-image img, img.cmp-image__image, img");
    const name = element.querySelector(
      "h1.cmp-title__text, h2.cmp-title__text, h3.cmp-title__text, h4.cmp-title__text, .cmp-byline__name"
    ) || element.querySelector("h2, h3");
    let role = element.querySelector("h5.cmp-title__text, h6.cmp-title__text, .cmp-byline__occupations");
    if (!role) {
      role = Array.from(element.querySelectorAll(".cmp-title__text, h5")).find((el) => el !== name) || null;
    }
    const socialLinks = Array.from(element.querySelectorAll("a.cmp-button, .cmp-buildingblock--btn-list a, a[href]")).filter((el, i, arr) => arr.indexOf(el) === i);
    if (!image && !name && !role && socialLinks.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const socialParagraphs = socialLinks.map((link) => {
      const p = document2.createElement("p");
      p.append(link);
      return p;
    });
    const contentCell = [];
    if (name) contentCell.push(name);
    if (role && role !== name) contentCell.push(role);
    contentCell.push(...socialParagraphs);
    const cells = [];
    cells.push([image || "", contentCell]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-profile", cells });
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

  // tools/importer/import-magazine-article.js
  var PAGE_TEMPLATE = {
    name: "magazine-article",
    description: "Long-form article layout with hero, breadcrumbs, pull quotes, and stacked text/image body sections",
    urls: [
      "https://wknd.site/ca/en/magazine/arctic-surfing.html"
    ],
    blocks: [
      { name: "breadcrumbs", instances: [".cmp-breadcrumb"] },
      { name: "quote", instances: [".text blockquote", "blockquote"] },
      {
        name: "cards-profile",
        instances: [
          ".cmp-experiencefragment--jacob-wester",
          '.experiencefragment [class*="cmp-experiencefragment--"]:not(.cmp-experiencefragment--header):not(.cmp-experiencefragment--footer)'
        ]
      }
    ],
    sections: [
      {
        id: "rc1",
        name: "hero",
        selector: [".cmp-image", "main .image:first-of-type"],
        style: null,
        blocks: [],
        defaultContent: [".cmp-image"]
      },
      {
        id: "rc2",
        name: "article-body",
        selector: ["main.cmp-layout-container--fixed", ".cmp-container > .aem-Grid"],
        style: null,
        blocks: ["breadcrumbs", "quote"],
        defaultContent: [".title", ".text"]
      },
      {
        id: "rc3",
        name: "author-bio",
        selector: [".experiencefragment", ".cmp-experiencefragment--jacob-wester"],
        style: null,
        blocks: ["cards-profile"],
        defaultContent: []
      }
    ]
  };
  var parsers = {
    breadcrumbs: parse,
    quote: parse2,
    "cards-profile": parse3
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
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
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
  var import_magazine_article_default = {
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
        } else {
          console.warn(`No parser found for block: ${block.name}`);
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
  return __toCommonJS(import_magazine_article_exports);
})();
