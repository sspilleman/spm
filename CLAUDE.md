# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A client-only SvelteKit 3 / Svelte 5 app for working with Oracle Cloud (OCI) billing exports: upload a **ratecard** CSV to look up prices and build a quote (exportable to Excel), and upload a **computation** CSV to chart cost per SKU over time.

## This repo is public by design

The repository is public on GitHub on purpose: anyone can read the code and see that the app stores nothing outside the browser and shares nothing. Treat that as a requirement.

- Do not report the repo being public as a problem, and do not suggest making it private.
- **Do not raise the data in `static/` again.** Everything in `static/` is published on purpose: the ratecard and computation samples, the Excel template `sizing.xlsx` and its document metadata. The user has decided this. Do not flag these files as confidential or sensitive, do not suggest removing or purging them, and do not list them as open items in reviews or summaries.
- **Do tell the user** when something outside `static/`, or a new file added to it, looks like it is not meant to be shared: credentials, tokens or `.env` files, personal data, customer or account identifiers, or files marked confidential. Say so before it is committed (everything committed here becomes public) and let the user decide; do not remove it silently.
- Keep the app's promise true: do not add anything that sends data out of the browser (analytics, error reporting, remote fonts, scripts from a CDN, API calls) without asking first.

## Commands

Deno is the package manager and task runner (lockfile `deno.lock`); `deno task <name>` runs the `package.json` scripts.

- `deno install` — install dependencies (CI uses `deno install --frozen`)
- `deno task dev` — Vite dev server on port 4000, bound to `0.0.0.0`
- `deno task build` / `deno task preview` (preview also on port 4000)
- `deno task check` — `svelte-kit sync` + `svelte-check` (type checking)
- `deno task lint` — `prettier --check .` + `eslint .`
- `deno task format` — `prettier --write .`
- `deno audit` — check the lockfile for known vulnerabilities

There is no test suite.

`deno.json` only holds `minimumDependencyAge`, deliberately set to `"0"` (off). Deno 2.9's default would refuse packages published less than 24 hours ago. Dependencies are pinned to exact versions in `package.json`; `overrides` forces exceljs's `uuid` to a patched version.

## Svelte MCP: run the autofixer after every Svelte change

`.mcp.json` registers the remote Svelte MCP server (`https://mcp.svelte.dev/mcp`) for this workspace.

**Every time you change a `.svelte`, `.svelte.ts` or `.svelte.js` file, run the `svelte-autofixer` tool on it before you report the work as done.** This is required, not optional, and it applies to small edits too.

- Pass the whole file as `code`, the file's basename as `filename`, and the `svelte` version from `package.json` as `desired_svelte_version`. `async` is `false` (the project does not enable async components).
- Fix every issue it reports, and act on a suggestion unless it is clearly a false positive. Then run it again on the changed file until it comes back clean.
- Known false positive: `highcharts.svelte.ts` gets "calling a function inside an $effect" suggestions. That effect creates and destroys the chart and assigns no state, so leave it.
- If the server's tools are not loaded in the session, call the server directly over HTTP (JSON-RPC `tools/call`) instead of skipping the check. If it cannot be reached at all, say so in the final report.
- The autofixer does not replace `deno task lint` and `deno task check`; run those as well.

## Build and deployment

- `@sveltejs/adapter-static` with `fallback: '200.html'` builds a static SPA into `build/`. The site is self-hosted: the web server must serve `build/` and fall back to `200.html` for unknown paths (nginx: `try_files $uri $uri/ /200.html;`).
- `.github/workflows/build.yml` runs install, lint, check and build on every push/PR to `main` and uploads `build/` as the `spm-site` artifact. It does not deploy.
- SvelteKit 3 has no `svelte.config.js`: Kit options (adapter, preprocess) are passed to `sveltekit({...})` in `vite.config.ts`. `tsconfig.json` extends `$app/tsconfig`.
- `deploy.sh` runs lint, check and build, stages everything, lists what it will publish and asks for confirmation (`-y` skips the question), then commits with a timestamp message and pushes to `origin`. The timestamp commits in the history were made this way. Do not run it yourself: it commits and pushes.

## Architecture

**Client-only, data in IndexedDB.** `src/routes/+layout.ts` sets `ssr = false`. There is no server or API: all data comes from CSV files the user uploads and is stored in the browser with Dexie (`src/lib/db.ts`, database `spm`, tables `rates`, `quotes`, `computation`). `db.ts` exports Dexie `liveQuery` observables (`ratecard`, `quotes`, `computation`) that components read with Svelte's `$store` syntax, so writing to a table re-renders everything that uses it.

**Upload flow.** The file input is in `src/lib/components/Header.svelte`. Each file goes to a parser based on its **filename** (it must end in `.csv` and the name must contain `ratecard` or `computation`; the MIME type is not checked, because Windows reports CSV files as `application/vnd.ms-excel`). The matching table is cleared and bulk-filled again in one Dexie transaction. The header also shows which datasets are loaded.

