# hero

Custom **hero** block. 

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
| Link Text | Label of the call-to-action link (e.g. `See Trip`) |

The hero features the first matching page (Limit is always 1): image, title, description and a link. Used for the homepage "Next Adventures" (newest adventure).

## Supported variations

| Variation | Option class |
| --- | --- |
| Minimal Dark Withimg | `minimal-dark-withimg` |
| Minimal Dark Withimg 2 | `minimal-dark-withimg-2` |
| Minimal Dark Withimg 3 | `minimal-dark-withimg-3` |

## Universal Editor fields

N/A (Document Authoring project)
