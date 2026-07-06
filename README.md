# LUNAR Cosmetics

TypeScript website for the LUNAR Cosmetics product catalog.

## Stack

- Vite
- React
- TypeScript
- CSS
- GitHub Actions CI/CD

## Visual Studio

Open `Lunar.sln` in Visual Studio, not just the folder:

```text
C:\Users\andre\source\repos\lunar-website\Lunar.sln
```

If Visual Studio asks for a startup project, right-click the `Lunar` project and choose `Set as Startup Project`. Then press `Ctrl+F5`. Visual Studio runs Vite on:

```text
http://localhost:5173
```

If dependencies are missing, run `npm ci` once in the terminal before pressing `Ctrl+F5`.
## Local Development

```powershell
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

## Production Build

```powershell
npm run build
npm run verify:build
```

Preview the production build:

```powershell
npm run preview
```

Open:

```text
http://localhost:4173
```

## GitHub Pages CI/CD

The workflow is in `.github/workflows/ci-cd.yml`.

It runs:

```text
npm ci
npm run typecheck
npm run build
npm run verify:build
```

Then it deploys the `dist` folder to GitHub Pages on pushes to `main` or `master`.

For the GitHub repo named `Lunar`, Vite automatically builds with the `/Lunar/` base path inside GitHub Actions.

## Push To Your GitHub Repo

If the local folder is not connected to your repo yet:

```powershell
cd C:\Users\andre\source\repos\lunar-website
git init
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/Lunar.git
git add .
git commit -m "Build TypeScript Lunar website"
git push -u origin main
```

After the push, open the repository on GitHub and enable Pages with GitHub Actions as the source.

## Product Assets

The 23 product images in `public/products` were downloaded from the current public LUNAR product catalog and are served locally by the new site. The source URLs are retained in `src/data/products.ts` for traceability.
