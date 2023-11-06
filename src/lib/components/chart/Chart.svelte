<script lang="ts">
	import './highcharts.css';
	import { onDestroy } from 'svelte';
	import Highcharts from 'highcharts';
	// import exporting from 'highcharts/modules/exporting';
	// exporting(Highcharts);

	export let options: Highcharts.Options;
	let container: HTMLDivElement;
	let chart: Highcharts.Chart;

	const create = (node: HTMLDivElement) => (chart = Highcharts.chart(node, options));
	onDestroy(() => chart?.destroy());

	$: if (container) create(container);
</script>

<div bind:this={container} class="highcharts w-[600px] aspect-[6/3]"></div>
