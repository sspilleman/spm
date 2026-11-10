<script lang="ts">
	import { type Snippet } from 'svelte';
	import Header from '#lib/components/Header.svelte';
	import '../app.css';
	import 'iconify-icon';
	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="app">
	<Header></Header>
	<main class="m-0 p-4">
		{@render children()}
	</main>
	<footer></footer>
</div>
