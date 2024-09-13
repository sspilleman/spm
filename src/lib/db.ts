import Dexie, { type EntityTable } from "dexie";
import { liveQuery } from "dexie";
import type { Quote, Rate, Usage } from "$lib/interfaces/index";

const db = new Dexie("spm") as Dexie & {
    rates: EntityTable<Rate, "id">;
    quotes: EntityTable<Quote, "id">;
    usage: EntityTable<Usage, "Product Part">;
};

db.version(1).stores({ rates: "id", quotes: "id", usage: "++id" });

const ratecard = liveQuery(() => db.rates.toArray());
const usage = liveQuery(() => db.usage.toArray());
const quotes = liveQuery(() => db.quotes.toArray());

export { db, quotes, ratecard, usage };
