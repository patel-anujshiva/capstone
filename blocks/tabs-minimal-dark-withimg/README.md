# tabs-minimal-dark-withimg

Custom **tabs** block. 

## Authoring (Document Authoring)

Model: `collection`

Repeating rows — one row per item. Each item: one row, one cell of content.

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
| Filters | One filter tab per line: `Label` (pages tagged Label) or `Label = tag, tag` (pages with any of those tags), e.g. `Travel = Social, Camping` |

Each card gets the filters whose tags the page carries, so a page can appear under several filters. Used for the adventures "Current Adventures" grid.

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)
