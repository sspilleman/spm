<script lang="ts">
	import Chart from './Chart.svelte';
	import merge from 'lodash.merge';
	import type Highcharts from 'highcharts';

	export let options: Highcharts.Options;

	let pointFormatter: Highcharts.FormatterCallbackFunction<Highcharts.Point> = function () {
		// console.log(this);
		const color = this.graphic?.element.classList[1];
		const style = `color: var(--${color})`;
		const value = this.y?.toFixed(1);
		return `<span class="font-bold" style="${style}">${this.name}</span>: ${value}`;
	};

	const defaultOptions: Highcharts.Options = {
		chart: { styledMode: true },
		credits: { enabled: false },
		tooltip: {
			pointFormatter,
			useHTML: true,
			headerFormat: ''
		}
	};
	const combined: Highcharts.Options = merge(options, defaultOptions);
</script>

<Chart options={combined}></Chart>
