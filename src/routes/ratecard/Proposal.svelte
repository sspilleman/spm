<script lang="ts">
	import { ratecard, quotes, db } from '#lib/db.ts';
	import { uomMultiplier } from '#lib/parsers/helpers.ts';
	import { Button } from 'flowbite-svelte';
	import type { Rate, Line, Quote } from '#lib/interfaces/index.ts';
	import { exportToXls } from './exceljs';
	import Icon from '#lib/components/Icon.svelte';

	// quote id -> the quantity being typed, for lines that are in edit mode
	let edits = $state<Record<number, number | null>>({});

	const lines = $derived.by((): Line[] => {
		const rates = new Map(($ratecard ?? []).map((r: Rate) => [r.id, r]));
		return ($quotes ?? []).map((q: Quote) => {
			const rate = rates.get(q.id);
			// Never price a quote from a rate for another part, or from no rate at all
			if (!rate || rate['Product Part'] !== q.part) {
				const unpriced = { rate: 0, uom: '', name: '', multiplier: 0, ppm: 0, discount: 0 };
				return { ...q, ...unpriced, missing: true };
			}
			const multiplier = uomMultiplier(rate.UOM);
			return {
				...q,
				missing: false,
				rate: rate['Net Unit Price'],
				uom: rate.UOM,
				name: rate['Product Name'],
				multiplier,
				ppm: q.quantity * multiplier * rate['Net Unit Price'],
				discount: rate.Discount
			};
		});
	});

	const tpm = $derived(lines.reduce((sum, line) => sum + line.ppm, 0));

	const removeProduct = async (line: Line) => {
		delete edits[line.id];
		await db.quotes.delete(line.id);
	};

	const saveQuantity = async (line: Line, e: undefined | KeyboardEvent = undefined) => {
		if (e && e.key !== 'Enter') return;
		const quantity = edits[line.id];
		delete edits[line.id];
		// an emptied field keeps the quantity the line had
		if (typeof quantity === 'number') await db.quotes.update(line.id, { quantity });
	};

	const xlsx = () => exportToXls(lines.filter((line) => !line.missing));
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
		<tbody>
			{#each lines as line (line.id)}
				<tr>
					<td class="px-2" onclick={() => removeProduct(line)}>
						<Icon icon="trash-can-outline" size={16} class="cursor-pointer text-poppy" />
					</td>
					<td class="px-2 font-semibold text-black dark:text-white">{line?.part}</td>
					{#if line.missing}
						<td class="px-2 text-poppy" colspan="3">
							not in the loaded ratecard: remove this line and add it again
						</td>
					{:else}
						<td class="px-2">{line?.name}</td>
						<td class="px-2">{line?.uom}</td>
						<td class="px-2 font-semibold text-black dark:text-white">{line?.rate}</td>
					{/if}
					{#if line.id in edits}
						<td class="flex flex-row items-center gap-2 px-2">
							<Icon
								icon="content-save-check-outline"
								size={16}
								class="cursor-pointer text-green-500"
								onclick={() => saveQuantity(line)}
							/>
							<input
								class="m-0 border-gray-300 bg-gray-100 py-0 pr-0 pl-1 font-mono text-xs dark:border-gray-500 dark:bg-gray-700 dark:text-white"
								type="number"
								min="0"
								max="999999999"
								bind:value={edits[line.id]}
								onkeyup={(e) => saveQuantity(line, e)}
							/>
						</td>
					{:else}
						<td class="flex flex-row items-center gap-2 px-2">
							<Icon
								icon="edit"
								size={16}
								class="cursor-pointer text-lime-400"
								onclick={() => (edits[line.id] = line.quantity)}
							/>
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
