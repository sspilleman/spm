<script lang="ts">
	import './highcharts.css';
	import { highcharts } from './highcharts.svelte';
	import Highcharts from 'highcharts';
	// import exporting from 'highcharts/modules/exporting';
	// exporting(Highcharts);

	interface Props {
		options: Highcharts.Options;
	}
	let { options }: Props = $props();
</script>

<div class="highcharts aspect-[6/3] w-[600px]" use:highcharts={options}></div>
