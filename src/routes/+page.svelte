<script lang="ts">
	import { ChartLineUpSolid, EuroSolid, ClipboardOutline } from 'flowbite-svelte-icons';
	import { computation } from '$lib/stores/computation';
	import { ratecard,usage } from '$lib/db';
</script>

<svelte:head>
	<title>Oracle | Home</title>
	<meta name="description" content="oracle home" />
</svelte:head>

<section class="mt-24 flex flex-row gap-4 w-full justify-center">
	{#if $ratecard && $ratecard.length > 0}
		<a
			href="/ratecard"
			class="button w-48 h-48 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 flex flex-col rounded-xl justify-evenly"
		>
			<div class="flex flex-row justify-center">
				<ClipboardOutline class="outline-none h-28 w-16 text-primary-600"></ClipboardOutline>
			</div>
			<div class="flex flex-row justify-center dark:text-white mb-6">ratecard</div>
		</a>
	{/if}
	{#if $usage && $usage.length > 0}
		<a
			href="/usage"
			class="button w-48 h-48 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 flex flex-col rounded-xl justify-evenly"
		>
			<div class="flex flex-row justify-center">
				<ChartLineUpSolid class="outline-none h-28 w-16 text-primary-600"></ChartLineUpSolid>
			</div>
			<div class="flex flex-row justify-center dark:text-white mb-6">usage</div>
		</a>
	{/if}
	{#if $computation && $computation.length > 1}
		<a
			href="/computation"
			class="button w-48 h-48 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 flex flex-col rounded-xl justify-evenly"
		>
			<div class="flex flex-row justify-center">
				<EuroSolid class="outline-none h-28 w-16 text-primary-600"></EuroSolid>
			</div>
			<div class="flex flex-row justify-center dark:text-white mb-6">computation</div>
		</a>
	{/if}
</section>

<style>
	.button {
		transition: background-color 0.5s ease;
	}
</style>
