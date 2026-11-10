<script lang="ts">
	import { ratecard, quotes, db } from '#lib/db.ts';
	import { uomMultiplier } from '#lib/parsers/helpers.ts';
	import { Button } from 'flowbite-svelte';
	import type { Rate, Line, Quote } from '#lib/interfaces/index.ts';
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
				ppm: q.quantity * uomMultiplier(rate.UOM) * rate['Net Unit Price'],
				discount: rate.Discount
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
				<th class="px-2 text-left"></th>
				<th class="px-2 text-left">Part</th>
				<th class="px-2 text-left">Name</th>
				<th class="px-2 text-left">UOM</th>
				<th class="px-2 text-left">Rate</th>
				<th class="px-2 text-left">Quantity</th>
				<th class="px-2 text-left">Month</th>
				<th class="px-2 text-left">Year</th>
				<th class="px-2 text-left">Discount</th>
			</tr>
		</thead>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<tbody>
			{#each lines as line (line.id)}
				<tr>
					<td class="px-2" onclick={() => removeProduct(line)}>
						<iconify-icon
							class="cursor-pointer text-poppy outline-none"
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
						<td class="flex flex-row items-center gap-2 px-2">
							<iconify-icon
								onclick={() => changeProduct(line)}
								class="cursor-pointer text-green-500 outline-none"
								icon="mdi:content-save-check-outline"
								height="16"
								noobserver
							></iconify-icon>
							<input
								class="m-0 border-gray-300 bg-gray-100 py-0 pr-0 pl-1 font-mono text-xs dark:border-gray-500 dark:bg-gray-700 dark:text-white"
								type="number"
								min="0"
								max="999999999"
								bind:value={line.quantity}
								onkeyup={(e) => changeProduct(line, e)}
							/>
						</td>
					{:else}
						<td class="flex flex-row items-center gap-2 px-2">
							<iconify-icon
								onclick={() => (line.editing = true)}
								class="cursor-pointer text-lime-400 outline-none"
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
					<td class="px-2 font-semibold text-black dark:text-white">{line?.discount.toFixed(0)}%</td
					>
				</tr>
			{/each}
			<tr class="text-lime-400">
				<td></td>
				<td></td>
				<td></td>
				<td></td>
				<td></td>
				<td class="px-2 text-right">Total</td>
				<td class="px-2 font-extrabold">EUR {tpm.toFixed(2)}</td>
				<td class="px-2 font-extrabold">EUR {(12 * tpm).toFixed(2)}</td>
				<td></td>
			</tr>
		</tbody>
	</table>
	<Button onclick={xlsx} size="sm" color="success">
		<img class="me-2 h-6 w-6" src="./excel.svg" alt="" />export to xls
	</Button>
{/if}
