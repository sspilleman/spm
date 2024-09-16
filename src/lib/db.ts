import Dexie, { type EntityTable } from 'dexie';
import { liveQuery } from 'dexie';
import type { Computation, Quote, Rate, Usage } from '$lib/interfaces/index';

const db = new Dexie('spm') as Dexie & {
	rates: EntityTable<Rate, 'id'>;
	quotes: EntityTable<Quote, 'id'>;
	usage: EntityTable<Usage, 'Product Part'>;
	computation: EntityTable<Computation, 'SKU'>;
};

db.version(1).stores({
	rates: 'id',
	quotes: 'id',
	usage: '++id',
	computation: '++id,SKU'
});

const ratecard = liveQuery(() => db.rates.toArray());
const usage = liveQuery(() => db.usage.toArray());
const quotes = liveQuery(() => db.quotes.toArray());
const computation = liveQuery(() => db.computation.toArray());

export { computation, db, quotes, ratecard, usage };
