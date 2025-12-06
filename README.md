
# Portfolio site (personalized)

This repository contains a small portfolio site. I updated the root `index.html` and `style.css` to a blue/light-blue gradient theme, added a replaceable profile placeholder, and organized projects into topic blocks.

Files changed/added:

- `index.html` — portfolio homepage with hero and project blocks
- `style.css` — new gradient styles and responsive layout
- `assets/profile.svg` — placeholder profile image (replace with your photo)
- `404.html` and `.nojekyll` remain available if you used them earlier

How to customize:

- Replace the profile image: open `assets/profile.JPG` and replace it with your own image named `profile.svg` (or update the `<img>` src in `index.html`). For an actual photo, add a JPEG/PNG and change `src` to `assets/your-photo.jpg`.
- Edit project blocks in `index.html` under the `<main id="projects">` section. Each `.block` groups projects for a topic.

Publish:

1. Commit and push changes to `main`.
2. In GitHub → Settings → Pages, set Source to `main` branch and the root folder (or `/docs` if you move the site there).
3. Save — GitHub will show the site URL.

If you want, I can:

- replace the SVG with an uploaded photo and resize it,
- add links to real projects from your repo,
- or create a GitHub Actions workflow to publish to `gh-pages` automatically.

