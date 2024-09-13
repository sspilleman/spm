<script lang="ts">
	import { ratecard, quotes, db } from '$lib/db';
	import { uomMultiplier } from '$lib/parsers/helpers';
	import { Heading, Button } from 'flowbite-svelte';
	import type { Rate, Quote, Line } from '$lib/interfaces/index';
	import { CheckSolid, EditOutline, TrashBinOutline } from 'flowbite-svelte-icons';
	import { exportToXls } from './xlsx';
	let lines: Line[];
	let tpm: number;
	const recalculate = () => {
		lines = $quotes.map((q) => {
			const rate = $ratecard.find((r) => r['id'] === q.id) as Rate;
			return Object.assign(q, {
				editing: false,
				rate: rate['Net Unit Price'],
				uom: rate.UOM,
				name: rate['Product Name'],
				multiplier: uomMultiplier(rate.UOM),
				ppm: q.quantity * uomMultiplier(rate.UOM) * rate['Net Unit Price']
			});
		});
		tpm = lines.length > 0 ? lines.map((a) => a.ppm).reduce((a, b) => a + b) : 0;
	};

	const removeProduct = async (line: Line) => {
		await db.quotes.delete(line.id);
	};

	const changeProduct = async (line: any, e: undefined | KeyboardEvent = undefined) => {
		if (e && e.key !== 'Enter') return;
		await db.quotes.update(line.id, { quantity: line.quantity });
	};

	const xlsx = () => exportToXls(lines);
	$: if ($quotes && $quotes.length >= 0 && $ratecard && $ratecard.length >= 0) recalculate();
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
		<tbody>
			{#each lines as line}
				<tr>
					<td class="px-2" on:click={() => removeProduct(line)}
						><TrashBinOutline class="cursor-pointer outline-none w-4 h-4 text-poppy" /></td
					>
					<td class="px-2 font-semibold text-black dark:text-white">{line?.part}</td>
					<td class="px-2">{line?.name}</td>
					<td class="px-2">{line?.uom}</td>
					<td class="px-2 font-semibold text-black dark:text-white">{line?.rate}</td>
					{#if line.editing}
						<td class="px-2 flex flex-row gap-2 items-center">
							<CheckSolid
								class="cursor-pointer outline-none w-4 h-4 text-green-500"
								on:click={() => changeProduct(line)}
							></CheckSolid>
							<input
								class="py-0 pl-1 pr-0 m-0 font-mono text-xs border-gray-300 bg-gray-100 dark:bg-gray-700 dark:text-white dark:border-gray-500"
								type="number"
								min="0"
								max="999999999"
								bind:value={line.quantity}
								on:keyup={(e) => changeProduct(line, e)}
							/>
						</td>
					{:else}
						<td class="px-2 flex flex-row gap-2 items-center"
							><EditOutline
								class="cursor-pointer outline-none w-4 h-4 text-lightgreen"
								on:click={() => (line.editing = true)}
							/>
							{line?.quantity}
						</td>
					{/if}
					<td class="px-2 font-semibold text-black dark:text-white">EUR {line?.ppm.toFixed(2)}</td>
					<td class="px-2 font-semibold text-black dark:text-white"
						>EUR {(12 * line?.ppm).toFixed(2)}</td
					>
				</tr>
			{/each}
			<tr class="text-lightgreen">
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
	<Button on:click={xlsx}>export to xls</Button>
{/if}
