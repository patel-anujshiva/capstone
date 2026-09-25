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

  // tools/importer/import-content-landing.js
  var import_content_landing_exports = {};
  __export(import_content_landing_exports, {
    default: () => import_content_landing_default
  });

  // tools/importer/parsers/cards-profile.js
  function parse(element, { document }) {
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
      const p = document.createElement("p");
      p.append(link);
      return p;
    });
    const contentCell = [];
    if (name) contentCell.push(name);
    if (role && role !== name) contentCell.push(role);
    contentCell.push(...socialParagraphs);
    const cells = [];
    cells.push([image || "", contentCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-profile", cells });
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

  // tools/importer/import-content-landing.js
  var PAGE_TEMPLATE = {
    name: "content-landing",
    description: "General content landing page with multiple stacked hero/teaser bands and supporting content sections",
    urls: [
      "https://wknd.site/ca/en/about-us.html"
    ],
    blocks: [
      {
        name: "cards-profile",
        instances: [".cmp-experience-fragment--contributor"]
      }
    ],
    sections: [
      {
        id: "rc1",
        name: "main-content",
        selector: ["main.cmp-layout-container--fixed", ".cmp-container > .aem-Grid"],
        style: null,
        blocks: ["cards-profile"],
        defaultContent: [".title", ".text.cmp-text--font-small"]
      }
    ]
  };
  var parsers = {
    "cards-profile": parse
  };
  var transformers = [
    transform
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
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
  var import_content_landing_default = {
    transform: (payload) => {
      const {
        document,
        url,
        html,
        params
      } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_content_landing_exports);
})();
