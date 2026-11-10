import type { Action } from 'svelte/action';
import Highcharts from 'highcharts';

// Takes a function, not the options themselves: an action runs once, so reading the options
// inside the effect is what makes the chart get rebuilt when they change.
export const highcharts: Action<HTMLElement, () => Highcharts.Options> = (
	node: HTMLElement,
	options: () => Highcharts.Options
) => {
	// const test = () => {
	//     // node.dispatchEvent(new CustomEvent("titleclick"));
	//     console.log("dblclick", options);
	// };

	$effect(() => {
		const chart = Highcharts.chart(node, options());
		// let title: Element | undefined;
		// setTimeout(() => {
		//     const titles = node.getElementsByClassName("highcharts-title");
		//     title = titles[0];
		//     // title.addEventListener("dblclick", test);
		// }, 300);

		return () => {
			// title?.removeEventListener("dblclick", test);
			chart.destroy();
		};
	});
};
