# Tamzid Abdur Rahman — static portfolio

Plain HTML, CSS and JavaScript. No build step, no dependencies at runtime.
Upload the contents of this folder to the root of the `fahim5536/fahim5536.github.io`
repository and GitHub Pages serves it as-is.

The Work section is pulled live from the public GitHub API at runtime, so the
repository list stays current without editing HTML. Everything else is static.

## Structure

```
index.html          all seven sections
404.html            custom not-found page (self-contained styles)
css/style.css       design system, layout, responsive rules, motion
js/main.js          nav, scroll reveal, GitHub projects, lightbox, form, year
js/protect.js       anti-copy deterrents + devtools detection
assets/             SVG portrait, project/gallery placeholders, og-image.png, favicon
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
but a local server better matches GitHub Pages (and avoids browser restrictions on
the GitHub API request).

## Selected work (live from GitHub)

The Work section is not hardcoded. On load, `js/main.js` requests
`https://api.github.com/users/fahim5536/repos?per_page=100&sort=pushed` and then:

- drops forks, archived repositories and the `fahim5536.github.io` repository
- sorts by `pushed_at` and shows the six most recently updated
- renders the prettified name, description (fallback: "Recent project on GitHub"),
  language, topics, star count and "Updated … days ago"
- links each card to its repository, plus a "Live Demo" button when the repository
  has a homepage URL
- marks repositories pushed within the last 30 days as "Recently active"
- fills the activity strip with public repo count, followers and top languages

All API text is inserted with `textContent`, never `innerHTML`, and demo URLs are
limited to `http`/`https`. Responses are cached in `localStorage` under
`tar.github.v1` for 30 minutes, which keeps the site inside GitHub's
60-requests-per-hour unauthenticated limit. If the API fails or is rate-limited,
cached data is shown; without a cache the section falls back to a link to the
profile. No token or secret is used or stored.

Rate limits reset hourly. To force a refresh during development, run
`localStorage.removeItem("tar.github.v1")` in the browser console.

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

If the push is rejected with `GH007` (private email address), commit with your
GitHub noreply address instead of publishing a personal address:

```bash
git -c user.name="TAMZID ABDUR RAHMAN" \
    -c user.email="265785253+fahim5536@users.noreply.github.com" commit -m "Update portfolio"
```

That sets the identity for one commit only and does not change your global config.

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

## Search engine optimization

- Title, meta description, canonical URL, Open Graph and Twitter tags live in the
  `<head>` of `index.html`; the preview image is `assets/og-image.png` (1200×630).
- `Person` and `WebSite` JSON-LD blocks describe the name variants, role, skills,
  school and profile links. Validate them after edits with Google's Rich Results Test.
- `sitemap.xml` lists the homepage and `robots.txt` allows every crawler and points to
  the sitemap. Update `<lastmod>` whenever the page changes.
- The About and Skills copy is plain static HTML, and the Work section keeps a
  `<noscript>` fallback plus a regular GitHub link, so the page is useful without JS.
- `js/protect.js` exits immediately for Googlebot, Bingbot and other crawlers, so
  indexed pages never receive the overlay or the selection locks. `js/main.js` skips
  the scroll-reveal class for the same agents, keeping every section fully visible.

## Replace before publishing

- **Social usernames** — search for `YOUR_USERNAME` in `index.html` (hero, contact,
  footer, and the JSON-LD `sameAs` list). GitHub is already set to `fahim5536`.
- **Email** — replace every `your@email.com` in `index.html` (hero, contact, footer).
- **Formspree** — create a form at formspree.io, then replace `YOUR_FORM_ID` in the
  form action. The form also works without JavaScript via a normal POST.
- **Photo** — replace `assets/portrait.svg` with your own image (keep roughly 4:5),
  update the `<img src>`, `width`, `height` and `alt` in the hero. The social preview
  image is `assets/og-image.png` (1200×630) — regenerate it when the name, role or
  photo changes.
- **GitHub projects** — update repository name, description, topics, homepage and
  visibility on GitHub itself; the site picks them up on the next cache refresh.
  If you change accounts, update `GH_USER` and `GH_REPOS_URL` in `js/main.js`, the
  profile links in `index.html`, the JSON-LD `sameAs` entry and `sitemap.xml`.
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
static files. Lighthouse, headless Chrome and search/social crawler user agents are
exempt so audits, previews and indexing are never blocked by the overlay. Thresholds
are adjustable at the top of the detection block in `js/protect.js`.
