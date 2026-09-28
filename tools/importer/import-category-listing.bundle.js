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
    const block2 = WebImporter.Blocks.createBlock(document2, { name: "hero", cells });
    element.replaceWith(block2);
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
    const block2 = WebImporter.Blocks.createBlock(document2, {
      name: "tabs-minimal-dark-withimg",
      cells
    });
    element.replaceWith(block2);
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

  // tools/importer/transformers/wknd-metadata.js
  var TransformHook2 = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform",
    afterMetadata: "afterMetadata"
  };
  var pageMeta = null;
  function readDataLayerPage(document2) {
    const win = document2.defaultView || (typeof window !== "undefined" ? window : null);
    const layer = win && Array.isArray(win.adobeDataLayer) ? win.adobeDataLayer : [];
    const fromLayer = layer.map((entry) => entry && entry.page).filter(Boolean).map((page) => Object.values(page)[0]).find((page) => page && /\/page$/.test(page["@type"] || ""));
    if (fromLayer) return fromLayer;
    const script = [...document2.querySelectorAll("script")].map((s) => s.textContent).find((t) => t.includes("xdm:template"));
    if (!script) return null;
    const m = script.match(new RegExp('page:\\s*JSON\\.parse\\("(.*?)"\\)', "s"));
    if (!m) return null;
    try {
      const decoded = m[1].replace(/\\x([0-9a-f]{2})/gi, (all, hex) => String.fromCharCode(parseInt(hex, 16))).replace(/\\u([0-9a-f]{4})/gi, (all, hex) => String.fromCharCode(parseInt(hex, 16))).replace(/\\\//g, "/");
      return Object.values(JSON.parse(decoded))[0] || null;
    } catch (e) {
      return null;
    }
  }
  function readPageMeta(document2) {
    const page = readDataLayerPage(document2) || {};
    const templateMeta = document2.querySelector('meta[name="template"]');
    const template = (templateMeta && templateMeta.content || (page["xdm:template"] || "").split("/").pop() || "").trim().replace(/-page-template$/, "");
    let tags = Array.isArray(page["xdm:tags"]) ? page["xdm:tags"] : [];
    if (!tags.length) {
      const keywords = document2.querySelector('meta[name="keywords"]');
      tags = keywords && keywords.content ? keywords.content.split(",") : [];
    }
    tags = tags.map((t) => t.trim()).filter(Boolean);
    const date = (page["repo:modifyDate"] || "").trim();
    return { template, tags, date };
  }
  function appendPageMetadata(main, document2) {
    const meta = pageMeta || readPageMeta(document2);
    const table = [...main.querySelectorAll("table")].reverse().find((t) => {
      var _a;
      return ((_a = (t.querySelector("tr > *") || {}).textContent) == null ? void 0 : _a.trim().toLowerCase()) === "metadata";
    });
    if (!table) return;
    const body = table.querySelector("tbody") || table;
    const rows = [
      ["Template", meta.template],
      ["Tags", meta.tags.join(", ")],
      ["Date", meta.date]
    ];
    rows.forEach(([key, value]) => {
      if (!value) return;
      const tr = document2.createElement("tr");
      const k = document2.createElement("td");
      k.textContent = key;
      const v = document2.createElement("td");
      v.textContent = value;
      tr.append(k, v);
      body.append(tr);
    });
  }
  function transform2(hookName, element, payload) {
    if (hookName === TransformHook2.beforeTransform) {
      pageMeta = readPageMeta(payload.document);
    }
    if (hookName === TransformHook2.afterMetadata) {
      appendPageMetadata(element, payload.document);
    }
  }

  // tools/importer/transformers/wknd-dynamic-lists.js
  var TransformHook3 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  var pageCache = {};
  function toPath(href, document2) {
    try {
      return new URL(href, document2.location.href).pathname.replace(/\.html$/, "");
    } catch (e) {
      return "";
    }
  }
  function readSourcePage(path) {
    if (pageCache[path]) return pageCache[path];
    const info = { template: "", tags: [] };
    try {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", `${path}.html`, false);
      xhr.send();
      if (xhr.status === 200) {
        const doc = new DOMParser().parseFromString(xhr.responseText, "text/html");
        const template = doc.querySelector('meta[name="template"]');
        const keywords = doc.querySelector('meta[name="keywords"]');
        info.template = (template && template.content || "").trim().replace(/-page-template$/, "");
        info.tags = (keywords && keywords.content || "").split(",").map((t) => t.trim()).filter(Boolean);
      }
    } catch (e) {
    }
    pageCache[path] = info;
    return info;
  }
  function commonFolder(paths) {
    const parents = paths.map((p) => p.slice(0, p.lastIndexOf("/") + 1));
    if (!parents.length || parents.some((p) => p !== parents[0])) return "";
    return parents[0];
  }
  function inferSort(titles) {
    const cmp = (a, b) => a.localeCompare(b);
    const asc = titles.every((t, i) => i === 0 || cmp(titles[i - 1], t) <= 0);
    if (asc) return "title";
    const desc = titles.every((t, i) => i === 0 || cmp(titles[i - 1], t) >= 0);
    return desc ? "title desc" : "date desc";
  }
  function featuredPaths(document2, folder) {
    return [...document2.querySelectorAll(".cmp-teaser--featured a[href]")].map((a) => toPath(a.getAttribute("href"), document2)).filter((p, i, all) => p.startsWith(folder) && all.indexOf(p) === i);
  }
  function inferSettings(document2, items, { exclude = true } = {}) {
    const paths = items.map((i) => i.path).filter(Boolean);
    const folder = commonFolder(paths);
    if (!folder) return null;
    const template = readSourcePage(paths[0]).template;
    const sort = inferSort(items.map((i) => i.title));
    const here = toPath(document2.location.href, document2);
    const isFolderPage = `${here}/` === folder;
    const settings = [["Folder", folder]];
    if (template) settings.push(["Template", template]);
    settings.push(["Sort", sort]);
    if (!isFolderPage) settings.push(["Limit", `${items.length}`]);
    if (exclude && !isFolderPage && sort === "date desc") {
      const featured = featuredPaths(document2, folder).filter((p) => !paths.includes(p));
      if (featured.length) settings.push(["Exclude", featured.join(", ")]);
    }
    return settings;
  }
  function block(document2, name, settings) {
    return WebImporter.Blocks.createBlock(document2, { name, cells: settings });
  }
  function imageListItems(list, document2) {
    return [...list.querySelectorAll(".cmp-image-list__item")].map((item) => {
      const link = item.querySelector("a[href]");
      const title = item.querySelector(".cmp-image-list__item-title");
      return {
        path: link ? toPath(link.getAttribute("href"), document2) : "",
        title: (title || link || item).textContent.trim()
      };
    });
  }
  function inferFilters(tabs, allPaths) {
    const tagsOf = (p) => readSourcePage(p).tags;
    return tabs.map(({ label, paths }) => {
      const inside = new Set(paths);
      const outside = allPaths.filter((p) => !inside.has(p));
      const exclusive = (tag) => !outside.some((p) => tagsOf(p).includes(tag));
      if (paths.every((p) => tagsOf(p).includes(label)) && exclusive(label)) return label;
      const candidates = [...new Set(paths.flatMap(tagsOf))].filter(exclusive);
      const chosen = [];
      let uncovered = paths.filter(() => true);
      while (uncovered.length) {
        const best = candidates.map((tag) => ({ tag, hits: uncovered.filter((p) => tagsOf(p).includes(tag)).length })).sort((a, b) => b.hits - a.hits || a.tag.localeCompare(b.tag))[0];
        if (!best || !best.hits) break;
        chosen.push(best.tag);
        uncovered = uncovered.filter((p) => !tagsOf(p).includes(best.tag));
      }
      return chosen.length ? `${label} = ${chosen.join(", ")}` : label;
    });
  }
  function convertTabs(document2) {
    document2.querySelectorAll(".cmp-tabs").forEach((tabsEl) => {
      const labels = [...tabsEl.querySelectorAll(".cmp-tabs__tab")].map((t) => t.textContent.trim());
      const panels = [...tabsEl.querySelectorAll(".cmp-tabs__tabpanel")];
      if (!panels.length || !panels[0].querySelector(".cmp-image-list")) return;
      const all = imageListItems(panels[0], document2);
      const settings = inferSettings(document2, all, { exclude: false });
      if (!settings) return;
      const allPaths = all.map((i) => i.path);
      const tabs = panels.slice(1).map((panel, i) => ({
        label: labels[i + 1],
        paths: imageListItems(panel, document2).map((it) => it.path)
      })).filter((t) => t.label);
      const filters = inferFilters(tabs, allPaths);
      if (filters.length) {
        const cell = document2.createElement("div");
        filters.forEach((f) => {
          const p = document2.createElement("p");
          p.textContent = f;
          cell.append(p);
        });
        settings.push(["Filters", cell]);
      }
      tabsEl.replaceWith(block(document2, "tabs-minimal-dark-withimg", settings));
    });
  }
  function convertImageLists(document2) {
    document2.querySelectorAll(".cmp-image-list").forEach((list) => {
      if (list.closest(".cmp-tabs")) return;
      const settings = inferSettings(document2, imageListItems(list, document2));
      if (settings) list.replaceWith(block(document2, "Cards", settings));
    });
  }
  function convertUpNext(document2) {
    document2.querySelectorAll(".cmp-list--upnext").forEach((list) => {
      const items = [...list.querySelectorAll(".cmp-list__item")].map((item) => {
        const link = item.querySelector("a[href]");
        const title = item.querySelector(".cmp-list__item-title");
        return {
          path: link ? toPath(link.getAttribute("href"), document2) : "",
          title: (title || link || item).textContent.trim()
        };
      });
      const settings = inferSettings(document2, items);
      if (!settings) return;
      const sidebar = list.closest(".cmp-layoutcontainer--sidebar");
      const body = sidebar && sidebar.previousElementSibling;
      const listBlock = block(document2, "Page List", settings);
      const author = body && body.querySelector(".experiencefragment");
      if (author) {
        author.before(listBlock);
        list.remove();
      } else if (body) {
        body.append(listBlock);
        list.remove();
      } else {
        list.replaceWith(listBlock);
      }
    });
  }
  function convertNextAdventure(document2) {
    document2.querySelectorAll(".cmp-teaser--hero").forEach((teaser) => {
      if (teaser.closest(".cmp-carousel")) return;
      const action = teaser.querySelector(".cmp-teaser__action-link, a[href]");
      const path = action ? toPath(action.getAttribute("href"), document2) : "";
      const folder = path.slice(0, path.lastIndexOf("/") + 1);
      if (!/\/adventures\/$/.test(folder)) return;
      const settings = [["Folder", folder]];
      const template = readSourcePage(path).template;
      if (template) settings.push(["Template", template]);
      settings.push(["Sort", "date desc"], ["Limit", "1"], ["Link Text", action.textContent.trim()]);
      teaser.replaceWith(block(document2, "Hero", settings));
    });
  }
  function transform3(hookName, element, payload) {
    if (hookName === TransformHook3.beforeTransform) {
      const { document: document2 } = payload;
      const templateName = payload.template && payload.template.name;
      convertTabs(document2);
      convertImageLists(document2);
      convertUpNext(document2);
      if (templateName === "homepage") convertNextAdventure(document2);
    }
  }

  // tools/importer/transformers/wknd-sections.js
  var TransformHook4 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
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
  function transform4(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections || [];
    if (hookName === TransformHook4.beforeTransform) {
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
    if (hookName === TransformHook4.afterTransform) {
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
    transform2,
    transform3,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform4] : []
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
      pageBlocks.forEach((block2) => {
        if (!block2.element.parentNode) return;
        const parser = parsers[block2.name];
        if (parser) {
          try {
            parser(block2.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block2.name} (${block2.selector}):`, e);
          }
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      executeTransformers("afterMetadata", main, payload);
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
