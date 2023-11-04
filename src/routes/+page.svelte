<script lang="ts">
	import { ChartLineUpSolid, EuroSolid, ClipboardOutline } from 'flowbite-svelte-icons';
	import { computation, ratecard, usage } from '$lib/stores/index';

	// $: if (ratecard && usage) {
	// 	for (const usagerecord of usage) {
	// 		const idx = ratecard.findIndex(
	// 			(rate) => usagerecord['Product Part'] === rate['Product Part']
	// 		);
	// 		if (idx === -1) console.log('missing', usagerecord);
	// 	}
	// 	console.log('im here');
	// }

	// const upload = async (files: FileList) => {
	// 	const body = new FormData();
	// 	body.set('customer', 'KPN');
	// 	for (const file of files) {
	// 		console.log({ name: file.name, type: file.type });
	// 		body.append(file.name, file);
	// 	}
	// 	const url = 'http://localhost:2000/oracle/upload';
	// 	const response = await fetch(url, { method: 'POST', body });
	// 	if (response.ok) {
	// 		console.log('Success:', await response.json());
	// 	} else console.error('Error:', response.statusText);
	// };
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
