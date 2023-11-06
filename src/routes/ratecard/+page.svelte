<script lang="ts">
	import Table from './Table.svelte';
	import { ratecard } from '$lib/stores/index';
	import { uomMultiplier } from '$lib/parsers/helpers';
	import { Heading } from 'flowbite-svelte';
	import type { Rate } from '$lib/interfaces/index';
	import { CheckSolid, EditOutline, TrashBinOutline } from 'flowbite-svelte-icons';

	interface Quote {
		id: number;
		part: string;
		quantity: number;
	}

	interface Line extends Quote {
		editing: boolean;
		rate: number;
		uom: string;
		name: string;
		ppm: number;
	}

	let lines: Line[];
	let quotes: Quote[] = [
		{ id: 310, part: 'B93113', quantity: 4 },
		{ id: 311, part: 'B93114', quantity: 64 }
	];
	let tpm: number;

	const addProduct = (e: CustomEvent) => {
		const rate = e.detail as Rate;
		if (quotes.find((q) => q.part === rate['Product Part'])) {
			alert(`${rate['Product Name']} aleady added`);
		} else {
			quotes = [
				...quotes,
				{
					id: rate.id,
					part: rate['Product Part'],
					quantity: 1
				}
			];
		}
	};

	const removeProduct = (line: Line) => {
		quotes = quotes.filter((q) => q.id !== line.id);
	};

	const changeProduct = (line: any, e: undefined | KeyboardEvent = undefined) => {
		if (e && e.key !== 'Enter') return;
		const quote = quotes.find((q) => q.id === line.id) as Quote;
		quote.quantity = line.quantity;
		// console.log('quote', quote);
		quotes = [...quotes];
	};

	const recalculate = () => {
		lines = quotes.map((q) => {
			const rate = $ratecard.find((r) => r['id'] === q.id) as Rate;
			return Object.assign(q, {
				editing: false,
				rate: rate['Net Unit Price'],
				uom: rate.UOM,
				name: rate['Product Name'],
				ppm: q.quantity * uomMultiplier(rate?.UOM) * rate['Net Unit Price']
			});
		});
		tpm = lines.map((a) => a.ppm).reduce((a, b) => a + b);
	};

	$: if (quotes.length && $ratecard.length) recalculate();
</script>

<svelte:head>
	<title>Oracle | Ratecard</title>
	<meta name="description" content="oracle ratecard" />
</svelte:head>

<!-- <input
	class="py-0 pl-1 pr-0 m-0 font-mono text-sm border-gray-300 bg-gray-100 dark:bg-gray-700 dark:text-white dark:border-gray-500"
	type="number"
	min="0"
	max="999999999"
	value={1000}
/> -->

{#if $ratecard.length}
	<Heading tag="h2" customSize="my-4 text-4xl font-extrabold">Proposal</Heading>
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
						><TrashBinOutline class="cursor-pointer outline-none w-4 h-4 text-red-600" /></td
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
								class="cursor-pointer outline-none w-4 h-4 text-primary-700"
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
			<tr>
				<td></td>
				<td></td>
				<td></td>
				<td></td>
				<td></td>
				<td class="text-right px-2 text-green-500">Total</td>
				<td class="font-extrabold px-2 text-green-500">EUR {tpm.toFixed(2)}</td>
				<td class="font-extrabold px-2 text-green-500">EUR {(12 * tpm).toFixed(2)}</td>
			</tr>
		</tbody>
	</table>

	<Heading tag="h2" customSize="my-4 text-4xl font-extrabold">Lookup</Heading>
	<Table on:add={addProduct}></Table>
{/if}
