<script lang="ts">
	import { ratecard, quotes, db } from '$lib/db';
	import { uomMultiplier } from '$lib/parsers/helpers';
	import { Button } from 'svelte-5-ui-lib';
	import type { Rate, Line, Quote } from '$lib/interfaces/index';
	import { exportToXls } from './exceljs';

	let lines: Line[] = $state([]);
	let tpm: number = $state(0);

	const recalcLines = (quotes: Quote[], ratecard: Rate[]) => {
		lines = quotes.map((q) => {
			const rate = ratecard.find((r) => r['id'] === q.id) as Rate;
			return Object.assign(q, {
				editing: false,
				rate: rate['Net Unit Price'],
				uom: rate.UOM,
				name: rate['Product Name'],
				multiplier: uomMultiplier(rate.UOM),
				ppm: q.quantity * uomMultiplier(rate.UOM) * rate['Net Unit Price']
			});
		});
	};

	const recalcTotals = (lines: Line[]) => {
		tpm = lines.length > 0 ? lines.map((a) => a.ppm).reduce((a, b) => a + b) : 0;
	};

	const removeProduct = async (line: Line) => {
		await db.quotes.delete(line.id);
	};

	const changeProduct = async (line: Line, e: undefined | KeyboardEvent = undefined) => {
		if (e && e.key !== 'Enter') return;
		line.editing = false;
		await db.quotes.update(line.id, { quantity: line.quantity });
	};

	const xlsx = () => exportToXls(lines);

	$effect(() => {
		if ($quotes && $quotes.length >= 0 && $ratecard && $ratecard.length >= 0)
			recalcLines($quotes, $ratecard);
	});

	$effect(() => {
		if (lines) recalcTotals(lines);
	});
</script>

{#if $quotes && $quotes.length > 0}
	<table class="font-mono text-xs">
		<thead>
			<tr>
				<th class="text-left px-2"></th>
				<th class="text-left px-2">Part</th>
				<th class="text-left px-2">Name</th>
				<th class="text-left px-2">UOM</th>
				<th class="text-left px-2">Rate</th>
				<th class="text-left px-2">Quantity</th>
				<th class="text-left px-2">Month</th>
				<th class="text-left px-2">Year</th>
			</tr>
		</thead>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<tbody>
			{#each lines as line}
				<tr>
					<td class="px-2" onclick={() => removeProduct(line)}>
						<iconify-icon
							class="cursor-pointer outline-none text-poppy"
							icon="mdi:trash-can-outline"
							height="16"
							noobserver
						></iconify-icon>
					</td>
					<td class="px-2 font-semibold text-black dark:text-white">{line?.part}</td>
					<td class="px-2">{line?.name}</td>
					<td class="px-2">{line?.uom}</td>
					<td class="px-2 font-semibold text-black dark:text-white">{line?.rate}</td>
					{#if line.editing}
						<td class="px-2 flex flex-row gap-2 items-center">
							<iconify-icon
								onclick={() => changeProduct(line)}
								class="cursor-pointer outline-none text-green-500"
								icon="mdi:content-save-check-outline"
								height="16"
								noobserver
							></iconify-icon>
							<input
								class="py-0 pl-1 pr-0 m-0 font-mono text-xs border-gray-300 bg-gray-100 dark:bg-gray-700 dark:text-white dark:border-gray-500"
								type="number"
								min="0"
								max="999999999"
								bind:value={line.quantity}
								onkeyup={(e) => changeProduct(line, e)}
							/>
						</td>
					{:else}
						<td class="px-2 flex flex-row gap-2 items-center">
							<iconify-icon
								onclick={() => (line.editing = true)}
								class="cursor-pointer outline-none text-lime-400"
								icon="mdi:edit"
								height="16"
								noobserver
							></iconify-icon>
							{line?.quantity}
						</td>
					{/if}
					<td class="px-2 font-semibold text-black dark:text-white">EUR {line?.ppm.toFixed(2)}</td>
					<td class="px-2 font-semibold text-black dark:text-white"
						>EUR {(12 * line?.ppm).toFixed(2)}</td
					>
				</tr>
			{/each}
			<tr class="text-lime-400">
				<td></td>
				<td></td>
				<td></td>
				<td></td>
				<td></td>
				<td class="text-right px-2">Total</td>
				<td class="font-extrabold px-2">EUR {tpm.toFixed(2)}</td>
				<td class="font-extrabold px-2">EUR {(12 * tpm).toFixed(2)}</td>
			</tr>
		</tbody>
	</table>
	<Button onclick={xlsx} size="sm" color="green">
		<img class="w-6 h-6 me-2" src="./excel.svg" alt="" />export to xls
	</Button>
{/if}
