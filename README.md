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

| File                             | Loads as    | Notes                 |
| -------------------------------- | ----------- | --------------------- |
| `static/ratecard 2026-02-26.csv` | Ratecard    | Current export format |
| `static/computation.csv`         | Computation |                       |

---

## Using the app

### Loading data

The header has a file input that accepts one or more `.csv` files. The **filename** decides what each file is:

| Filename contains | Goes to                |
| ----------------- | ---------------------- |
| `ratecard`        | the ratecard table     |
| `computation`     | the computation table  |
| anything else     | rejected with an alert |

The check ignores case, and the filename must end in `.csv`. Loading a file **replaces** everything that was in its table before.

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
| Status    | `valid`, `expired` or `not yet valid`, worked out from Start/End     |

Typing in the search box filters the lines by a case-insensitive substring match on every field. Clicking ⊕ adds a line to the proposal. You can't add the same line twice.

By default the lookup lists only rates that are **valid today**, meaning today falls within their start and end dates (the end date itself included). This is worked out from the dates each time the page is shown, so a rate drops out on the day after it ends without the ratecard being loaded again. A line above the table says how many rates are valid and how many are hidden.

To look up an old price, switch on **Show expired rates**. A red notice then appears above the table, and every rate that is not valid today gets a red row and an `expired` (or `not yet valid`) label in the Status column.

**Proposal** appears once at least one line has been added. For each line you can:

- click ✎, change the quantity, then press Enter or click save
- click 🗑 to remove the line

