# cards

Custom **cards** block. 

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: one row, one cell of content.

## Dynamic list (query mode)

Instead of content rows, author the block as settings rows (two cells: name | value). The
block then builds its items from the site query index (`/query-index.json`), so newly
published pages appear without editing the page.

| Setting | Value |
| --- | --- |
| Folder | Pages directly in this folder, e.g. `/us/en/magazine/` |
| Template | Page template from page metadata, e.g. `article`, `adventure` |
| Tags | Optional: only pages with any of these tags (comma separated) |
| Sort | `title`, `title desc`, `date` or `date desc` (ties sort by title) |
| Limit | Optional: maximum number of items |
| Exclude | Optional: page paths to leave out; a path ending in `/` leaves out that folder |

Each item shows the page image, title (linked) and description. Used for "Recent Articles", "Where do you want to go?" and the magazine "All Articles" list.

## Supported variations

| Variation | Option class |
| --- | --- |
| Minimal Dark Withimg | `minimal-dark-withimg` |

## Universal Editor fields

N/A (Document Authoring project)
