<script lang="ts">
	import { ratecard, usage, computation, db } from '$lib/db';
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
				<iconify-icon class="outline-none text-lime-400" icon="mdi:table-edit" height="56" noobserver
				></iconify-icon>
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
				<iconify-icon class="outline-none text-lime-400" icon="mdi:chart-line" height="56" noobserver
				></iconify-icon>
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
				<iconify-icon class="outline-none text-lime-400" icon="mdi:currency-eur" height="56" noobserver
				></iconify-icon>
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
