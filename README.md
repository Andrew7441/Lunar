# LUNAR Cosmetics

Modern TypeScript website for the LUNAR Cosmetics product catalog.

The site is a static React app built with Vite and deployed through GitHub Pages. Product data is stored in the codebase for now, so the site can run without a backend server. A backend can be added later for admin editing, checkout, accounts, inventory, orders, analytics, and private pricing.

Live site:

```text
https://andrew7441.github.io/Lunar/
```

## Tech Stack

- React
- TypeScript
- Vite
- CSS
- GitHub Actions
- GitHub Pages

## Project Structure

```text
src/App.tsx              Main website experience
src/data/products.ts     Product catalog data
public/products/         Local product images
public/lunar-logo.png    Brand logo
.github/workflows/       CI/CD deployment workflow
```

## Run Locally

Install dependencies once:

```powershell
npm ci
```

Start the development server:

```powershell
npm run dev
```

Open:

```text
http://localhost:5173
```

## Visual Studio

Open the solution file:

```text
C:\Users\andre\source\repos\lunar-website\Lunar.sln
```

If Visual Studio asks for a startup project, right-click the `Lunar` project and choose `Set as Startup Project`.

Then press `Ctrl+F5`. Visual Studio should start Vite at:

```text
http://localhost:5173
```

If it does not run, open Visual Studio's terminal in the project folder and run:

```powershell
npm ci
npm run dev
```

## Common Commands

```powershell
npm run dev           # Start local development
npm run typecheck     # Check TypeScript
npm run build         # Create production build
npm run verify:build  # Verify production files exist
npm run qa            # Run typecheck, build, and verification
npm run preview       # Preview the production build locally
```

Production preview runs at:

```text
http://localhost:4173
```

## Updating Products

Product content is defined in:

```text
src/data/products.ts
```

Product images are stored in:

```text
public/products/
```

When adding or editing a product, update the product record in `src/data/products.ts` and place the matching image in `public/products/`. Keep image filenames simple and stable because the deployed website references those paths directly.

The current product images were downloaded from the public LUNAR product catalog. Source URLs are kept in `src/data/products.ts` for traceability.

## Deployment

Deployment is automatic.

When changes are pushed to the `main` branch, GitHub Actions runs:

```text
npm ci
npm run typecheck
npm run build
npm run verify:build
```

If those steps pass, the `dist` folder is deployed to GitHub Pages.

The workflow file is:

```text
.github/workflows/ci-cd.yml
```

The Vite config automatically uses the correct `/Lunar/` base path when building inside GitHub Actions, so the deployed site loads correctly from GitHub Pages.

## Before Pushing Changes

Run the full local check:

```powershell
npm run qa
```

Then commit and push normally:

```powershell
git status
git add .
git commit -m "Describe your change"
git push
```

After the push, check the GitHub Actions tab to confirm the deployment passed.
