import { writable } from 'svelte/store';
import type { Computation } from '$lib/interfaces/index';

// const c = localStorage.getItem("computation");
// const value: Computation[] = c ? JSON.parse(c) : [];

export const computation = writable<Computation[]>([]);

// computation.subscribe((state) => {
//   localStorage.setItem("computation", JSON.stringify(state));
// });
