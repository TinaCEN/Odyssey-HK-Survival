# Odyssey HK Survival

Web game project.

## Local dev (preview & play)

1) Install dependencies

```bash
npm install
```

2) Start dev server

```bash
npm run dev
```

Then open the URL printed in the terminal (usually http://localhost:5173).

## Build (for deployment)

```bash
npm run build
```

The built site will be in `dist/`.

## Deploy to GitHub Pages

This repo is compatible with GitHub Pages.

- Build output: `dist/`
- Vite `base` is set to `./` in `vite.config.ts` so it works under a subpath.

This repo includes an automatic GitHub Actions workflow:

- Workflow file: `.github/workflows/pages.yml`
- Trigger: every push to `main`
- Output: publishes `dist/` to GitHub Pages

### One-time GitHub setting

In your GitHub repo settings:

1. Go to **Settings → Pages**
2. Under **Build and deployment**, set **Source** to **GitHub Actions**

After that, every push to `main` will redeploy.

### Your Pages URL

After the first successful workflow run, GitHub will show the Pages URL in:

- **Actions** run summary (Deploy step outputs `page_url`)
- **Settings → Pages**
