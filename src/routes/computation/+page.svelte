<script lang="ts">
	import { Button, Label } from 'svelte-5-ui-lib';
	import Line from '$lib/components/chart/Line.svelte';
	import { computation } from '$lib/db';
	import type { Computation } from '$lib/interfaces/index';
	import type Highcharts from 'highcharts';

	let charts: Record<string, Highcharts.Options> = $state({});
	let skus = $state<string[]>([]);
	let selectedskus = $state<string[]>([]);

	const createCharts = () => {
		charts = skus.reduce(
			(prev, sku) => {
				const records = $computation.filter((u) => u['SKU'] === sku);
				const byDate = Object.groupBy(records, (r) => r['Metered Service Date'].getTime());
				const data = Object.keys(byDate)
					.sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
					.map((d) => {
						const date = parseInt(d, 10);
						const total = byDate[date]?.reduce((prev: number, cur: Computation) => {
							prev += cur['Computed Amount'];
							return prev;
						}, 0) as number;
						return [date, parseFloat(total.toFixed(10))];
					});
				prev[sku] = {
					title: { text: name(sku) },
					xAxis: { type: 'datetime' },
					yAxis: { title: { text: 'EUR' } },
					legend: { enabled: false },
					series: [{ type: 'line', name: sku, data }]
				};
				return prev;
			},
			{} as Record<string, Highcharts.Options>
		);
	};
	const createParts = (records: Computation[]) => {
		skus = [...new Set(records.map((s) => s['SKU']))];
	};

	// const findChanged = (days: number) => {
	// 	parts_selected = parts.reduce((prev, part) => {
	// 		if ($computation) {
	// 			const day = 24 * 60 * 60 * 1000;
	// 			const partdata = $computation.filter((u) => u['Product'] === part);
	// 			const timestamp = Math.max(...partdata.map((p) => p['Metered Service Date'].getTime()));
	// 			const filtered = partdata
	// 				.filter((u) => u['Metered Service Date'].getTime() > timestamp - days * day)
	// 				.map((u) => u['Usage Quantity']);
	// 			const [min, max] = [Math.min(...filtered), Math.max(...filtered)];
	// 			if (min !== max) prev.push(part);
	// 		}
	// 		return prev;
	// 	}, [] as string[]);
	// };

	$effect(() => {
		if ($computation?.length > 0) createParts($computation);
	});
	$effect(() => {
		if (skus.length > 0) createCharts();
	});
	let names: Record<string, string> = $derived.by(() =>
		skus.reduce(
			(prev, cur) => {
				prev[cur] = $computation.find((c) => c.SKU === cur)?.Product as string;
				return prev;
			},
			{} as Record<string, string>
		)
	);
	const name = (sku: string) =>
		names[sku].replace(/[ -]*Metered[ -]*(I|P)aaS$/i, '').replace(/[ -]*Metered$/i, '');
</script>

<svelte:head>
	<title>Oracle | Usage</title>
	<meta name="description" content="oracle usage" />
</svelte:head>

{#if skus && skus.length > 0}
	<div class="mt-4 flex flex-row flex-wrap gap-2">
		<Button onclick={() => (selectedskus = [...skus])} size="sm" color="blue">select all</Button>
		<Button onclick={() => (selectedskus = [])} size="sm" color="dark">select none</Button>
		<!-- <Button on:click={() => findChanged(1)} size="sm" color="green">modified 1 day</Button>
		<Button on:click={() => findChanged(3)} size="sm" color="green">modified 3 days</Button>
		<Button on:click={() => findChanged(6)} size="sm" color="green">modified 6 days</Button>
		<Button on:click={() => findChanged(9)} size="sm" color="green">modified 9 days</Button>
		<Button on:click={() => findChanged(12)} size="sm" color="green">modified 12 days</Button> -->
	</div>
	<ul class="mt-4 flex flex-row flex-wrap">
		{#each skus as sku (sku)}
			<li class="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-600 w-96">
				<Label
					class="text-sm rtl:text-right font-medium text-gray-900 dark:text-gray-300 flex items-center"
				>
					<input
						bind:group={selectedskus}
						type="checkbox"
						value={sku}
						class="w-4 h-4 bg-gray-100 border-gray-300 dark:ring-offset-gray-800 focus:ring-2 me-2 dark:bg-gray-700 dark:border-gray-600 rounded text-lime-400 focus:ring-lime-400 dark:focus:ring-lime-400"
					/>
					{name(sku)}
				</Label>
			</li>
		{/each}
	</ul>
{/if}

<div class="mt-4 flex flex-row flex-wrap gap-4">
	{#each selectedskus as sku}
		{@const options = charts[sku]}
		<Line {options} />
	{/each}
</div>
