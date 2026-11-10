<script lang="ts">
	import { ratecard, computation } from '#lib/db.ts';
	import { resolve } from '$app/paths';
	import Icon from '#lib/components/Icon.svelte';
</script>

<svelte:head>
	<title>Oracle | Home</title>
	<meta name="description" content="oracle home" />
</svelte:head>

<section class="mt-24 flex w-full flex-row justify-center gap-4">
	{#if $ratecard && $ratecard.length > 0}
		<a
			href={resolve('/ratecard')}
			class="button flex h-48 w-48 flex-col justify-evenly rounded-xl bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700"
		>
			<div class="flex flex-row justify-center">
				<Icon icon="table-edit" size={56} class="text-lime-400" />
			</div>
			<div class="mb-6 flex flex-row justify-center dark:text-white">ratecard</div>
		</a>
	{/if}
	{#if $computation && $computation.length > 1}
		<a
			href={resolve('/computation')}
			class="button flex h-48 w-48 flex-col justify-evenly rounded-xl bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700"
		>
			<div class="flex flex-row justify-center">
				<Icon icon="currency-eur" size={56} class="text-lime-400" />
			</div>
			<div class="mb-6 flex flex-row justify-center dark:text-white">computation</div>
		</a>
	{/if}
</section>

<style>
	.button {
		transition: background-color 0.5s ease;
	}
</style>