**Parsers** (`src/lib/parsers/`) use `d3.csvParse` with a row converter that maps source columns (the `*SourceColumns` union types in `src/lib/interfaces/`) to the app's typed records. Both parsers call `dropTrailer()` to drop the last row only when it is a summary line (no part number or SKU), such as `Confidential Oracle Restricted`. Things to know:

- `ratecard.ts` expects the current export format (`Part Num`, `Net Unit Price (LC)`, `Rate Card Discount (%)`, dates like `28-Dec-2025`). Prices come from the local-currency column, which the UI labels `EUR`. `static/ratecard 2026-02-26.csv` is a sample in that format. Older exports (`Product Part`, `Net Unit Price`, `MM-dd-yyyy` dates) parse with empty prices, dates and part numbers.
- A `Rate.id` is Oracle's `Row WID`, which is stable across exports; without a usable `Row WID` column the rows get sequential ids instead. A `Quote`'s `id` is the `Rate.id` it refers to. `Proposal.svelte` marks a quote as `missing` (not priced, not exported) when that id is not in the loaded ratecard or belongs to another part.
- `helpers.ts` has `uomMultiplier(uom)`: it returns `1` for monthly or per-unit UOMs, `730` (`HOURS_PER_MONTH`) for hourly ones and `730 / 24` (`DAYS_PER_MONTH`) for daily ones. `exceljs.ts` picks the Excel formula from these values. Unknown UOMs log `==>… unknown` and return `0`, which makes the price `0`. When Oracle adds new UOM strings, add them to the right group.
- There are two different `cleanName` functions: `parsers/helpers.ts` strips "Oracle Cloud Infrastructure -" style prefixes when parsing, and `lib/utils.ts` strips trailing UOM words from product names for the Excel export.

**Routes:**

- `/ratecard`: `Table.svelte` (search the ratecard and add lines to `quotes`) and `Proposal.svelte` (joins quotes with rates and calculates per-month and per-year totals in EUR). `exceljs.ts` fetches the template `static/sizing.xlsx`, fills sheet `Quote` starting at row 5 (columns C–H, with formulas in H; the template has 200 line rows, 5–204, with its own I/J formulas, and the Total in row 205), and downloads `formulae.xlsx`. `xlsx.ts` is an old SheetJS version that is fully commented out.
- `/computation`: groups computation records by SKU and date, then renders one Highcharts line chart per selected SKU.

**Charts** (`src/lib/components/chart/`): `highcharts.svelte.ts` is a Svelte action that creates and destroys a Highcharts chart inside `$effect`. It takes a function returning the options (`use:highcharts={() => options}`) so the chart is rebuilt when they change. `Line`/`Column`/`Pie.svelte` merge their default options with `Highcharts.merge(options, defaultOptions)` (defaults win) and render `Chart.svelte`. Charts use `styledMode`, so all styling comes from `highcharts.css` (a customized copy of Highcharts' stylesheet, with light/dark variables under `.highcharts` / `.dark .highcharts`). `highchart.ts` is unused.

## Conventions

- Imports from `src/lib` use the `#lib` subpath import declared in `package.json` `imports` (SvelteKit 3 removed `$lib`) and need the file extension: `import { db } from '#lib/db.ts'`.
- Svelte 5 runes (`$state`, `$derived`, `$effect`, `$props`, snippets) and `$app/state` (`$app/stores` no longer exists). Internal links use `resolve()` from `$app/paths` (enforced by ESLint), and `#each` blocks need keys.
- UI components come from `flowbite-svelte` **2.0.0-next.13** (a prerelease, pinned on purpose). v2 styles everything with Flowbite design tokens (`bg-brand`, `text-body`, `rounded-base`, ...) from `flowbite/src/themes/default`; Button colors are `brand`, `alternative`, `gray`, `success`, `danger`, `warning`, `transparent`, `dark`, `ghost`.
- Tailwind CSS v4 is configured CSS-first in `src/app.css` (no `tailwind.config.*`): Flowbite theme + plugin, `@source` for `flowbite-svelte/dist`, class-based dark mode, and an `@theme` block that restores the Titillium/Hack fonts and Tailwind's default radius scale (the Flowbite theme overrides both). Icons are rendered by `src/lib/components/Icon.svelte` from the path data in `icons.ts` next to it; nothing is fetched at runtime. To use a new icon, add its 24x24 path to `icons.ts` (the current ones come from Material Design Icons).
- Prettier: tabs, single quotes, no trailing commas, print width 100, with `prettier-plugin-tailwindcss` sorting classes. `static/` and `deno.lock` are ignored.
- Fonts (Titillium, Hack) are served locally from `static/fonts`.
