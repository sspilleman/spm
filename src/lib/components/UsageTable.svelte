<script lang="ts">
	import type { Usage } from '../interfaces/index';
	import { Input } from 'flowbite-svelte';
	import { SearchOutline } from 'flowbite-svelte-icons';

	export let usage: Usage[];
	let usageFiltered: Usage[] = [];

	const usagesearch = async (e: null | EventTarget) => {
		if (usage) {
			const txt = (e as HTMLInputElement).value;
			if (txt.length === 0) usageFiltered = [];
			else {
				const filter = (r: Usage) =>
					r['Product Part'].includes(txt) || r['Product Name'].includes(txt);
				usageFiltered = usage.filter(filter);
			}
		}
	};
</script>

<Input type="search" class="mt-4" placeholder="search" on:input={(e) => usagesearch(e.target)}>
	<SearchOutline slot="left" class="w-5 h-5 text-gray-500 dark:text-gray-400" />
</Input>
<table class="mt-4 font-mono text-sm">
	<thead>
		<tr>
			<th class="text-left px-2">Timestamp</th>
			<th class="text-left px-2">Part</th>
			<th class="text-left px-2">Name</th>
			<th class="text-left px-2">UOM</th>
			<th class="text-left px-2">Usage Quantity</th>
		</tr>
	</thead>
	<tbody>
		{#each usageFiltered as usagerecord}
			<tr>
				<td class="px-2">{new Date(usagerecord['Starting Date']).toLocaleString()}</td>
				<td class="px-2 font-semibold text-black dark:text-white">{usagerecord['Product Part']}</td>
				<td class="px-2">{usagerecord['Product Name']}</td>
				<td class="px-2">{usagerecord['UOM']}</td>
				<td class="px-2 font-semibold text-black dark:text-white"
					>{usagerecord['Usage Quantity']}</td
				>
			</tr>
		{/each}
	</tbody>
</table>
