# Tamzid Abdur Rahman — static portfolio

Plain HTML, CSS and JavaScript. No build step, no dependencies at runtime.
Upload the contents of this folder to the root of the `fahim5536/fahim5536.github.io`
repository and GitHub Pages serves it as-is.

## Structure

```
index.html          all seven sections
404.html            custom not-found page (self-contained styles)
css/style.css       design system, layout, responsive rules, motion
js/main.js          nav, scroll reveal, lightbox, Formspree submit, year
js/protect.js       anti-copy deterrents + devtools detection
assets/             SVG portrait, project/gallery placeholders, og.jpg, favicon
CNAME               tamzidabdurrahman.me
robots.txt  sitemap.xml  .nojekyll
```

## Preview locally

```bash
# from this folder — any static server works
python -m http.server 8080
# or: npx serve .
```

Open http://localhost:8080. Opening `index.html` directly with `file://` also works,
but a local server better matches GitHub Pages.

## Deploy to GitHub Pages

```bash
cd path/to/this/folder
git init
git add .
git commit -m "Add static portfolio"
git branch -M main
git remote add origin https://github.com/fahim5536/fahim5536.github.io.git
git push -u origin main
```

Then on GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch
→ Branch: `main`, folder: `/ (root)` → Save**. Because this is a user site repository
(`<username>.github.io`), it publishes at `https://fahim5536.github.io/` — the `CNAME`
file switches it to `https://tamzidabdurrahman.me/`.

## Custom domain + HTTPS

1. The included `CNAME` contains `tamzidabdurrahman.me`.
2. At your DNS provider add these records:

   | Type  | Name | Value |
   |-------|------|-------|
   | A     | @    | 185.199.108.153 |
   | A     | @    | 185.199.109.153 |
   | A     | @    | 185.199.110.153 |
   | A     | @    | 185.199.111.153 |
   | CNAME | www  | fahim5536.github.io |

3. In **Settings → Pages → Custom domain**, enter `tamzidabdurrahman.me` and save.
4. Wait for the DNS check, then tick **Enforce HTTPS**. It can take up to 24 hours
   for the certificate to be issued.

## Replace before publishing

- **Social usernames** — search for `YOUR_USERNAME` in `index.html` (hero, contact,
  footer, and the JSON-LD `sameAs` list). GitHub is already set to `fahim5536`.
- **Email** — replace every `your@email.com` (`index.html`, structured data).
- **Formspree** — create a form at formspree.io, then replace `YOUR_FORM_ID` in the
  form action. The form also works without JavaScript via a normal POST.
- **Photo** — replace `assets/portrait.svg` with your own image (keep roughly 4:5),
  update the `<img src>`, `width`, `height` and `alt` in the hero. The OG preview
  image is `assets/og.jpg` (1200×630) — replace it when you have a real photo.
- **Projects** — edit the four `.project-card` blocks: image, title, description,
  tech tags, link (`https://example.com` placeholders) and year.
- **Gallery** — replace the six `assets/gallery-*.svg` files and their captions;
  keep `width`/`height` sensible so lazy loading reserves the right space.
- **Sitemap date** — update `<lastmod>` in `sitemap.xml` when content changes.

## Optional: minify before uploading

Keep readable source in a local folder that is not published, then:

```bash
npx terser js/main.js -c -m -o js/main.min.js
npx terser js/protect.js -c -m -o js/protect.min.js
npx cssnano css/style.css css/style.min.css
```

Update the `<link>` and `<script>` tags in `index.html` to the `.min` files.
The same instructions are at the top of `js/protect.js`. Do not publish source maps.

## Protection caveat

The anti-copy code and developer-tools overlay are deterrents, not security.
Anything rendered in a browser can ultimately be recovered; never put secrets in
static files. Lighthouse and headless Chrome user agents are exempt so automated
audits and previews are not blocked by emulated viewports. Thresholds are
adjustable at the top of the detection block in `js/protect.js`.
