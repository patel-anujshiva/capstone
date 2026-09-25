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

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/carousel.js
  function parse(element, { document: document2 }) {
    let items = Array.from(
      element.querySelectorAll(":scope .cmp-carousel__content > .cmp-carousel__item")
    );
    if (!items.length) {
      items = Array.from(element.querySelectorAll(".cmp-carousel__item"));
    }
    if (!items.length) {
      items = Array.from(element.querySelectorAll(":scope .cmp-carousel__content > *"));
    }
    const text = (el) => el ? el.textContent.replace(/\s+/g, " ").trim() : "";
    const slides = [];
    items.forEach((item) => {
      const image = item.querySelector(
        ".cmp-teaser__image img, .cmp-image img, img.cmp-image__image, img"
      );
      const content = [];
      const title = item.querySelector(".cmp-teaser__title, .cmp-title__text");
      if (title && text(title)) {
        const h2 = document2.createElement("h2");
        h2.textContent = text(title);
        content.push(h2);
      }
      const desc = item.querySelector(".cmp-teaser__description");
      if (desc && text(desc)) {
        const paras = Array.from(desc.querySelectorAll("p")).filter((p) => text(p));
        if (paras.length) {
          content.push(...paras);
        } else {
          const p = document2.createElement("p");
          p.innerHTML = desc.innerHTML.trim();
          content.push(p);
        }
      }
      const ctas = Array.from(item.querySelectorAll("a.cmp-teaser__action-link"));
      ctas.forEach((link) => {
        if (!text(link)) return;
        const a = document2.createElement("a");
        a.href = link.getAttribute("href") || "";
        a.textContent = text(link);
        const p = document2.createElement("p");
        p.append(a);
        content.push(p);
      });
      if (image || content.length) slides.push({ image, content });
    });
    if (!slides.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const hasContent = slides.some((s) => s.content.length);
    const cells = slides.map(({ image, content }) => hasContent ? [image || "", content.length ? content : ""] : [image]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-featured-light.js
  function parse2(element, { document: document2 }) {
    const content = element.querySelector(".cmp-teaser__content") || element;
    const imageWrap = element.querySelector(".cmp-teaser__image") || element;
    const eyebrow = element.querySelector('.cmp-teaser__pretitle, [class*="pretitle"]');
    const title = element.querySelector(".cmp-teaser__title") || content.querySelector('h1, h2, h3, [class*="title"]');
    const description = element.querySelector('.cmp-teaser__description, [class*="description"]');
    const cta = element.querySelector(".cmp-teaser__action-link, .cmp-teaser__action-container a") || content.querySelector("a[href]");
    const image = imageWrap.querySelector("picture, img.cmp-image__image, img") || element.querySelector(".cmp-teaser__image img, picture, img");
    if (!title && !description && !image) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const contentCell = [];
    if (eyebrow) contentCell.push(eyebrow);
    if (title) contentCell.push(title);
    if (description) contentCell.push(description);
    if (cta) contentCell.push(cta);
    const cells = [];
    cells.push([contentCell.length ? contentCell : "", image || ""]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-featured-light", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero.js
  function parse3(element, { document: document2 }) {
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

  // tools/importer/parsers/cards.js
  function parse4(element, { document: document2 }) {
    const items = Array.from(element.querySelectorAll(":scope > .cmp-image-list__item, .cmp-image-list__item")).filter((el, i, arr) => arr.indexOf(el) === i);
    const cells = [];
    items.forEach((item) => {
      const image = item.querySelector(".cmp-image-list__item-image img, .cmp-image-list__item-image-link img, img");
      const titleLink = item.querySelector(".cmp-image-list__item-title-link");
      const titleText = item.querySelector(".cmp-image-list__item-title");
      const description = item.querySelector('.cmp-image-list__item-description, [class*="description"]');
      const bodyCell = [];
      if (titleLink || titleText) {
        const heading = document2.createElement("h3");
        const label = (titleText ? titleText.textContent : titleLink.textContent).trim();
        const href = titleLink ? titleLink.getAttribute("href") : null;
        if (href) {
          const a = document2.createElement("a");
          a.setAttribute("href", href);
          a.textContent = label;
          heading.append(a);
        } else {
          heading.textContent = label;
        }
        bodyCell.push(heading);
      }
      if (description) {
        const p = document2.createElement("p");
        p.textContent = description.textContent.trim();
        bodyCell.push(p);
      }
      if (!image && bodyCell.length === 0) return;
      cells.push([image || "", bodyCell.length ? bodyCell : ""]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards", cells });
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

  // tools/importer/import-homepage.js
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "Locale landing page: full-width carousel/hero at top followed by stacked hero teasers and a cards grid",
    urls: [
      "https://wknd.site/ca/en.html"
    ],
    blocks: [
      { name: "carousel", instances: [".cmp-carousel"] },
      { name: "hero-featured-light", instances: [".cmp-teaser--featured"] },
      { name: "hero", instances: [".cmp-teaser--hero"] },
      { name: "cards", instances: [".cmp-image-list"] }
    ],
    sections: [
      {
        id: "rc1",
        name: "hero-carousel",
        selector: [".cmp-carousel", "main .container:first-of-type"],
        style: null,
        blocks: ["carousel"],
        defaultContent: []
      },
      {
        id: "rc2",
        name: "body",
        selector: ["main.cmp-layout-container--fixed", ".cmp-container > .aem-Grid"],
        style: null,
        blocks: ["hero-featured-light", "hero", "cards"],
        defaultContent: [".title"]
      }
    ]
  };
  var parsers = {
    carousel: parse,
    "hero-featured-light": parse2,
    hero: parse3,
    cards: parse4
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
          if (pageBlocks.some((b) => b.element === element || b.element.contains(element) || element.contains(b.element))) return;
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
  var import_homepage_default = {
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
  return __toCommonJS(import_homepage_exports);
})();
