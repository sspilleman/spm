<script lang="ts">
	import Chart from './Chart.svelte';
	import merge from 'lodash.merge';
	import type Highcharts from 'highcharts';

	export let options: Highcharts.Options;

	const defaultOptions: Highcharts.Options = {
		accessibility: { enabled: false },
		chart: {
			animation: false,
			styledMode: true,
			zooming: { type: 'x' }
		},
		title: { align: 'left' },
		subtitle: { align: 'left' },
		credits: { enabled: false },
		plotOptions: {
			series: { step: 'left', animation: false, marker: { enabled: false } }
		},
		tooltip: {
			headerFormat:
				'{point.key}: <b class="dark:text-white text-black font-bold">{point.y}</b><br>',
			pointFormatter: () => '',
			useHTML: true
		},
		xAxis: {
			crosshair: true
		}
	};
	const combined: Highcharts.Options = merge(options, defaultOptions);
</script>

<Chart options={combined}></Chart>
