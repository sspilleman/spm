# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A client-only SvelteKit 3 / Svelte 5 app for working with Oracle Cloud (OCI) billing exports: upload a **ratecard** CSV to look up prices and build a quote (exportable to Excel), and upload a **computation** CSV to chart cost per SKU over time.

## Commands

Deno is the package manager and task runner (lockfile `deno.lock`); `deno task <name>` runs the `package.json` scripts.

- `deno install` — install dependencies (CI uses `deno install --frozen`)
- `deno task dev` — Vite dev server on port 4000, bound to `0.0.0.0`
- `deno task build` / `deno task preview` (preview also on port 4000)
- `deno task check` — `svelte-kit sync` + `svelte-check` (type checking)
- `deno task lint` — `prettier --check .` + `eslint .`
- `deno task format` — `prettier --write .`
- `deno audit` — check the lockfile for known vulnerabilities

There is no test suite. (The untracked `exceljs/` folder in the root is not part of the app.)

`deno.json` only holds `minimumDependencyAge`, deliberately set to `"0"` (off). Deno 2.9's default would refuse packages published less than 24 hours ago. Dependencies are pinned to exact versions in `package.json`; `overrides` forces exceljs's `uuid` to a patched version.

## Build and deployment

- `@sveltejs/adapter-static` with `fallback: '200.html'` builds a static SPA into `build/`. The site is self-hosted: the web server must serve `build/` and fall back to `200.html` for unknown paths (nginx: `try_files $uri $uri/ /200.html;`).
- `.github/workflows/build.yml` runs install, lint, check and build on every push/PR to `main` and uploads `build/` as the `spm-site` artifact. It does not deploy.
- SvelteKit 3 has no `svelte.config.js`: Kit options (adapter, preprocess) are passed to `sveltekit({...})` in `vite.config.ts`. `tsconfig.json` extends `$app/tsconfig`.
- `deploy.sh` commits everything with a timestamp message and pushes, which is how the existing history was made.

## Architecture

**Client-only, data in IndexedDB.** `src/routes/+layout.ts` sets `ssr = false`. There is no server or API: all data comes from CSV files the user uploads and is stored in the browser with Dexie (`src/lib/db.ts`, database `spm`, tables `rates`, `quotes`, `computation`). `db.ts` exports Dexie `liveQuery` observables (`ratecard`, `quotes`, `computation`) that components read with Svelte's `$store` syntax, so writing to a table re-renders everything that uses it.

**Upload flow.** The file input is in `src/lib/components/Header.svelte`. Each file goes to a parser based on its **filename** (it must be `text/csv` and the name must contain `ratecard` or `computation`). The matching table is cleared and bulk-filled again. The header also shows which datasets are loaded.

**Parsers** (`src/lib/parsers/`) use `d3.csvParse` with a row converter that maps source columns (the `*SourceColumns` union types in `src/lib/interfaces/`) to the app's typed records. Both parsers call `rows.pop()` to drop the trailing row. Things to know:

- `ratecard.ts` expects the current export format (`Part Num`, `Net Unit Price (USD)`, `Rate Card Discount (%)`, dates like `28-Dec-2025`). `static/ratecard 2026-02-26.csv` is a sample in that format. Older exports (`Product Part`, `Net Unit Price`, `MM-dd-yyyy` dates) parse with empty prices, dates and part numbers.
- Ratecard rows get sequential `id`s at parse time. A `Quote`'s `id` is the `Rate.id` it refers to, so uploading a different ratecard can point existing quotes at the wrong rates.
- `helpers.ts` has `uomMultiplier(uom)`: it returns `1` for monthly or per-unit UOMs and `730` (hours per month) for hourly ones. Unknown UOMs log `==>… unknown` and return `0`, which makes the price `0`. When Oracle adds new UOM strings, add them to the right group.
- There are two different `cleanName` functions: `parsers/helpers.ts` strips "Oracle Cloud Infrastructure -" style prefixes when parsing, and `lib/utils.ts` strips trailing UOM words from product names for the Excel export.

**Routes:**

- `/ratecard`: `Table.svelte` (search the ratecard and add lines to `quotes`) and `Proposal.svelte` (joins quotes with rates and calculates per-month and per-year totals in EUR). `exceljs.ts` fetches the template `static/sizing.xlsx`, fills sheet `Quote` starting at row 5 (columns C–H, with formulas in H), and downloads `formulae.xlsx`. `xlsx.ts` is an old SheetJS version that is fully commented out.
- `/computation`: groups computation records by SKU and date, then renders one Highcharts line chart per selected SKU.

**Charts** (`src/lib/components/chart/`): `highcharts.svelte.ts` is a Svelte action that creates and destroys a Highcharts chart inside `$effect`. `Line`/`Column`/`Pie.svelte` merge their default options with `Highcharts.merge(options, defaultOptions)` (defaults win) and render `Chart.svelte`. Charts use `styledMode`, so all styling comes from `highcharts.css` (a customized copy of Highcharts' stylesheet, with light/dark variables under `.highcharts` / `.dark .highcharts`). `highchart.ts` is unused.

**Disabled "usage" feature.** Usage parsing, its Dexie table, nav entry and home tile are commented out across `db.ts`, `parsers/index.ts`, `interfaces/index.ts`, `Header.svelte` and `+page.svelte`. Its page is in `disabled/usage/` (outside `src/routes`, so `svelte-check` does not cover it, but ESLint and Prettier do). To bring it back, uncomment all of these together and move the page to `src/routes/usage/`.

## Conventions

- Imports from `src/lib` use the `#lib` subpath import declared in `package.json` `imports` (SvelteKit 3 removed `$lib`) and need the file extension: `import { db } from '#lib/db.ts'`.
- Svelte 5 runes (`$state`, `$derived`, `$effect`, `$props`, snippets) and `$app/state` (`$app/stores` no longer exists). Internal links use `resolve()` from `$app/paths` (enforced by ESLint), and `#each` blocks need keys.
- UI components come from `flowbite-svelte` **2.0.0-next.13** (a prerelease, pinned on purpose). v2 styles everything with Flowbite design tokens (`bg-brand`, `text-body`, `rounded-base`, ...) from `flowbite/src/themes/default`; Button colors are `brand`, `alternative`, `gray`, `success`, `danger`, `warning`, `transparent`, `dark`, `ghost`.
- Tailwind CSS v4 is configured CSS-first in `src/app.css` (no `tailwind.config.*`): Flowbite theme + plugin, `@source` for `flowbite-svelte/dist`, class-based dark mode, and an `@theme` block that restores the Titillium/Hack fonts and Tailwind's default radius scale (the Flowbite theme overrides both). Icons are `<iconify-icon>` web components.
- Prettier: tabs, single quotes, no trailing commas, print width 100, with `prettier-plugin-tailwindcss` sorting classes. `static/` and `deno.lock` are ignored.
- Fonts (Titillium, Hack) are served locally from `static/fonts`.
