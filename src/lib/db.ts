import Dexie, { type EntityTable } from 'dexie';
import { liveQuery } from 'dexie';
import type { Computation, Quote, Rate } from '#lib/interfaces/index.ts';

const db = new Dexie('spm') as Dexie & {
	rates: EntityTable<Rate, 'id'>;
	quotes: EntityTable<Quote, 'id'>;
	computation: EntityTable<Computation, 'SKU'>;
};

db.version(1).stores({
	rates: 'id',
	quotes: 'id',
	computation: '++id,SKU'
});

const ratecard = liveQuery(() => db.rates.toArray());
const quotes = liveQuery(() => db.quotes.toArray());
const computation = liveQuery(() => db.computation.toArray());

export { computation, db, quotes, ratecard };
