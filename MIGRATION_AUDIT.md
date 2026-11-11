# Migration audit: making this repo runtime-agnostic

Runtime-portability task. Phase 1 (the audit, sections 1 to 6) was written on 2026-11-10 without changing any source file. Phase 2 progress is tracked in [Progress](#progress).

## Summary

**The brief does not match this repo, and almost nothing needs to change.**

- The brief describes a large Deno codebase with servers, file system access and Deno services. This repo is a client-only SvelteKit app: 31 files in `src/` (13 `.svelte`, 15 `.ts`, 2 `.css`, 1 `.html`), about 2,300 lines including the two config files.
- There are **0** `Deno.*` calls, **0** `jsr:` / `npm:` / `https://` / `@std/*` imports and **0** `node:*` imports. All application code runs in the browser.
- Deno is used only as the **package manager and task runner**: `deno install`, `deno task <script>`, `deno audit`, `deno.lock`, `deno.json` and the CI setup action.
- `lint`, `check` and `build` already pass unchanged under Deno 2.9.8, Node 26.10.0 and Bun 1.4.4 (see [Verification](#verification)).
- What remains is a package-manager swap (lockfile, CI action, docs). That swap depends on choosing a tool, which the brief defers.

The brief's premise that Deno support ends around October 2027 was taken as given and not checked.

## Progress

Sections 1 to 6 describe the repo as it was before Phase 2. This section records what has changed since.

| Step                                       | Status          | Change                              |
| ------------------------------------------ | --------------- | ----------------------------------- |
| 1. `.ts` on extensionless relative imports | Done 2026-11-10 | 8 specifiers in 5 files             |
| 2. Lint guard                              | Done 2026-11-10 | New block in `eslint.config.js`     |
| 3. Runner variable in `deploy.sh`          | Done 2026-11-10 | `RUN`, default `deno task`          |
| 4. Second runtime in CI                    | Not started     | Waits for a decision                |
| Lockfile, CI action, docs                  | Not started     | Waits for the tool decision         |
| Tests                                      | Done 2026-11-11 | Vitest 5.1.0, 115 tests in `tests/` |

After each step, `deno task lint`, `deno task check` and `deno task build` passed.

**Tests.** Vitest 5.1.0 (peer range `vite ^6.4 || ^7 || ^8`) was added as a dev dependency with `deno install`; it added 15 packages to `deno.lock` and no `deno audit` advisories. `deno task test` and `npm run test` both pass 109 tests against the same `node_modules`, plus 6 known-bug tests marked `it.fails` that are expected to fail, and they also pass with `TZ` set to UTC, America/Los_Angeles, Asia/Kolkata and Pacific/Kiritimati. The tests are in `tests/`, outside the `src/**` lint guard, and read the sample CSVs with Vite's `?raw` import instead of `node:fs`, so they use no runtime-specific API. They run in CI after the type check and in `deploy.sh` through `$RUN test`. From now on `deno task test` is part of the gate for each step. No file in `src/` was changed.

**Step 1.** The build output is byte-identical to the build before the change, apart from the two timestamp files (`200.html`, `_app/version.json`). `src/` now has no relative import without an extension. The Svelte autofixer reported no issues for `Proposal.svelte`.

**Step 2.** The rule applies to `src/**` only, so `vite.config.ts` and `eslint.config.js` can still use Node APIs. It differs from the sketch in section 6 in one way: the import restriction uses a `regex` (`^(jsr|npm|node|https?):`) instead of glob patterns. A probe file with `node:`, `npm:`, `jsr:` and `https://` imports and uses of `Deno`, `Bun`, `process` and `Buffer` produced 10 errors with the rule. The same probe passed the lint without it, so nothing caught this before. The probe file was deleted.

**Step 3.** `RUN="npm run" ./deploy.sh` uses another runner. Without `RUN` the script runs the same three `deno task` commands as before. The script was syntax-checked with `bash -n` but not executed, because it commits and pushes.

## 1. Inventory of Deno-specific usage

### Runtime APIs

| Category                                                            | Count | Files |
| ------------------------------------------------------------------- | ----- | ----- |
| `Deno.serve` / HTTP server setup                                    | 0     | none  |
| File system (`Deno.readTextFile`, `Deno.open`, ...)                 | 0     | none  |
| Environment and process (`Deno.env`, `Deno.args`, `Deno.exit`, ...) | 0     | none  |
| Subprocesses (`Deno.Command`, `Deno.run`)                           | 0     | none  |
| Networking below HTTP (`Deno.connect`, `Deno.listen`, TLS)          | 0     | none  |
| Deno KV, `Deno.cron`, other Deno-only services                      | 0     | none  |
| Testing and benchmarking (`Deno.test`, `Deno.bench`, `@std/*`)      | 0     | none  |
| Other (`Deno.build`, FFI, `import.meta.main`, ...)                  | 0     | none  |

The search covered every tracked file except `deno.lock` and `static/`. It also found no `process.*`, `Bun.*`, `require(`, `__dirname` or `import.meta.*` in `src/`.

### Where Deno does appear

| File                          | Lines mentioning Deno | What                                                                                     |
| ----------------------------- | --------------------- | ---------------------------------------------------------------------------------------- |
| `deno.lock`                   | whole file            | Lockfile, format version 5. Only Deno reads it.                                          |
| `deno.json`                   | whole file (5 lines)  | `minimumDependencyAge: { age: "0" }`. Only Deno reads it.                                |
| `.github/workflows/build.yml` | 8                     | `denoland/setup-deno@v2` pinned to v2.9.8, `deno install --frozen`, three `deno task`    |
| `deploy.sh`                   | 3                     | `deno task lint`, `deno task check`, `deno task build`                                   |
| `.claude/launch.json`         | 2                     | `deno task dev` and `deno task preview` for the preview pane                             |
| `.prettierignore`             | 1                     | Ignores `deno.lock`                                                                      |
| `README.md`                   | 20                    | Requirements, install and run commands, scripts table, dependency policy, CI description |
| `CLAUDE.md`                   | 11                    | Commands section, `deno.json` note                                                       |

## 2. Imports and dependencies

- `deno.lock` holds 27 direct specifiers and 478 packages. All are `npm:` packages. It has no `jsr` section and no `remote` (URL) section.
- `deno.json` has no import map.
- The only URLs in tracked files are `https://mcp.svelte.dev/mcp` in `.mcp.json` (editor tooling) and two SVG `xmlns` attributes.

| Import kind                                 | Count | Portable alternative needed |
| ------------------------------------------- | ----- | --------------------------- |
| `jsr:`                                      | 0     | no                          |
| `https://` module imports                   | 0     | no                          |
| `npm:` specifiers in source                 | 0     | no                          |
| `@std/*`                                    | 0     | no                          |
| Bare npm imports resolved by `node_modules` | 27    | no, already npm             |

Notes on individual dependencies:

- **`vite` 8.3.7** bundles with Rolldown, which ships a native binding. The CI workflow pins Deno to v2.9.8 because some Deno releases had problems loading it. This is the one place where the Deno runtime has been a source of friction.
- **`#lib/*`** is a standard Node subpath import declared in `package.json` `imports`. It is not a Deno feature and needs no change.
- **`overrides`** (`exceljs` → `uuid` 11.1.1) uses npm's nested format. npm 11.19.1 and Bun 1.4.4 both applied it in a dry run. pnpm and Yarn use a different syntax for the same thing.
- **`engines.node >=22.17`** and `.npmrc` `engine-strict=true` are already in the repo, so installing with npm is already an anticipated path.

### Lockfile drift test

I generated lockfiles from `package.json` in a temporary directory outside the repo, without installing anything, and compared them with `deno.lock`:

| Tool        | Packages locked | Of the 478 in `deno.lock`, same version | Extra packages |
| ----------- | --------------- | --------------------------------------- | -------------- |
| npm 11.19.1 | 489             | 478                                     | 11             |
| Bun 1.4.4   | 484             | 478                                     | 6              |

The extra packages are WASM fallbacks for native bindings (`@emnapi/*`, `@napi-rs/wasm-runtime`, `@tybys/wasm-util`, `tslib`) and, for npm, `@types/node`, `undici-types`, `yaml`, `safe-buffer` and `string_decoder`.

This result holds today because `deno.lock` was refreshed today. Transitive versions will drift apart over time, so the comparison should be repeated when the swap happens.

## 3. Tooling and config

| Item                 | Current                                        | Deno-specific?                                                        |
| -------------------- | ---------------------------------------------- | --------------------------------------------------------------------- |
| Scripts              | `package.json` `scripts`, run with `deno task` | No. They only chain commands with `&&`.                               |
| Install              | `deno install`, `deno install --frozen` in CI  | Yes. Every package manager has an equivalent.                         |
| Lockfile             | `deno.lock`                                    | Yes. No other tool reads or imports it.                               |
| Release-age setting  | `deno.json` `minimumDependencyAge`, set to off | Yes. Other tools have their own setting and their own default.        |
| Vulnerability check  | `deno audit`                                   | Yes. Other tools have an `audit` command.                             |
| Formatter and linter | Prettier and ESLint                            | No. `deno fmt` and `deno lint` are not used.                          |
| Type check           | `svelte-check` with `tsconfig.json`            | No. `deno check` is not used and `deno.json` has no compiler options. |
| Build config         | `vite.config.ts`                               | No                                                                    |
| CI                   | `.github/workflows/build.yml`                  | Yes: the setup action and four commands                               |
| Dockerfiles          | none                                           | n/a                                                                   |
| Shell scripts        | `deploy.sh`                                    | Yes: three `deno task` lines                                          |
| Editor launch config | `.claude/launch.json`                          | Yes: `runtimeExecutable: "deno"`                                      |

`deno audit` currently reports two advisories in transitive packages: `deepmerge` 4.3.1 (low, GHSA-gcqx-w48m-w2h4) and `minimatch` (moderate, GHSA-g3hv-75wg-m249). npm and Bun resolve the same versions, so this is unrelated to the runtime. It is listed here only because the audit command is part of the tooling.

One behaviour to be aware of: `deno task` runs the tools in `node_modules/.bin` (Vite, ESLint, Prettier, svelte-check) inside the Deno runtime. Those tools are written for Node. A move to another runner changes which runtime executes the build tools, not the application.

## 4. Code already portable

All of it. The application code uses only web-standard and browser APIs:

| API                                         | Where                                         |
| ------------------------------------------- | --------------------------------------------- |
| `fetch`, `Blob`, `URL.createObjectURL`, DOM | `src/routes/ratecard/exceljs.ts`              |
| `File.text()`                               | `src/lib/utils.ts`                            |
| IndexedDB through Dexie                     | `src/lib/db.ts`                               |
| `Object.groupBy`                            | `src/routes/computation/+page.svelte`         |
| `alert`                                     | `Header.svelte`, `Table.svelte`, `exceljs.ts` |

`src/lib/parsers/*`, `src/lib/utils.ts` and `src/lib/interfaces/*` are pure TypeScript with no platform access beyond `File`.

`vite.config.ts` and `eslint.config.js` import only npm packages.

## 5. Risk assessment

| Area                                           | Effort | Reason                                                                                             |
| ---------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------- |
| Application source                             | None   | No Deno APIs, no non-npm imports                                                                   |
| Extensionless relative imports (8, see step 1) | Low    | Mechanical edit, covered by `check` and `build`                                                    |
| Guard against new Deno-specific code           | Low    | One ESLint config block                                                                            |
| `deploy.sh`, `.claude/launch.json`             | Low    | 5 lines in total                                                                                   |
| CI workflow                                    | Low    | One action and four commands                                                                       |
| Lockfile swap                                  | Low    | No conversion tool exists, but a regenerated lockfile matches all 478 versions today               |
| Release-age setting                            | Low    | The project turns it off. Check the default of the chosen tool, because some enable it by default. |
| Docs (`README.md`, `CLAUDE.md`)                | Low    | 31 lines to reword                                                                                 |

Nothing in this repo lacks a portable equivalent. There is no Deno KV, cron, FFI or permission-dependent code.

The only item that cannot be done while staying neutral is the lockfile swap, because a lockfile belongs to one package manager.

## 6. Proposed plan

### Steps that keep the repo neutral

Each step is independently mergeable. The gate for each is `deno task lint`, `deno task check` and `deno task build`, because the repo has no tests.

**Step 1. Add the `.ts` extension to the 8 extensionless relative imports.**

They resolve only through a bundler. Code that runs directly on a runtime (a future test runner, a script) needs full specifiers, and the repo's own convention already requires extensions for `#lib` imports.

| File                                  | Lines   |
| ------------------------------------- | ------- |
| `src/lib/interfaces/index.ts`         | 1, 2, 3 |
| `src/lib/parsers/index.ts`            | 1, 2    |
| `src/lib/parsers/computation.ts`      | 4       |
| `src/lib/parsers/ratecard.ts`         | 4       |
| `src/routes/ratecard/Proposal.svelte` | 6       |

```ts
// before
import { cleanName, dropTrailer, parseYMDDate } from './helpers';
// after
import { cleanName, dropTrailer, parseYMDDate } from './helpers.ts';
```

**Step 2. Add a lint guard instead of a grep script.**

ESLint already runs in `deno task lint` and in CI, so a rule there needs no new script. `eslint.config.js` currently enables `globals.node` for every file, which means Node globals in browser code are not reported as undefined.

```js
// eslint.config.js, new block
{
	files: ['src/**'],
	rules: {
		'no-restricted-globals': ['error', 'Deno', 'Bun', 'process', 'Buffer'],
		'no-restricted-imports': [
			'error',
			{ patterns: ['jsr:*', 'npm:*', 'node:*', 'http:*', 'https:*'] }
		]
	}
}
```

**Step 3. Make the runner in `deploy.sh` a variable.**

```bash
# before
deno task lint
# after
RUN="${RUN:-deno task}"
$RUN lint
```

The default behaviour stays the same.

**Step 4 (optional, your call). Run the scripts under a second runtime in CI.**

A second job would install with Deno and then run `lint`, `check` and `build` with another runner against the same `node_modules`. This is what I did locally. It keeps one lockfile and catches a build tool that stops working outside Deno. It does add a second runtime to CI, which you may consider a step beyond "neutral".

### Steps that wait for the tool decision

These are small, and doing them earlier would mean keeping two lockfiles in sync.

1. Generate the new lockfile, compare its versions with `deno.lock`, then delete `deno.lock` and `deno.json`.
2. Carry over the release-age setting and the `overrides` entry in the syntax of the chosen tool.
3. Replace the setup action and the four commands in `.github/workflows/build.yml`.
4. Update `.claude/launch.json`, `.prettierignore`, `README.md` and `CLAUDE.md`.

### Platform layer

I recommend not creating one. There is no file system, process, environment or subprocess access to put behind it, so `src/platform/` would be an empty directory.

If the repo later gains a script that runs outside the browser, the layer can be a single file that uses `node:*` modules:

```ts
// scripts/platform.ts
import { readFile, writeFile } from 'node:fs/promises';
import process from 'node:process';

export const readText = (path: string) => readFile(path, 'utf8');
export const writeText = (path: string, data: string) => writeFile(path, data);
export const env = (name: string) => process.env[name];
export const exit = (code: number) => process.exit(code);
```

### Options for a cross-runtime test setup

The repo has no tests today. These are options, not a decision.

| Option                         | Fits                                                         | Trade-off                                                                                 |
| ------------------------------ | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| Vitest                         | Parsers, `uomMultiplier`, `cleanName`, and Svelte components | Reuses `vite.config.ts` and `#lib`. Adds a dev dependency. Node is its primary runtime.   |
| `node:test` with `node:assert` | Parsers and helpers only                                     | No dependency. Needs step 1. Cannot load `.svelte` files. Support outside Node varies.    |
| Playwright against `build/`    | Upload, IndexedDB, proposal totals, Excel export             | Independent of the build runtime, because it tests the static site. Slowest and heaviest. |

The parsers are the natural first target: `static/ratecard 2026-02-26.csv` and `static/computation.csv` can serve as fixtures.

## Verification

All commands ran against the `node_modules` that Deno installed. Nothing was installed with another tool.

| Runtime      | Command                  | `lint` | `check`              | `build` |
| ------------ | ------------------------ | ------ | -------------------- | ------- |
| Deno 2.9.8   | `deno task <script>`     | pass   | 0 errors, 0 warnings | pass    |
| Node 26.10.0 | `npm run <script>`       | pass   | 0 errors, 0 warnings | pass    |
| Bun 1.4.4    | `bun --bun run <script>` | pass   | 0 errors, 0 warnings | pass    |

Build output compared with the Deno build (92 files):

- **Node:** 90 files are byte-identical. `200.html` and `_app/version.json` differ, because they contain the build timestamp and differ on every build.
- **Bun:** 87 files are byte-identical. Besides the two timestamp files, three JavaScript files differ: Vite's preload helper chunk and the two entry files that refer to it by hashed name. The helper has the same statements in a different order. The likely cause is that Vite serialises that helper with `Function.prototype.toString()`, and Bun transpiles the function before Vite reads it. I did not load the Bun build in a browser.

`build/` was rebuilt with Deno afterwards, so it is in the state `deno task build` leaves it in.

## Questions for review

1. Was the brief meant for this repo? It describes servers, a platform layer and Deno services that do not exist here.
2. Do you want steps 1 to 3 done now? They are the only changes that make sense before a tool is chosen.
3. Do you want step 4, or is a second runtime in CI more than you want at this stage?
