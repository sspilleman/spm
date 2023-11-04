<script lang="ts">
	import '../app.postcss';
	import Header from '$lib/components/Header.svelte';
</script>

<div class="app">
	<Header></Header>
	<main class="p-4 m-0">
		<slot />
	</main>
	<footer></footer>
</div>
