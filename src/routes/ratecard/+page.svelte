<script lang="ts">
	import { Input } from 'flowbite-svelte';
	import { ratecard } from '$lib/stores/index';
	import { SearchOutline } from 'flowbite-svelte-icons';
	import type { Rate } from '$lib/interfaces/index';

	let ratecardFiltered: Rate[] = [];

	const ratesearch = async (e: null | EventTarget) => {
		if (ratecard) {
			const txt = (e as HTMLInputElement).value;
			if (txt.length === 0) ratecardFiltered = [];
			else if (txt.toLocaleLowerCase() === `all`) ratecardFiltered = $ratecard;
			else {
				const filter = (r: Rate) =>
					JSON.stringify(r).toLocaleLowerCase().includes(txt.toLocaleLowerCase());
				ratecardFiltered = $ratecard.filter(filter);
			}
		}
	};
</script>

<svelte:head>
	<title>Oracle | Ratecard</title>
	<meta name="description" content="oracle ratecard" />
</svelte:head>

<Input type="search" placeholder="search" on:input={(e) => ratesearch(e.target)}>
	<SearchOutline slot="left" class="w-5 h-5 text-gray-500 dark:text-gray-400" />
</Input>

<table class="mt-4 font-mono text-sm">
	<thead>
		<tr>
			<th class="text-left px-2">Part</th>
			<th class="text-left px-2">Name</th>
			<th class="text-left px-2">UOM</th>
			<th class="text-left px-2">Price</th>
			<th class="text-left px-2">Tier</th>
		</tr>
	</thead>
	<tbody>
		{#each ratecardFiltered as rate}
			{@const quantity = !Number.isNaN(rate['Max Quantity']) ? rate['Max Quantity'] : ''}
			<tr>
				<td class="px-2 font-semibold text-black dark:text-white">{rate['Product Part']}</td>
				<td class="px-2">{rate['Product Name']}</td>
				<td class="px-2">{rate['UOM']}</td>
				<td class="px-2 font-semibold text-black dark:text-white">{rate['Net Unit Price']}</td>
				<td class="px-2">{quantity}</td>
			</tr>
		{/each}
	</tbody>
</table>
