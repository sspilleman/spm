<script lang="ts">
	import { parseRatecard, parseComputation } from '#lib/parsers/index.ts';
	import { ratecard, db, computation } from '#lib/db.ts';
	import { Indicator, DarkMode } from 'flowbite-svelte';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import Logo from '#lib/components/Logo.svelte';

	const accept = `.csv,text/csv`;

	const change = async (e: null | EventTarget) => {
		let files: FileList = (e as HTMLInputElement).files as FileList;
		console.log(files);
		for (const file of files) {
			const name = file.name.toLocaleLowerCase();
			// Go by the extension: the MIME type depends on the OS (Windows with Excel installed
			// reports CSV files as application/vnd.ms-excel)
			const csv = name.endsWith('.csv');
			if (csv && name.includes('ratecard')) {
				const r = await parseRatecard(file);
				if (r) {
					// One transaction, so readers never see the table half filled
					await db.transaction('rw', db.rates, async () => {
						await db.rates.clear();
						await db.rates.bulkAdd(r);
					});
				}
			} else if (csv && name.includes('computation')) {
				const c = await parseComputation(file);
				console.log(c);
				if (c) {
					await db.transaction('rw', db.computation, async () => {
						await db.computation.clear();
						console.log(await db.computation.bulkAdd(c));
					});
				}
			} else {
				alert(`incorect filename or type combo: ${file.name}, ${file.type}`);
			}
		}
	};

	const routes = [
		{ id: '/', name: 'Home' },
		{ id: '/ratecard', name: 'Ratecard' },
		{ id: '/computation', name: 'Computation' }
	] as const;
</script>

<header class="flex w-full flex-row items-center gap-4 p-3">
	<div class="w-10">
		<Logo />
	</div>
	<div class="mr-16 flex flex-row gap-4">
		{#each routes as route (route.id)}
			<a aria-current={page.route.id === route.id} href={resolve(route.id)}>{route.name}</a>
		{/each}
	</div>
	<div class="text-white">loaded:</div>
	<div>
		ratecard
		{#if $ratecard?.length > 0}
			<Indicator class="inline-block bg-lime-400" />
		{:else}
			<Indicator class="inline-block" color="red" />
		{/if}
	</div>
	<div>
		computation
		{#if $computation?.length > 0}
			<Indicator class="inline-block bg-lime-400" />
		{:else}
			<Indicator class="inline-block" color="red" />
		{/if}
	</div>
	<div class="grow">
		<input {accept} class="w-full" type="file" multiple onchange={(e) => change(e.target)} />
	</div>
	<DarkMode />
</header>
