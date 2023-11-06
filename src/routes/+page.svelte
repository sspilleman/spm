<script lang="ts">
	import { ChartLineUpSolid, EuroSolid, ClipboardOutline } from 'flowbite-svelte-icons';
	import { computation, ratecard, usage } from '$lib/stores/index';
	// import { parseSizing } from '$lib/parsers/sizing';
	// import { utils, writeFile } from 'xlsx';
	// import type { WorkSheet, WorkBook } from 'xlsx';

	// parseSizing();

	// const test = () => {
	// 	const wb: WorkBook = utils.book_new();
	// 	const ws: WorkSheet = utils.aoa_to_sheet([
	// 		['A', 'B', 'C'],
	// 		[1, 2, { t: 'n', f: 'SUM(A2:B2)' }],
	// 		[3, 4, { t: 'n', f: 'A3+B3' }]
	// 	]);
	// 	utils.book_append_sheet(wb, ws, 'Sheet1');
	// 	writeFile(wb, 'formulae.xlsx', { compression: true });
	// };
	// test();
</script>

<svelte:head>
	<title>Oracle | Home</title>
	<meta name="description" content="oracle home" />
</svelte:head>

<section class="mt-24 flex flex-row gap-4 w-full justify-center">
	{#if $ratecard.length > 0}
		<a
			href="/ratecard"
			class="w-48 h-48 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 flex flex-col rounded-xl justify-evenly"
		>
			<div class="flex flex-row justify-center">
				<ClipboardOutline class="outline-none h-28 w-16 text-primary-600"></ClipboardOutline>
			</div>
			<div class="flex flex-row justify-center dark:text-white mb-6">ratecard</div>
		</a>
	{/if}
	{#if $usage.length > 0}
		<a
			href="/usage"
			class="w-48 h-48 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 flex flex-col rounded-xl justify-evenly"
		>
			<div class="flex flex-row justify-center">
				<ChartLineUpSolid class="outline-none h-28 w-16 text-primary-600"></ChartLineUpSolid>
			</div>
			<div class="flex flex-row justify-center dark:text-white mb-6">usage</div>
		</a>
	{/if}
	{#if $computation.length > 1}
		<a
			href="/computation"
			class="w-48 h-48 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 flex flex-col rounded-xl justify-evenly"
		>
			<div class="flex flex-row justify-center">
				<EuroSolid class="outline-none h-28 w-16 text-primary-600"></EuroSolid>
			</div>
			<div class="flex flex-row justify-center dark:text-white mb-6">computation</div>
		</a>
	{/if}
</section>

<style>
	.w-48 {
		transition: background-color 1s ease;
	}
</style>
