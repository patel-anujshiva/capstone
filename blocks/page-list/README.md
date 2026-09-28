# page-list

Text list of linked page titles with their dates, built from the site query index
(`/query-index.json`). Used for the article "Up Next" list; on desktop (>= 1200px) it sits in a
right-hand column beside the article body, on smaller screens it follows the article.

## Authoring (Document Authoring)

Author the block as settings rows (two cells: name | value). The current page is always left out.

| Setting | Value |
| --- | --- |
| Folder | Pages directly in this folder, e.g. `/us/en/magazine/` |
| Template | Page template from page metadata, e.g. `article` |
| Tags | Optional: only pages with any of these tags (comma separated) |
| Sort | `title`, `title desc`, `date` or `date desc` (ties sort by title) |
| Limit | Optional: maximum number of items |
| Exclude | Optional: page paths to leave out; a path ending in `/` leaves out that folder |

Place the block at the end of the article section: the section's lead image and breadcrumbs stay
full width, the article body narrows to 8 of 12 columns and the list takes the right column.

## Universal Editor fields

N/A (Document Authoring project)
