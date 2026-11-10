<script lang="ts">
	import { ratecard, db } from '#lib/db.ts';
	import { ButtonGroup, Input, InputAddon } from 'flowbite-svelte';
	import { displayDate, uomMultiplier } from '#lib/parsers/helpers.ts';
	import type { Rate } from '#lib/interfaces/index.ts';
	import Icon from '#lib/components/Icon.svelte';

	let query = $state('');

	const ratecardFiltered = $derived.by(() => {
		const rates: Rate[] = $ratecard ?? [];
		if (query.length === 0) return rates;
		const txt = query.toLocaleLowerCase();
		return rates.filter((r) => r.Active && JSON.stringify(r).toLocaleLowerCase().includes(txt));
	});

	const addProduct = async (rate: Rate) => {
		const count = await db.quotes.where('id').equals(rate['id']).count();
		if (count) return alert(`${rate['Product Name']} aleady added`);
		const quote = { id: rate.id, part: rate['Product Part'], quantity: 1 };
		await db.quotes.add(quote);
	};
</script>

<ButtonGroup class="w-full">
	<InputAddon>
		<Icon icon="search" size={20} class="text-black dark:text-white" />
	</InputAddon>
	<Input type="search" placeholder="search" bind:value={query}></Input>
</ButtonGroup>

<table class="mt-4 font-mono text-xs">
	<thead>
		<tr>
			<th class="px-2 text-left"></th>
			<th class="px-2 text-left">Part</th>
			<th class="px-2 text-left">Name</th>
			<th class="px-2 text-left">UOM</th>
			<th class="px-2 text-left">Price</th>
			<th class="px-2 text-left">Tier</th>
			<th class="px-2 text-left">PPM</th>
			<th class="px-2 text-left">Discount</th>
			<th class="px-2 text-left">Start</th>
			<th class="px-2 text-left">End</th>
		</tr>
	</thead>
	<tbody>
		{#each ratecardFiltered as rate (rate.id)}
			{@const quantity = !Number.isNaN(rate['Max Quantity'])
				? rate['Max Quantity'].toLocaleString('en-US')
				: ''}
			{@const multiplier = uomMultiplier(rate['UOM'])}
			<tr>
				<td class="px-2 py-0" onclick={() => addProduct(rate)}>
					<Icon icon="plus-circle-outline" size={20} class="text-lime-400" />
				</td>
				<td class="px-2 font-semibold text-black dark:text-white">{rate['Product Part']}</td>
				<!-- <td class="px-2">{cleanName(rate['Product Name'], rate['UOM'])}</td> -->
				<td class="px-2">{rate['Product Name']}</td>
				<td class="px-2">{rate['UOM']}</td>
				<td class="px-2 font-semibold text-black dark:text-white">{rate['Net Unit Price']}</td>
				<td class="px-2">{quantity}</td>
				<td class="px-2">EUR {(rate['Net Unit Price'] * multiplier).toFixed(2)}</td>
				<td class="px-2">{rate.Discount.toFixed(0)}%</td>
				<td class="px-2">{displayDate(rate['Start Date'])}</td>
				<td class="px-2">{displayDate(rate['End Date'])}</td>
			</tr>
		{/each}
	</tbody>
</table>
