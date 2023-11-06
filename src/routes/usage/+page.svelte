<script lang="ts">
	import type { Usage } from '$lib/interfaces/index';
	import { Button, Checkbox, Indicator } from 'flowbite-svelte';
	import Line from '../../lib/components/chart/Line.svelte';
	import { usage } from '$lib/stores/index';
	import type { PointOptionsObject } from 'highcharts';
	import type Highcharts from 'highcharts';
	// import { format } from 'date-fns';

	let charts: Highcharts.Options[];
	let [parts, parts_selected]: [string[], string[]] = [[], []];

	const createCharts = () => {
		charts = parts.reduce((prev, part) => {
			if ($usage) {
				const data: PointOptionsObject[] = $usage
					.filter((u) => u['Product Name'] === part)
					.sort((a, b) => a['Starting Date'] - b['Starting Date'])
					.map((u) => [u['Starting Date'], u['Usage Quantity']]);
				prev.push({
					title: {
						text: part,
						style: {
							color: 'rgb(255 75 170 / var(--tw-text-opacity))'
						}
					},
					xAxis: { type: 'datetime' },
					yAxis: { title: { text: 'Quantity' } },
					legend: {
						enabled: false
					},
					series: [
						{
							type: 'line',
							name: part,
							data
						}
					]
				});
			}
			return prev;
		}, [] as Highcharts.Options[]);
		// console.log(charts);
	};

	const createParts = (usage: Usage[]) => {
		parts = [...new Set(usage.map((s) => s['Product Name']))].filter(
			(s) => s.toLocaleLowerCase() // .includes('database')
		);
		// parts_selected = [...parts];
	};

	const findChanged = (days: number) => {
		parts_selected = parts.reduce((prev, part) => {
			if (usage) {
				const day = 24 * 60 * 60 * 1000;
				const partdata = $usage.filter((u) => u['Product Name'] === part);
				const timestamp = Math.max(...partdata.map((p) => p['Starting Date']));
				const filtered = partdata
					.filter((u) => u['Starting Date'] > timestamp - days * day)
					.map((u) => u['Usage Quantity']);
				const [min, max] = [Math.min(...filtered), Math.max(...filtered)];
				// if (min !== max)
				// 	console.log("findChanged", days, part, min, max);
				if (min !== max) prev.push(part);
			}
			return prev;
		}, [] as string[]);
	};

	const cleanName = (str: string) => {
		const splitted = str.split(' - ');
		splitted.pop();
		return splitted.join(' - ');
	};

	$: if ($usage.length > 0) createParts($usage);
	$: if (parts.length > 0) createCharts();
</script>

<svelte:head>
	<title>Oracle | Usage</title>
	<meta name="description" content="oracle usage" />
</svelte:head>

{#if parts && parts.length > 0}
	<div class="mt-4 flex flex-row flex-wrap gap-2">
		<Button on:click={() => (parts_selected = [...parts])} size="sm">select all</Button>
		<Button on:click={() => (parts_selected = [])} size="sm" color="dark">select none</Button>
		<Button on:click={() => findChanged(1)} size="sm" color="green">modified 1 day</Button>
		<Button on:click={() => findChanged(3)} size="sm" color="green">modified 3 days</Button>
		<Button on:click={() => findChanged(6)} size="sm" color="green">modified 6 days</Button>
		<Button on:click={() => findChanged(9)} size="sm" color="green">modified 9 days</Button>
		<Button on:click={() => findChanged(12)} size="sm" color="green">modified 12 days</Button>
	</div>
	<ul class="mt-4 flex flex-row flex-wrap">
		{#each parts as part (part)}
			<li class="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-600 w-96">
				<Checkbox bind:group={parts_selected} value={part}>{cleanName(part)}</Checkbox>
				<!-- <div class="flex flex-row">
          <Checkbox bind:group={parts_selected} value={part}></Checkbox>
          <span class="text-xs">{part}</span>
        </div> -->
			</li>
		{/each}
	</ul>
{/if}

{#if charts?.length > 0}
	<div class="mt-4 flex flex-row flex-wrap gap-4">
		{#each charts as options}
			{@const show = parts_selected.includes(`${options.title?.text}`)}
			{#if show}
				<Line {options} />
			{/if}
		{/each}
	</div>
{/if}
