<script lang="ts">
	import '../app.postcss';
	import Header from './Header.svelte';
	import { DarkMode } from 'flowbite-svelte';
</script>

<div class="app">
	<header class="absolute top-0 right-0 p-2">
		<div class="flex flex-row gap-2">
			<DarkMode />
			<!-- <div class="w-10 h-10">
			<Logo />
		  </div> -->
		</div>
	</header>

	<main class="px-6 py-4 m-0">
		<slot />
	</main>

	<footer></footer>
</div>
