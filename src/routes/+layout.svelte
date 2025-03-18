<script lang="ts">
	import { type Snippet } from 'svelte';
	import Header from '$lib/components/Header.svelte';
	import '../app.postcss';
	import 'iconify-icon';
	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="app">
	<Header></Header>
	<main class="p-4 m-0">
		{@render children()}
	</main>
	<footer></footer>
</div>
