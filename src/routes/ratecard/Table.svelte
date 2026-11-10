<script lang="ts">
	import { ratecard, db } from '#lib/db.ts';
	import { ButtonGroup, Input, InputAddon, Toggle } from 'flowbite-svelte';
	import { displayDate, rateStatus, statusLabel, uomMultiplier } from '#lib/parsers/helpers.ts';
	import type { Rate } from '#lib/interfaces/index.ts';
	import Icon from '#lib/components/Icon.svelte';

	let query = $state('');
	// Off by default: only rates that are valid today are listed
	let showInactive = $state(false);

	const now = new Date();
	const rates = $derived<Rate[]>($ratecard ?? []);
	const statuses = $derived(new Map(rates.map((r) => [r.id, rateStatus(r, now)])));
	const validCount = $derived(rates.filter((r) => statuses.get(r.id) === 'active').length);

	const ratecardFiltered = $derived.by(() => {
		const txt = query.toLocaleLowerCase();
		return rates.filter(
			(r) =>
				(showInactive || statuses.get(r.id) === 'active') &&
				(txt.length === 0 || JSON.stringify(r).toLocaleLowerCase().includes(txt))
		);
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

<div class="mt-3 flex flex-row flex-wrap items-center gap-x-6 gap-y-2 text-sm">
	<Toggle bind:checked={showInactive}>Show expired rates</Toggle>
	<span>
		{validCount.toLocaleString('en-US')} of {rates.length.toLocaleString('en-US')} rates are valid today.
		{#if !showInactive}
			{(rates.length - validCount).toLocaleString('en-US')} expired rates are hidden.
		{/if}
	</span>
</div>

{#if showInactive}
	<div
		role="status"
		class="mt-3 rounded border-2 border-poppy bg-poppy/10 px-3 py-2 text-sm font-semibold text-poppy"
	>
		Expired rates are shown. A row marked "expired" is an old price that is no longer valid: use it
		to look a price up, not for a new quote.
	</div>
{/if}

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
			<th class="px-2 text-left">Status</th>
		</tr>
	</thead>
	<tbody>
		{#each ratecardFiltered as rate (rate.id)}
			{@const quantity = !Number.isNaN(rate['Max Quantity'])
				? rate['Max Quantity'].toLocaleString('en-US')
				: ''}
			{@const multiplier = uomMultiplier(rate['UOM'])}
			{@const status = statuses.get(rate.id) ?? 'active'}
			<tr class={status === 'active' ? '' : 'bg-poppy/10'}>
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
				<td class="px-2">
					{#if status === 'active'}
						<span class="text-lime-500">{statusLabel[status]}</span>
					{:else}
						<span class="rounded bg-poppy px-1 font-semibold text-white">{statusLabel[status]}</span
						>
					{/if}
				</td>
			</tr>
		{/each}
	</tbody>
</table>
