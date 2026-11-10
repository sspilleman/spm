# spm

A browser-only tool for working with Oracle Cloud Infrastructure (OCI) subscription exports.

- **Ratecard**: load your subscription's ratecard and search it. Pick parts, enter quantities and get monthly and yearly totals. Export the quote to an Excel sizing sheet.
- **Computation**: load a computation (metered usage cost) export and plot the cost per SKU over time, one chart per SKU.

Nothing leaves the browser. There is no backend: the CSV files you choose are parsed on the client and stored in your browser's IndexedDB, so the data is still there after a reload until you load a new file.

Built with SvelteKit 3, Svelte 5, Vite 8, Tailwind CSS 4, flowbite-svelte, Dexie, d3, Highcharts and ExcelJS. It builds to a static site that you host on your own web server.

---

## Contents

- [Getting started](#getting-started)
- [Using the app](#using-the-app)
  - [Loading data](#loading-data)
  - [Ratecard: lookup and proposal](#ratecard-lookup-and-proposal)
  - [Computation: cost charts](#computation-cost-charts)
- [Input file formats](#input-file-formats)
- [How prices are calculated](#how-prices-are-calculated)
- [Excel export](#excel-export)
- [Project structure](#project-structure)
- [Architecture](#architecture)
- [Scripts](#scripts)
- [Deployment](#deployment)
- [Known limitations](#known-limitations)

---

## Getting started

### Requirements

- [Deno](https://deno.com/) 2.9 or later. Deno is the package manager and task runner, and the lockfile (`deno.lock`) is in the repo. CI uses Deno 2.9.8.
- A recent browser. The build targets Chrome/Edge 122, Safari 17, Firefox 124 and Opera 105, and the app uses `Object.groupBy`.

> SvelteKit 3 needs Node.js 22.17 or later if you use npm instead. `.npmrc` sets `engine-strict=true`, so an older Node fails the install.

### Install and run

```bash
deno install
```

```bash
deno task dev
```

The dev server runs on **http://localhost:4000** and listens on all interfaces (`0.0.0.0`), so other devices on your network can reach it too.

### Try it with sample data

`static/` has example exports you can load right away:

| File                             | Loads as    | Notes                                    |
| -------------------------------- | ----------- | ---------------------------------------- |
| `static/ratecard 2026-02-26.csv` | Ratecard    | Current export format, use this one      |
| `static/ratecard.csv`            | Ratecard    | Old format, no longer parses correctly   |
| `static/computation.csv`         | Computation |                                          |
| `static/usage.csv`               | (disabled)  | The usage view is currently switched off |

---

## Using the app

### Loading data

The header has a file input that accepts one or more `.csv` files. The **filename** decides what each file is:

| Filename contains | Goes to                           |
| ----------------- | --------------------------------- |
| `ratecard`        | the ratecard table                |
| `computation`     | the computation table             |
| `usage`           | ignored (the feature is disabled) |
| anything else     | rejected with an alert            |

The check ignores case, and the file must have the `text/csv` MIME type. Loading a file **replaces** everything that was in its table before.

Next to the file input, the header shows a green or red dot for each dataset to tell you whether it is loaded. The home page only shows a tile for a dataset once it is loaded. The sun/moon button in the top-right switches dark mode.

### Ratecard: lookup and proposal

`/ratecard` has two sections.

**Lookup** lists every ratecard line with these columns:

| Column    | Meaning                                                              |
| --------- | -------------------------------------------------------------------- |
| Part      | Oracle part number (SKU), such as `B112145`                          |
| Name      | Product name with the `Oracle Cloud Infrastructure -` prefix removed |
| UOM       | Unit of measure as Oracle exports it, such as `OCPU PER HOUR`        |
| Price     | Net unit price                                                       |
| Tier      | `Usage Max` for tiered pricing (empty if there is none)              |
| PPM       | Price per month for one unit (price × UOM multiplier, see below)     |
| Discount  | Ratecard discount %                                                  |
| Start/End | When the rate is valid                                               |

Typing in the search box filters the lines by a case-insensitive substring match on every field. Only **active** rates appear in search results, meaning rates whose start/end window includes today. Clicking ⊕ adds a line to the proposal. You can't add the same line twice.

**Proposal** appears once at least one line has been added. For each line you can:

- click ✎, change the quantity, then press Enter or click save
- click 🗑 to remove the line

Each row shows the monthly and yearly cost, and the last row adds them up. The proposal is saved in IndexedDB, so it is still there after a reload. **Export to xls** downloads the proposal as an Excel workbook (see [Excel export](#excel-export)).

### Computation: cost charts

`/computation` lists every SKU found in the computation export as a checkbox, with buttons to **select all** or **select none**. Each selected SKU gets a line chart of the **Computed Amount** summed per day (from **Metered Service Date**). Charts use a step line, and you can drag horizontally to zoom in on a time range.

---

## Input file formats

The parsers expect these columns. Any other columns are ignored.

### Ratecard (`*ratecard*.csv`)

| Source column            | Used as         | Format / notes                       |
| ------------------------ | --------------- | ------------------------------------ |
| `Part Num`               | Product Part    |                                      |
| `Product Name`           | Product Name    | Oracle prefixes are removed          |
| `Start Date`, `End Date` | validity window | `dd-MMM-yyyy`, such as `28-Dec-2025` |
| `Net Unit Price (USD)`   | Net Unit Price  | number                               |
| `Usage Max`              | Max Quantity    | number, or `-` for no tier           |
| `Rate Card Discount (%)` | Discount        | number                               |
| `UOM`                    | UOM             | must be known to `uomMultiplier`     |

`Active` is calculated from the start and end dates when the file is read.

### Computation (`*computation*.csv`)

| Source column                                                                                                                                  | Notes                                                    |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `SKU/Product`                                                                                                                                  | `B88319 - Product name`; split into SKU and product name |
| `Metered Service Date`                                                                                                                         | `yyyy-MM-dd`                                             |
| `Computed Amount`                                                                                                                              | plotted in the charts                                    |
| `Computed Amount CD`                                                                                                                           | read but not used yet                                    |
| `Usage Quantity`, `UOM`, `Compute Type`, `Currency`, `Overage`, `Data Center`, `Unit Rate Card`, `Subscription Plan Number`, `Subscription Id` | read and stored                                          |

Both parsers drop the last parsed row, because Oracle's exports end with an empty or summary line.

---

## How prices are calculated

Oracle prices each part in its own UOM. To turn a unit price into a monthly cost, `uomMultiplier()` in `src/lib/parsers/helpers.ts` puts each UOM in one of two groups:

| Group                                                                 | Multiplier                 |
| --------------------------------------------------------------------- | -------------------------- |
| Per hour (`OCPU PER HOUR`, `GB PR HR`, `LOAD BALANCER HOUR`, …)       | **730** (hours in a month) |
| Per month or per unit (`GB PR MO`, `1M API CALLS PER MONTH`, `EA`, …) | **1**                      |

So:

```
monthly = quantity × multiplier × net unit price
yearly  = 12 × monthly
```

> **Unknown UOMs are priced at 0.** If a UOM isn't in either list, `uomMultiplier` logs `==>{UOM} unknown` to the browser console and returns `0`. When Oracle introduces a new UOM string, add it to the right group in `helpers.ts`.

---

## Excel export

The export uses the template `static/sizing.xlsx`:

1. It fetches `/sizing.xlsx` and opens it with ExcelJS.
2. On the worksheet named **`Quote`**, it writes one row per proposal line, starting at **row 5**:

   | Column | Value                                                                                                      |
   | ------ | ---------------------------------------------------------------------------------------------------------- |
   | C      | Product name, with trailing UOM words removed (`cleanName` in `src/lib/utils.ts`)                          |
   | D      | Part number                                                                                                |
   | E      | UOM                                                                                                        |
   | F      | Quantity                                                                                                   |
   | G      | Net unit price                                                                                             |
   | H      | Formula: `=G{row}` for monthly UOMs, `=$D$2*G{row}` for hourly UOMs (`D2` holds the hours-per-month value) |

3. It downloads the result as **`formulae.xlsx`**.

To change the layout of the export, edit `static/sizing.xlsx`. If you move the `Quote` sheet, the start row or the columns, update `src/routes/ratecard/exceljs.ts` to match.

---

## Project structure

```
src/
├── app.css                     Tailwind 4 config (CSS-first), Flowbite theme, fonts, global styles
├── app.html
├── lib/
│   ├── db.ts                   Dexie database + liveQuery stores
│   ├── utils.ts                FileReader helper, export name cleanup
│   ├── interfaces/             Rate, Quote/Line, Computation (+ CSV column types)
│   ├── parsers/
│   │   ├── ratecard.ts         ratecard CSV → Rate[]
│   │   ├── computation.ts      computation CSV → Computation[]
│   │   ├── usage.ts            (disabled)
│   │   └── helpers.ts          date parsing, name cleanup, uomMultiplier
│   └── components/
│       ├── Header.svelte       nav, file upload, load indicators, dark mode
│       ├── Logo.svelte
│       └── chart/              Highcharts action + Line / Column / Pie wrappers
└── routes/
    ├── +layout.ts              ssr = false
    ├── +layout.svelte
    ├── +page.svelte            home tiles
    ├── ratecard/               Table (lookup), Proposal, ExcelJS export
    └── computation/            per-SKU cost charts
static/                         sample CSVs, Excel template, fonts, icons
disabled/usage/                 the parked usage page
vite.config.ts                  Vite + SvelteKit config (adapter, preprocess); there is no svelte.config.js
deno.json                       Deno's minimum dependency age setting
```

Code in `src/lib` is imported through the `#lib` subpath import declared in `package.json`, and imports include the file extension, for example `import { db } from '#lib/db.ts'`. SvelteKit 3 removed the old `$lib` alias.

---

## Architecture

```
 CSV file ──► Header.svelte ──► parsers/* (d3.csvParse) ──► Dexie (IndexedDB)
                                                               │
                                                       liveQuery stores
                                                               │
                                    ┌──────────────────────────┼──────────────────────┐
                                    ▼                          ▼                      ▼
                              Header indicators        /ratecard pages          /computation
```

- **Client-side only.** `src/routes/+layout.ts` sets `ssr = false`, so the app renders entirely in the browser. `@sveltejs/adapter-static` builds it into a static single-page app.
- **Storage.** `src/lib/db.ts` creates a Dexie database named `spm` with these tables:
  - `rates` (key `id`): the parsed ratecard
  - `quotes` (key `id`): proposal lines `{ id, part, quantity }`
  - `computation` (key `++id`, index `SKU`): the parsed computation export
- **Reactivity.** `db.ts` exports Dexie `liveQuery` observables (`ratecard`, `quotes`, `computation`). Components use them like Svelte stores (`$ratecard`), so any write to IndexedDB re-renders the components that read it.
- **Quotes reference rates by ID.** When a ratecard is read, its rows get sequential IDs. A quote stores the `id` of the rate it was added from, and the proposal joins quotes to rates on that ID.
- **Charts.** `src/lib/components/chart/highcharts.svelte.ts` is a Svelte action that creates a Highcharts chart inside `$effect` and destroys it on cleanup. The wrapper components use `Highcharts.merge` to combine the options you pass in with their defaults (styled mode, no animation, x-zoom). Where both set the same option, the default wins. Chart styling comes from `highcharts.css`.
- **UI.** The app uses [flowbite-svelte](https://flowbite-svelte.com/) **2.0.0-next.13**, a prerelease pinned on purpose. It also uses Tailwind 4 through `@tailwindcss/vite`, with its config in `src/app.css` and no `tailwind.config.*` file, class-based dark mode and [Iconify](https://iconify.design/) web components.
  - flowbite-svelte v2 styles its components with Flowbite's design tokens (`bg-brand`, `text-body`, `rounded-base`, …), which come from `flowbite/src/themes/default`.
  - That theme also changes the fonts and Tailwind's radius scale. The `@theme` block in `app.css` switches both back.
  - The Titillium and Hack fonts are served locally from `static/fonts`.

---

## Scripts

| Command                 | What it does                                             |
| ----------------------- | -------------------------------------------------------- |
| `deno install`          | Install dependencies from `deno.lock`                    |
| `deno task dev`         | Start the Vite dev server on port 4000                   |
| `deno task build`       | Build the static site into `build/`                      |
| `deno task preview`     | Serve the production build on port 4000                  |
| `deno task check`       | Run `svelte-kit sync` and `svelte-check` for type errors |
| `deno task check:watch` | Same, in watch mode                                      |
| `deno task lint`        | Run `prettier --check` and `eslint`                      |
| `deno task format`      | Run `prettier --write` to format the code                |
| `deno audit`            | Check the lockfile for known vulnerabilities             |

The project has no automated tests.

Code style follows Prettier: tabs, single quotes, no trailing commas and a print width of 100. `prettier-plugin-tailwindcss` sorts the Tailwind classes.

### Dependency policy

- **Exact versions.** Every dependency in `package.json` is pinned to an exact version.
- **One override.** `overrides` forces exceljs's `uuid` dependency to 11.1.1, which fixes GHSA-w5hq-g745-h8pq. exceljs itself has had no release since 2023.
- **Release age.** By default, Deno 2.9 refuses to install packages that were published less than 24 hours ago. This project turns that check off with `"minimumDependencyAge": { "age": "0" }` in `deno.json`. To turn it back on, set `age` to a duration such as `"P1D"`.

---

## Deployment

The app builds to a **static single-page app** with [`@sveltejs/adapter-static`](https://svelte.dev/docs/kit/adapter-static) and is meant to be **self-hosted**. There is no server-side code.

`.github/workflows/build.yml` runs on every push and pull request to `main`. It:

1. checks out the repo and installs Deno 2.9.8
2. runs `deno install --frozen`, which fails if `deno.lock` is out of date
3. runs `deno task lint`, `deno task check` and `deno task build`
4. uploads `build/` as the workflow artifact **`spm-site`**

The workflow does not deploy. To publish a build, copy the contents of `build/` (or the `spm-site` artifact) to your web server. The server must send any path that isn't a real file to `200.html`, so that client-side routes such as `/ratecard` work after a reload. With nginx:

```nginx
location / {
	root /var/www/spm;
	try_files $uri $uri/ /200.html;
}
```

To check the production build locally:

```bash
deno task build
```

```bash
deno task preview
```

`deploy.sh` is a shortcut that stages everything, commits with a timestamp as the message and pushes.

> The app used to run on Deno Deploy Classic with `svelte-adapter-deno`. Deno shut Deploy Classic down on 2026-07-20, and neither Deno adapter supports SvelteKit 3.

---

## Known limitations

- **Reloading a ratecard can break the proposal.** Quotes point at rate IDs, and those IDs are assigned again every time a ratecard is read. If the new file has its rows in a different order or a different number of rows, existing proposal lines can show the wrong rate. Clear the proposal after loading a new ratecard.
- **Currency labels.** The ratecard is read from `Net Unit Price (USD)`, but the lookup and proposal show amounts with an `EUR` label.
- **The old ratecard format no longer parses.** Files with `Product Part` / `MM-dd-yyyy` columns (such as `static/ratecard.csv`) need the current export format.
- **Unknown UOMs are priced at 0.** See [How prices are calculated](#how-prices-are-calculated).
- **The usage view is disabled.** The usage parser, its Dexie table, its nav entry and its home tile are commented out in `db.ts`, `parsers/index.ts`, `interfaces/index.ts`, `Header.svelte` and `routes/+page.svelte`, and its page is in `disabled/usage/`. To turn it back on, uncomment all of these and move the page back under `src/routes/usage/`.
- **Clearing site data deletes everything.** All data lives in the browser's IndexedDB, so clearing site data removes every loaded file and the proposal.
