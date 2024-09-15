<script lang="ts">
	import Table from './Table.svelte';
	import Proposal from './Proposal.svelte';
	import { ratecard, quotes } from '$lib/db';
	import { Heading } from 'flowbite-svelte';
</script>

<svelte:head>
	<title>Oracle | Ratecard</title>
	<meta name="description" content="oracle ratecard" />
</svelte:head>

{#if $quotes && $quotes.length > 0}
	<Heading tag="h2" customSize="my-4 text-4xl font-extrabold">Proposal</Heading>
	<Proposal></Proposal>
{/if}

{#if $ratecard && $ratecard.length}
	<Heading tag="h2" customSize="my-4 text-4xl font-extrabold">Lookup</Heading>
	<Table></Table>
{/if}
