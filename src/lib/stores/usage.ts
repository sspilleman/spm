import { writable } from "svelte/store";
import type { Usage } from "$lib/interfaces/index";

// const c = localStorage.getItem("usage");
// const value: Usage[] = c ? JSON.parse(c) : [];

export const usage = writable<Usage[]>([]);

// usage.subscribe((state) => {
//   localStorage.setItem("usage", JSON.stringify(state));
// });
