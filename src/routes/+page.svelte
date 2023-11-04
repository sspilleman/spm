<script lang="ts">
	import { ChartLineUpSolid, EuroSolid, ClipboardOutline } from 'flowbite-svelte-icons';
</script>

<svelte:head>
	<title>Oracle | Home</title>
	<meta name="description" content="oracle home" />
</svelte:head>

<section class="mt-24 flex flex-row gap-4 w-full justify-center">
	<div
		class="w-48 h-48 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 flex flex-col rounded-xl justify-evenly"
	>
		<div class="flex flex-row justify-center">
			<ClipboardOutline class="h-28 w-16 text-primary-600"></ClipboardOutline>
		</div>
		<div class="flex flex-row justify-center dark:text-white mb-6">ratecard</div>
	</div>
	<a
		href="/usage"
		class="w-48 h-48 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 flex flex-col rounded-xl justify-evenly"
	>
		<div class="flex flex-row justify-center">
			<ChartLineUpSolid class="h-28 w-16 text-primary-600"></ChartLineUpSolid>
		</div>
		<div class="flex flex-row justify-center dark:text-white mb-6">usage</div>
	</a>
	<div
		class="w-48 h-48 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 flex flex-col rounded-xl justify-evenly"
	>
		<div class="flex flex-row justify-center">
			<EuroSolid class="h-28 w-16 text-primary-600"></EuroSolid>
		</div>
		<div class="flex flex-row justify-center dark:text-white mb-6">computation</div>
	</div>
</section>

<style>
	.w-48 {
		transition: background-color 1.0s ease;
	}
</style>
