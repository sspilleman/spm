<script lang="ts">
	import type { SVGAttributes } from 'svelte/elements';
	import { icons, type IconName } from './icons.ts';

	interface Props extends SVGAttributes<SVGSVGElement> {
		icon: IconName;
		/** Width and height in pixels */
		size?: number;
	}

	let { icon, size = 16, ...rest }: Props = $props();
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	viewBox="0 0 24 24"
	width={size}
	height={size}
	fill="currentColor"
	aria-hidden="true"
	{...rest}
>
	<path d={icons[icon]} />
</svg>
