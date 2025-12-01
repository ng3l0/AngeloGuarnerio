# Minimal GitHub Pages trial site

This repository now contains a tiny trial GitHub Pages site served from the `docs/` folder.

Files added:

- `docs/index.html` — main page
- `docs/style.css` — simple styling
- `docs/404.html` — small 404 page
- `.nojekyll` — disable Jekyll processing

How to publish:

1. Commit and push these files to the `main` branch (they are already added locally in the repo).
2. On GitHub, open this repository -> Settings -> Pages.
3. Under "Source", select "Deploy from a branch" (or similar), choose branch `main` and folder `/docs`.
4. Save. GitHub will display the site URL (typically `https://<your-username>.github.io/<repo-name>/`).

Notes:

- This is intentionally minimal — feel free to replace with your own content.
- If you want an automatic deploy to a `gh-pages` branch or use a static site generator, I can add a workflow for that.
