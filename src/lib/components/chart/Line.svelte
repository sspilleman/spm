<script lang="ts">
	import Chart from './Chart.svelte';
	import merge from 'lodash.merge';
	import type Highcharts from 'highcharts';

	interface Props {
		options: Highcharts.Options;
	}

	let { options }: Props = $props();

	const defaultOptions: Highcharts.Options = {
		accessibility: { enabled: false },
		chart: {
			animation: false,
			styledMode: true,
			zooming: { type: 'x' }
		},
		title: { align: 'left' },
		credits: { enabled: false },
		plotOptions: {
			series: {
				step: 'left',
				animation: false,
				marker: { enabled: false },
				// events: { click: (e) => console.log(e) }
			}
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
