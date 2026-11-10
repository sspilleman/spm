<script lang="ts">
	import { Button, Label } from 'flowbite-svelte';
	import Line from '#lib/components/chart/Line.svelte';
	import { usage } from '#lib/db.ts';
	import type { PointOptionsObject } from 'highcharts';
	import type Highcharts from 'highcharts';

	let charts: Highcharts.Options[] | undefined = $state();
	let [parts, parts_selected]: [string[], string[]] = $state([[], []]);

	const createCharts = () => {
		const start = performance.now();
		charts = parts.reduce((prev, part) => {
			if ($usage) {
				const data: PointOptionsObject[] = $usage
					.filter((u) => u['Product Name'] === part)
					.sort((a, b) => b['Starting Date'] - a['Starting Date'])
					.map((u) => [u['Starting Date'], u['Usage Quantity']]);
				// console.log(data);
				prev.push({
					title: { text: part },
					xAxis: { type: 'datetime' },
					yAxis: { title: { text: 'Quantity' } },
					legend: { enabled: false },
					series: [{ type: 'line', name: part, data }]
				});
			}
			return prev;
		}, [] as Highcharts.Options[]);
		console.log(`[createCharts] took ${performance.now() - start} milliseconds.`);
	};

	const createParts = () => {
		const start = performance.now();
		parts = [...new Set($usage.map((s) => s['Product Name']))].filter(
			(s) => s.toLocaleLowerCase() // .includes('database')
		);
		console.log(`[createParts] took ${performance.now() - start} milliseconds.`);
	};

	const findChanged = (days: number) => {
		const start = performance.now();
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
		console.log(`[findChanged] took ${performance.now() - start} milliseconds.`);
	};

	const cleanName = (str: string) => {
		const splitted = str.split('-');
		if (splitted.length > 1) splitted.pop();
		return splitted.map((s) => s.trim()).join(' - ');
	};

	$effect(() => {
		if ($usage?.length > 0) createParts();
	});
	$effect(() => {
		if (parts.length > 0) createCharts();
		console.log('parts', parts);
		console.log('parts_selected', parts_selected);
	});
</script>

<svelte:head>
	<title>Oracle | Usage</title>
	<meta name="description" content="oracle usage" />
</svelte:head>

{#if parts && parts.length > 0}
	<div class="mt-4 flex flex-row flex-wrap gap-2">
		<Button onclick={() => (parts_selected = [...parts])} size="sm" color="brand">select all</Button
		>
		<Button onclick={() => (parts_selected = [])} size="sm" color="dark">select none</Button>
		<Button onclick={() => findChanged(1)} size="sm" color="success">modified 1 day</Button>
		<Button onclick={() => findChanged(3)} size="sm" color="success">modified 3 days</Button>
		<Button onclick={() => findChanged(6)} size="sm" color="success">modified 6 days</Button>
		<Button onclick={() => findChanged(9)} size="sm" color="success">modified 9 days</Button>
		<Button onclick={() => findChanged(12)} size="sm" color="success">modified 12 days</Button>
	</div>
	<ul class="mt-4 flex flex-row flex-wrap">
		{#each parts as part (part)}
			<li class="w-96 rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-600">
				<!-- <Checkbox bind:group={parts_selected} value={part}>{cleanName(part)}</Checkbox> -->
				<Label
					class="flex items-center text-sm font-medium text-gray-900 rtl:text-right dark:text-gray-300"
				>
					<input
						bind:group={parts_selected}
						type="checkbox"
						value={part}
						class="me-2 h-4 w-4 rounded border-gray-300 bg-gray-100 text-lime-400 focus:ring-2 focus:ring-lime-400 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-lime-400"
					/>
					{cleanName(part)}
				</Label>
			</li>
		{/each}
	</ul>
{/if}

{#if charts && charts.length > 0}
	<div class="mt-4 flex flex-row flex-wrap gap-4">
		{#each charts as options (options.title?.text)}
			{@const show = parts_selected.includes(`${options.title?.text}`)}
			{#if show}<Line {options} />{/if}
		{/each}
	</div>
{/if}
