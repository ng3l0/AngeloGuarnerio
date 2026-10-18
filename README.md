# Angelo Guarnerio — personal site

Source of [ng3l0.github.io/AngeloGuarnerio](https://ng3l0.github.io/AngeloGuarnerio/).
Plain HTML, CSS and JavaScript, no dependencies. Push to `main` and the GitHub Actions workflow publishes it
(Settings → Pages → Source must be **GitHub Actions**). Articles are written on
[Substack](https://angeloguarnerio.substack.com) and pulled in automatically once a day.

## Structure

```text
index.html            home: intro (bio + contacts + highlights), news, research focus, now, research, projects, publications, path, about, writing, contact
blog/index.html       all Substack articles + subscribe card
data/substack.json    article list, generated at deploy time (don't edit)
scripts/fetch_substack.py   reads the Substack RSS feed → data/substack.json
.github/workflows/deploy.yml  builds + deploys on every push and once a day
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
- **Update the CV:** overwrite `assets/pdf/CV_GUARNERIO_ANGELO_1026__web_version_.pdf` with the new export (same file name), or
  rename it and update the 3 links in `index.html` (search for `CV_GUARNERIO`). Visitors always download it as `Angelo_Guarnerio_CV.pdf`.
- **Write an article:** publish it on Substack; see `ISTRUZIONI_BLOG.md`.
- **Refresh articles now:** Actions tab → Deploy site → Run workflow.

## Preview locally

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

To preview your real articles locally, run `python3 scripts/fetch_substack.py` first.
The icons and the article list load files with `fetch`/`<use>`, so open the site through a local server rather than double-clicking `index.html`.
