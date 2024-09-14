<script lang="ts">
	import { ratecard, db } from '$lib/db';
	import { Input } from 'flowbite-svelte';
	import { uomMultiplier } from '$lib/parsers/helpers';
	import { SearchOutline, CirclePlusOutline } from 'flowbite-svelte-icons';
	import type { Rate } from '$lib/interfaces/index';

	let ratecardFiltered: Rate[] = [];

	const addProduct = async (rate: Rate) => {
		const count = await db.quotes.where('id').equals(rate['id']).count();
		if (count) return alert(`${rate['Product Name']} aleady added`);
		const quote = { id: rate.id, part: rate['Product Part'], quantity: 1 };
		await db.quotes.add(quote);
	};

	const ratesearch = async (e: null | EventTarget) => {
		const txt = (e as HTMLInputElement).value;
		if (txt.length === 0) ratecardFiltered = $ratecard;
		else {
			const filter = (r: Rate) =>
				JSON.stringify(r).toLocaleLowerCase().includes(txt.toLocaleLowerCase());
			ratecardFiltered = $ratecard.filter(filter);
		}
	};

	$: if ($ratecard) ratecardFiltered = $ratecard;
</script>

<Input type="search" placeholder="search" on:input={(e) => ratesearch(e.target)}>
	<SearchOutline slot="left" class="w-5 h-5 text-gray-500 dark:text-gray-400" />
</Input>

<table class="mt-4 font-mono text-xs">
	<thead>
		<tr>
			<th class="text-left px-2"></th>
			<th class="text-left px-2">Part</th>
			<th class="text-left px-2">Name</th>
			<th class="text-left px-2">UOM</th>
			<th class="text-left px-2">Price</th>
			<th class="text-left px-2">Tier</th>
			<th class="text-left px-2">PPM</th>
		</tr>
	</thead>
	<tbody>
		{#each ratecardFiltered as rate}
			{@const quantity = !Number.isNaN(rate['Max Quantity']) ? rate['Max Quantity'] : ''}
			{@const multiplier = uomMultiplier(rate['UOM'])}
			<tr>
				<td class="px-2" on:click={() => addProduct(rate)}
					><CirclePlusOutline class="outline-none w-5 h-5 text-lightgreen" /></td
				>
				<td class="px-2 font-semibold text-black dark:text-white">{rate['Product Part']}</td>
				<!-- <td class="px-2">{cleanName(rate['Product Name'], rate['UOM'])}</td> -->
				<td class="px-2">{rate['Product Name']}</td>
				<td class="px-2">{rate['UOM']}</td>
				<td class="px-2 font-semibold text-black dark:text-white">{rate['Net Unit Price']}</td>
				<td class="px-2">{quantity}</td>
				<td class="px-2">EUR {(rate['Net Unit Price'] * multiplier).toFixed(2)}</td>
			</tr>
		{/each}
	</tbody>
</table>
