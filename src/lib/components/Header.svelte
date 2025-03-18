<script lang="ts">
	import { parseRatecard, parseUsage, parseComputation } from '$lib/parsers/index';
	import { usage, ratecard, db, computation } from '$lib/db';
	import { Indicator, Darkmode } from 'svelte-5-ui-lib';
	import { page } from '$app/state';
	import Logo from '$lib/components/Logo.svelte';

	const accept = `text/csv`;

	const change = async (e: null | EventTarget) => {
		let files: FileList = (e as HTMLInputElement).files as FileList;
		for (const file of files) {
			const name = file.name.toLocaleLowerCase();
			if (file.type === 'text/csv' && name.includes('ratecard')) {
				const r = await parseRatecard(file);
				if (r) {
					await db.rates.clear();
					await db.rates.bulkAdd(r);
				}
			} else if (file.type === 'text/csv' && name.includes('usage')) {
				const u = await parseUsage(file);
				if (u) {
					await db.usage.clear();
					await db.usage.bulkAdd(u);
				}
			} else if (file.type === 'text/csv' && name.includes('computation')) {
				const c = await parseComputation(file);
				console.log(c);
				if (c) {
					await db.computation.clear();
					console.log(await db.computation.bulkAdd(c));
				}
			} else {
				alert(`incorect filename or type combo: ${file.name}, ${file.type}`);
			}
		}
	};

	const routes = [
		{ id: '/', name: 'Home' },
		{ id: '/ratecard', name: 'Ratecard' },
		{ id: '/usage', name: 'Usage' },
		{ id: '/computation', name: 'Computation' }
	];
</script>

<header class="w-full flex flex-row gap-4 items-center p-3">
	<div class="w-10">
		<Logo />
	</div>
	<div class="mr-16 flex flex-row gap-4">
		{#each routes as route}
			{@const href = route.id}
			<a aria-current={page.route.id === href} {href}>{route.name}</a>
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
	<div>
		usage
		{#if $usage?.length > 0}
			<Indicator class="inline-block bg-lime-400" />
		{:else}
			<Indicator class="inline-block" color="red" />
		{/if}
	</div>
	<div class="grow">
		<input {accept} class="w-full" type="file" multiple onchange={(e) => change(e.target)} />
	</div>
	<Darkmode />
</header>
