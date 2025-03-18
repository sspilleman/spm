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

<div class="highcharts w-[600px] aspect-[6/3]" use:highcharts={options}></div>
