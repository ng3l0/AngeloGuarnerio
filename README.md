# Angelo Guarnerio — personal site

Source of [ng3l0.github.io/AngeloGuarnerio](https://ng3l0.github.io/AngeloGuarnerio/).
Plain HTML, CSS and JavaScript: no build step and no dependencies. Push to `main` and GitHub Pages publishes it.

## Structure

```text
index.html            home: intro (bio + contacts + highlights), news, research focus, now, research, projects, publications, path, about, writing, contact
blog/index.html       article list (reads posts/index.json)
blog/post.html        article reader (renders posts/<slug>.md)
posts/                articles in Markdown + index.json registry
404.html              self-contained "flatline" page
assets/
  css/site.css        all styles (design tokens at the top)
  js/site.js          animations: signal monitor, scroll story, tile graphics, filters
  icons.svg           icon sprite → <svg class="i"><use href="assets/icons.svg#heart"/></svg>
  img/                photo + social preview image
  favicon.svg
```

## Common edits

- **Add a project:** copy an `<article class="card">` block in the `#projects` section of `index.html`.
  `data-kind="course"` or `data-kind="hack"` controls the filter.
- **Add a publication:** copy an `<li class="pub">` block in `#publications`.
- **Add news:** copy an `<li>` in the `#news` list (newest first, keep it to about 5 items).
- **Icons:** every symbol id in `assets/icons.svg` (heart, brain, ear, watch, flask, trophy, …) can be used anywhere.
- **Colours:** `--heart` (wrist/cardiac), `--brain` (EEG), `--state` (models) in `site.css` are used consistently across the site.
- **Write an article:** see `ISTRUZIONI_BLOG.md`.

## Preview locally

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

The icons and the blog load files with `fetch`/`<use>`, so open the site through a local server rather than double-clicking `index.html`.
