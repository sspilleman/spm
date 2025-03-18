<script lang="ts">
	import './highcharts.css';
	import { onDestroy } from 'svelte';
	import Highcharts from 'highcharts';
	// import exporting from 'highcharts/modules/exporting';

	interface Props {
		// exporting(Highcharts);
		options: Highcharts.Options;
	}

	let { options }: Props = $props();
	let container: HTMLDivElement | undefined = $state();
	let chart: Highcharts.Chart;

	const create = (node: HTMLDivElement) => (chart = Highcharts.chart(node, options));
	onDestroy(() => chart?.destroy());

	$effect(() => {
		if (container) create(container);
	});
</script>

<div bind:this={container} class="highcharts w-[600px] aspect-[6/3]"></div>
