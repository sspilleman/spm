<script lang="ts">
	import { ratecard, db } from '$lib/db';
	import { ButtonGroup, Input, InputAddon } from 'svelte-5-ui-lib';
	import { uomMultiplier } from '$lib/parsers/helpers';
	import type { Rate } from '$lib/interfaces/index';

	let ratecardFiltered: Rate[] = $state([]);

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

	$effect(() => {
		if ($ratecard) ratecardFiltered = $ratecard;
	});
</script>

<ButtonGroup class="w-full">
	<InputAddon>
		<iconify-icon class="text-black dark:text-white" icon="mdi:search" height="20" noobserver
		></iconify-icon>
	</InputAddon>
	<Input type="search" placeholder="search" oninput={(e) => ratesearch(e.target)}></Input>
</ButtonGroup>

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
				<td class="px-2 py-0" onclick={() => addProduct(rate)}>
					<iconify-icon
						class="outline-none text-lime-400"
						icon="mdi:plus-circle-outline"
						height="20"
						noobserver
					></iconify-icon>
				</td>
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
