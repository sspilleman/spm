<script lang="ts">
	import Chart from './Chart.svelte';
	import merge from 'lodash.merge';
	import type Highcharts from 'highcharts';

	interface Props {
		options: Highcharts.Options;
	}

	let { options }: Props = $props();

	let pointFormatter: Highcharts.FormatterCallbackFunction<Highcharts.Point> = function () {
		const color = this.graphic?.element.classList[1];
		const style = `color: var(--${color})`;
		const value = this.y?.toFixed(1);
		return `<tr><td class="font-bold" style="${style}">${this.series.name}: </td><td><b>${value} mm</b></td></tr>`;
	};

	const defaultOptions: Highcharts.Options = {
		chart: { styledMode: true },
		credits: { enabled: false },
		plotOptions: {
			column: {
				pointPadding: 0.2,
				borderWidth: 0
			}
		},
		tooltip: {
			headerFormat: '<span class="text-white font-bold">{point.key}</span><table>',
			pointFormatter,
			footerFormat: '</table>',
			shared: true,
			useHTML: true
		}
	};
	const combined: Highcharts.Options = merge(options, defaultOptions);
</script>

<Chart options={combined}></Chart>
