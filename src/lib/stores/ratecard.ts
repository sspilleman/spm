import { writable } from "svelte/store";
import type { Rate } from "$lib/interfaces/index";

// const c = localStorage.getItem("ratecard");
// const value: Rate[] = c ? JSON.parse(c) : [];

export const ratecard = writable<Rate[]>([]);

// ratecard.subscribe((state) => {
//   localStorage.setItem("ratecard", JSON.stringify(state));
// });
