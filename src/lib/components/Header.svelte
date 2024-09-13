<script lang="ts">
	import { parseRatecard, parseUsage, parseComputation } from '$lib/parsers/index';
	import { computation } from '$lib/stores/computation';
	import { usage, ratecard, db } from '$lib/db';
	import { Indicator } from 'flowbite-svelte';
	import { DarkMode } from 'flowbite-svelte';
	import Logo from '$lib/components/Logo.svelte';

	const accept = `text/csv`;
	// const accept = `text/csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`;

	// const load = async () => {
	// 	const c = await parseSampleComputation();
	// 	if (c) computation.set(c);
	// 	const r = await parseSampleRatecard();
	// 	if (r) ratecard.set(r);
	// 	const u = await parseSampleUsage();
	// 	if (u) usage.set(u);
	// };
	// load();

	const change = async (e: null | EventTarget) => {
		let files: FileList = (e as HTMLInputElement).files as FileList;
		// await upload(files);
		for (const file of files) {
			const name = file.name.toLocaleLowerCase();
			if (file.type === 'text/csv' && name.includes('ratecard')) {
				const r = await parseRatecard(file);
				// if (r) ratecard.set(r);
				if (r) {
					await db.rates.clear();
					await db.rates.bulkAdd(r);
				}
			} else if (file.type === 'text/csv' && name.includes('usage')) {
				const u = await parseUsage(file);
				if (u) {
					await db.usage.clear();
					await db.usage.bulkAdd(u);
				}
			} else if (file.type === 'text/csv' && name.includes('computation')) {
				const c = await parseComputation(file);
				if (c) computation.set(c);
			} else {
				alert(`incorect filename or type combo: ${file.name}, ${file.type}`);
			}
		}
	};

	// const upload = async (files: FileList) => {
	// 	const body = new FormData();
	// 	body.set('customer', 'customer');
	// 	for (const file of files) {
	// 		console.log({ name: file.name, type: file.type });
	// 		body.append(file.name, file);
	// 	}
	// 	const url = 'http://localhost:2000/oracle/upload';
	// 	const response = await fetch(url, { method: 'POST', body });
	// 	if (response.ok) {
	// 		console.log('Success:', await response.json());
	// 	} else console.error('Error:', response.statusText);
	// };
</script>

<header class="w-full flex flex-row gap-4 items-center p-3">
	<!-- <div class="w-10">
		<Logo />
	</div>
	<div class="mr-16 flex flex-row gap-4">
		<a href="/" class="">Home</a>
		<a href="/computation" class="">Computation</a>
		<a href="/ratecard" class="">Ratecard</a>
		<a href="/usage" class="">Usage</a>
	</div>
	<div class="text-white">loaded:</div>
	<div>
		ratecard
		{#if $ratecard?.length > 0}
			<Indicator class="inline-block" color="green" />
		{:else}
			<Indicator class="inline-block" color="red" />
		{/if}
	</div>
	<div>
		computation
		{#if $computation?.length > 0}
			<Indicator class="inline-block" color="green" />
		{:else}
			<Indicator class="inline-block" color="red" />
		{/if}
	</div>
	<div>
		usage
		{#if $usage?.length > 0}
			<Indicator class="inline-block" color="green" />
		{:else}
			<Indicator class="inline-block" color="red" />
		{/if}
	</div>
	<div class="grow">
		<input {accept} class="w-full" type="file" multiple on:change={(e) => change(e.target)} />
	</div> -->
	<DarkMode />
</header>
