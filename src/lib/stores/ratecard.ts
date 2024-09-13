import { writable } from "svelte/store";
import type { Rate } from "$lib/interfaces/index";

// const c = localStorage.getItem("ratecard");
// const value: Rate[] = c ? JSON.parse(c) : [];

export const ratecard = writable<Rate[]>([]);

// ratecard.subscribe((state) => {
//   localStorage.setItem("ratecard", JSON.stringify(state));
// });

// ratecard.subscribe((state) => {
//     state
//         .filter((r) => r.UOM === "OCPU PER HOUR")
//         .sort((a, b) => b["Net Unit Price"] - a["Net Unit Price"])
//         .forEach((r) => console.log(r));
// });
