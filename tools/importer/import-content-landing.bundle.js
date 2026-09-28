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
    const block2 = WebImporter.Blocks.createBlock(document, { name: "cards-profile", cells });
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
  function readDataLayerPage(document) {
    const win = document.defaultView || (typeof window !== "undefined" ? window : null);
    const layer = win && Array.isArray(win.adobeDataLayer) ? win.adobeDataLayer : [];
    const fromLayer = layer.map((entry) => entry && entry.page).filter(Boolean).map((page) => Object.values(page)[0]).find((page) => page && /\/page$/.test(page["@type"] || ""));
    if (fromLayer) return fromLayer;
    const script = [...document.querySelectorAll("script")].map((s) => s.textContent).find((t) => t.includes("xdm:template"));
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
  function readPageMeta(document) {
    const page = readDataLayerPage(document) || {};
    const templateMeta = document.querySelector('meta[name="template"]');
    const template = (templateMeta && templateMeta.content || (page["xdm:template"] || "").split("/").pop() || "").trim().replace(/-page-template$/, "");
    let tags = Array.isArray(page["xdm:tags"]) ? page["xdm:tags"] : [];
    if (!tags.length) {
      const keywords = document.querySelector('meta[name="keywords"]');
      tags = keywords && keywords.content ? keywords.content.split(",") : [];
    }
    tags = tags.map((t) => t.trim()).filter(Boolean);
    const date = (page["repo:modifyDate"] || "").trim();
    return { template, tags, date };
  }
  function appendPageMetadata(main, document) {
    const meta = pageMeta || readPageMeta(document);
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
      const tr = document.createElement("tr");
      const k = document.createElement("td");
      k.textContent = key;
      const v = document.createElement("td");
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
  function toPath(href, document) {
    try {
      return new URL(href, document.location.href).pathname.replace(/\.html$/, "");
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
  function featuredPaths(document, folder) {
    return [...document.querySelectorAll(".cmp-teaser--featured a[href]")].map((a) => toPath(a.getAttribute("href"), document)).filter((p, i, all) => p.startsWith(folder) && all.indexOf(p) === i);
  }
  function inferSettings(document, items, { exclude = true } = {}) {
    const paths = items.map((i) => i.path).filter(Boolean);
    const folder = commonFolder(paths);
    if (!folder) return null;
    const template = readSourcePage(paths[0]).template;
    const sort = inferSort(items.map((i) => i.title));
    const here = toPath(document.location.href, document);
    const isFolderPage = `${here}/` === folder;
    const settings = [["Folder", folder]];
    if (template) settings.push(["Template", template]);
    settings.push(["Sort", sort]);
    if (!isFolderPage) settings.push(["Limit", `${items.length}`]);
    if (exclude && !isFolderPage && sort === "date desc") {
      const featured = featuredPaths(document, folder).filter((p) => !paths.includes(p));
      if (featured.length) settings.push(["Exclude", featured.join(", ")]);
    }
    return settings;
  }
  function block(document, name, settings) {
    return WebImporter.Blocks.createBlock(document, { name, cells: settings });
  }
  function imageListItems(list, document) {
    return [...list.querySelectorAll(".cmp-image-list__item")].map((item) => {
      const link = item.querySelector("a[href]");
      const title = item.querySelector(".cmp-image-list__item-title");
      return {
        path: link ? toPath(link.getAttribute("href"), document) : "",
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
  function convertTabs(document) {
    document.querySelectorAll(".cmp-tabs").forEach((tabsEl) => {
      const labels = [...tabsEl.querySelectorAll(".cmp-tabs__tab")].map((t) => t.textContent.trim());
      const panels = [...tabsEl.querySelectorAll(".cmp-tabs__tabpanel")];
      if (!panels.length || !panels[0].querySelector(".cmp-image-list")) return;
      const all = imageListItems(panels[0], document);
      const settings = inferSettings(document, all, { exclude: false });
      if (!settings) return;
      const allPaths = all.map((i) => i.path);
      const tabs = panels.slice(1).map((panel, i) => ({
        label: labels[i + 1],
        paths: imageListItems(panel, document).map((it) => it.path)
      })).filter((t) => t.label);
      const filters = inferFilters(tabs, allPaths);
      if (filters.length) {
        const cell = document.createElement("div");
        filters.forEach((f) => {
          const p = document.createElement("p");
          p.textContent = f;
          cell.append(p);
        });
        settings.push(["Filters", cell]);
      }
      tabsEl.replaceWith(block(document, "tabs-minimal-dark-withimg", settings));
    });
  }
  function convertImageLists(document) {
    document.querySelectorAll(".cmp-image-list").forEach((list) => {
      if (list.closest(".cmp-tabs")) return;
      const settings = inferSettings(document, imageListItems(list, document));
      if (settings) list.replaceWith(block(document, "Cards", settings));
    });
  }
  function convertUpNext(document) {
    document.querySelectorAll(".cmp-list--upnext").forEach((list) => {
      const items = [...list.querySelectorAll(".cmp-list__item")].map((item) => {
        const link = item.querySelector("a[href]");
        const title = item.querySelector(".cmp-list__item-title");
        return {
          path: link ? toPath(link.getAttribute("href"), document) : "",
          title: (title || link || item).textContent.trim()
        };
      });
      const settings = inferSettings(document, items);
      if (!settings) return;
      const sidebar = list.closest(".cmp-layoutcontainer--sidebar");
      const body = sidebar && sidebar.previousElementSibling;
      const listBlock = block(document, "Page List", settings);
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
  function convertNextAdventure(document) {
    document.querySelectorAll(".cmp-teaser--hero").forEach((teaser) => {
      if (teaser.closest(".cmp-carousel")) return;
      const action = teaser.querySelector(".cmp-teaser__action-link, a[href]");
      const path = action ? toPath(action.getAttribute("href"), document) : "";
      const folder = path.slice(0, path.lastIndexOf("/") + 1);
      if (!/\/adventures\/$/.test(folder)) return;
      const settings = [["Folder", folder]];
      const template = readSourcePage(path).template;
      if (template) settings.push(["Template", template]);
      settings.push(["Sort", "date desc"], ["Limit", "1"], ["Link Text", action.textContent.trim()]);
      teaser.replaceWith(block(document, "Hero", settings));
    });
  }
  function transform3(hookName, element, payload) {
    if (hookName === TransformHook3.beforeTransform) {
      const { document } = payload;
      const templateName = payload.template && payload.template.name;
      convertTabs(document);
      convertImageLists(document);
      convertUpNext(document);
      if (templateName === "homepage") convertNextAdventure(document);
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
    transform,
    transform2,
    transform3
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
      pageBlocks.forEach((block2) => {
        if (!block2.element.parentNode) return;
        const parser = parsers[block2.name];
        if (parser) {
          try {
            parser(block2.element, { document, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block2.name} (${block2.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block2.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      executeTransformers("afterMetadata", main, payload);
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