Each row shows the monthly and yearly cost, and the last row adds them up. The proposal is saved in IndexedDB, so it is still there after a reload. **Export to xls** downloads the proposal as an Excel workbook (see [Excel export](#excel-export)).

A proposal line whose rate is no longer valid today is marked `expired` on a red row, and a notice under the table counts those lines. They still count in the totals and in the Excel export.

### Computation: cost charts

`/computation` lists every SKU found in the computation export as a checkbox, with buttons to **select all** or **select none**. Each selected SKU gets a line chart of the **Computed Amount** summed per day (from **Metered Service Date**). Charts use a step line, and you can drag horizontally to zoom in on a time range.

---

## Input file formats

The parsers expect these columns. Any other columns are ignored.

### Ratecard (`*ratecard*.csv`)

| Source column            | Used as         | Format / notes                              |
| ------------------------ | --------------- | ------------------------------------------- |
| `Row WID`                | id              | Oracle's ID for the rate line               |
| `Part Num`               | Product Part    |                                             |
| `Product Name`           | Product Name    | Oracle prefixes are removed                 |
| `Start Date`, `End Date` | validity window | `dd-MMM-yyyy`, such as `28-Dec-2025`        |
| `Net Unit Price (LC)`    | Net Unit Price  | number, in the contract currency            |
| `Usage Max`              | Max Quantity    | number such as `10,240`, or `-` for no tier |
| `Rate Card Discount (%)` | Discount        | number                                      |
| `UOM`                    | UOM             | must be known to `uomMultiplier`            |

Whether a rate is valid is not stored. It is worked out from the start and end dates when the rate is shown (`rateStatus` in `src/lib/parsers/helpers.ts`).

### Computation (`*computation*.csv`)

| Source column                                                                                                                                  | Notes                                                    |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `SKU/Product`                                                                                                                                  | `B88319 - Product name`; split into SKU and product name |
| `Metered Service Date`                                                                                                                         | `yyyy-MM-dd`                                             |
| `Computed Amount`                                                                                                                              | plotted in the charts                                    |
| `Computed Amount CD`                                                                                                                           | read but not used yet                                    |
| `Usage Quantity`, `UOM`, `Compute Type`, `Currency`, `Overage`, `Data Center`, `Unit Rate Card`, `Subscription Plan Number`, `Subscription Id` | read and stored                                          |

Some Oracle exports end with a summary line such as `Confidential Oracle Restricted`. Both parsers drop the last parsed row only when it is such a line (it has no part number or SKU).

---

## How prices are calculated

Oracle prices each part in its own UOM. To turn a unit price into a monthly cost, `uomMultiplier()` in `src/lib/parsers/helpers.ts` puts each UOM in one of three groups:

| Group                                                                 | Multiplier                     |
| --------------------------------------------------------------------- | ------------------------------ |
| Per hour (`OCPU PER HOUR`, `GB PR HR`, `LOAD BALANCER HOUR`, …)       | **730** (hours in a month)     |
| Per day (`RSRC POSS PR DY`)                                           | **730 / 24** (days in a month) |
| Per month or per unit (`GB PR MO`, `1M API CALLS PER MONTH`, `EA`, …) | **1**                          |

So:

```
monthly = quantity × multiplier × net unit price
yearly  = 12 × monthly
```

> **Unknown UOMs are priced at 0.** If a UOM isn't in any of the lists, `uomMultiplier` logs `==>{UOM} unknown` to the browser console and returns `0`. When Oracle introduces a new UOM string, add it to the right group in `helpers.ts`.

---

## Excel export

The export uses the template `static/sizing.xlsx`:

1. It fetches `/sizing.xlsx` and opens it with ExcelJS.
2. On the worksheet named **`Quote`**, it writes one row per proposal line, starting at **row 5**:

   | Column | Value                                                                                                                                           |
   | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
   | C      | Product name, with trailing UOM words removed (`cleanName` in `src/lib/utils.ts`)                                                               |
   | D      | Part number                                                                                                                                     |
   | E      | UOM                                                                                                                                             |
   | F      | Quantity                                                                                                                                        |
   | G      | Net unit price                                                                                                                                  |
   | H      | Formula: `=G{row}` for monthly UOMs, `=$D$2*G{row}` for hourly UOMs and `=$D$2/24*G{row}` for daily UOMs (`D2` holds the hours-per-month value) |

3. It downloads the result as **`formulae.xlsx`**.

The template has room for **200 proposal lines** (rows 5 to 204). Columns I and J hold the template's own formulas (`=F{row}*H{row}` and `=12*I{row}`), and the Total row is row 205 (`=SUM(I5:I204)`, `=SUM(J5:J204)`). A proposal with more lines than the template holds is not exported; the app shows a message instead. The limit is read from the template itself: the line rows end just above the row whose column B says `Total`.

To change the layout of the export, edit `static/sizing.xlsx`. If you move the `Quote` sheet, the start row or the columns, update `src/routes/ratecard/exceljs.ts` to match.

---

## Project structure

```
src/
├── app.css                     Tailwind 4 config (CSS-first), Flowbite theme, fonts, global styles
├── app.html
├── lib/
│   ├── db.ts                   Dexie database + liveQuery stores
│   ├── utils.ts                file reading helper, export name cleanup
│   ├── interfaces/             Rate, Quote/Line, Computation (+ CSV column types)
│   ├── parsers/
│   │   ├── ratecard.ts         ratecard CSV → Rate[]
│   │   ├── computation.ts      computation CSV → Computation[]
│   │   └── helpers.ts          date parsing, name cleanup, uomMultiplier
│   └── components/
│       ├── Header.svelte       nav, file upload, load indicators, dark mode
│       ├── Logo.svelte
│       ├── Icon.svelte         inline SVG icons from icons.ts
│       └── chart/              Highcharts action + Line / Column / Pie wrappers
└── routes/
    ├── +layout.ts              ssr = false
    ├── +layout.svelte
    ├── +page.svelte            home tiles
    ├── ratecard/               Table (lookup), Proposal, ExcelJS export
    └── computation/            per-SKU cost charts
static/                         sample CSVs, Excel template, fonts, icons
tests/                          Vitest tests for the parsers and helpers
vite.config.ts                  Vite + SvelteKit config (adapter, preprocess); there is no svelte.config.js
vitest.config.ts                Vitest config (tests only, without the SvelteKit plugins)
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
- **Quotes reference rates by ID.** A rate's `id` is Oracle's `Row WID`, which stays the same from one export to the next. A quote stores the `id` and part number of the rate it was added from, and the proposal joins quotes to rates on that ID. If the ID is not in the loaded ratecard, or now belongs to another part, the line is marked as missing and is not priced. A ratecard without a usable `Row WID` column gets row numbers as IDs instead.
- **Charts.** `src/lib/components/chart/highcharts.svelte.ts` is a Svelte action that creates a Highcharts chart inside `$effect` and destroys it on cleanup. It takes a function that returns the options, so the chart is rebuilt when the options change. The wrapper components use `Highcharts.merge` to combine the options you pass in with their defaults (styled mode, no animation, x-zoom). Where both set the same option, the default wins. Chart styling comes from `highcharts.css`.
- **UI.** The app uses [flowbite-svelte](https://flowbite-svelte.com/) **2.0.0-next.13**, a prerelease pinned on purpose. It also uses Tailwind 4 through `@tailwindcss/vite`, with its config in `src/app.css` and no `tailwind.config.*` file, class-based dark mode and a local `Icon.svelte` component. Its icons (Material Design Icons, Apache 2.0) are stored in `src/lib/components/icons.ts`, so no icon is fetched at runtime.
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
| `deno task test`        | Run the Vitest tests once                                |
| `deno task lint`        | Run `prettier --check` and `eslint`                      |
| `deno task format`      | Run `prettier --write` to format the code                |
| `deno audit`            | Check the lockfile for known vulnerabilities             |

### Tests

`tests/` holds [Vitest](https://vitest.dev/) tests for the pure code: the two parsers, the helpers in `src/lib/parsers/helpers.ts` (UOM multipliers, dates, quantities, rate status, name cleanup) and `src/lib/utils.ts`. They are characterization tests: they record what the code does today, so that a change of package manager or runtime, or a refactor, shows up as a failing test. The sample exports in `static/` are the fixtures.

- The tests run in plain Node (or Deno, or another runtime that runs Vitest), without a browser or jsdom. The parsers take a `File`, which these runtimes provide.
- Fixtures are loaded with Vite's `?raw` import, so the tests use no file system API.
- `vitest.config.ts` is separate from `vite.config.ts`, so the tests run without the SvelteKit, Tailwind and devtools plugins.
- `deno task check` type-checks the tests too.
- Dexie, the Excel export and the Svelte components are not tested.
- Six tests, in a `known bugs` block at the end of the test files, are marked `it.fails`. Each states the correct result for a bug that is not fixed yet, so Vitest reports them as "expected fail" and the run stays green. When a fix makes one pass, Vitest reports that as a failure; change `it.fails` to `it` with the fix.

`npm run test` runs the same tests against the `node_modules` that `deno install` created.

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
3. runs `deno task lint`, `deno task check`, `deno task test` and `deno task build`
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

`deploy.sh` is a shortcut for publishing the source. It runs lint, type check, tests and build, stages everything, lists what it is about to publish and asks for confirmation, then commits with a timestamp as the message and pushes to `origin`. `./deploy.sh -y` skips the question. It stops at the first failing step.

> The app used to run on Deno Deploy Classic with `svelte-adapter-deno`. Deno shut Deploy Classic down on 2026-07-20, and neither Deno adapter supports SvelteKit 3.

---

## Known limitations

- **A new ratecard can leave proposal lines without a rate.** A proposal line whose rate is not in the newly loaded ratecard is shown as "not in the loaded ratecard", counts as 0 in the totals and is left out of the Excel export. Remove it and add it again. This also happens to lines added before rates were identified by `Row WID`.
- **Currency labels.** The ratecard is read from `Net Unit Price (LC)`, the contract currency, and the lookup and proposal always label amounts `EUR`. A ratecard in another currency shows the right numbers with the wrong label.
- **The old ratecard format no longer parses.** Older ratecard exports with `Product Part` / `Net Unit Price` columns and `MM-dd-yyyy` dates load with empty prices, dates and part numbers. Use the current export format instead.
- **Unknown UOMs are priced at 0.** See [How prices are calculated](#how-prices-are-calculated).
- **Clearing site data deletes everything.** All data lives in the browser's IndexedDB, so clearing site data removes every loaded file and the proposal.
