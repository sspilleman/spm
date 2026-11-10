import type { Rate, RateSourceColumns } from '#lib/interfaces/index.ts';
import { readFile } from '#lib/utils.ts';
import * as d3 from 'd3';
import { cleanName, dropTrailer, newDate, parseQuantity } from './helpers';

const rowCoverter = (r: d3.DSVRowString<RateSourceColumns>) => {
	const row = {
		'End Date': newDate(r['End Date']),
		'Max Quantity': parseQuantity(r['Usage Max']),
		'Net Unit Price': parseFloat(r['Net Unit Price (LC)']),
		'Product Name': cleanName(r['Product Name']),
		'Product Part': r['Part Num'],
		'Start Date': newDate(r['Start Date']),
		Discount: parseFloat(r['Rate Card Discount (%)']),
		id: Number(r['Row WID'] || NaN),
		UOM: r['UOM']
	} as Rate;
	return row;
};

export const parseRatecard = async (file: File) => {
	const txt = await readFile(file);
	const rows = await d3.csvParse(txt, rowCoverter);
	dropTrailer(rows, (row) => !!row['Product Part']);
	// Oracle's Row WID identifies a rate, so a quote keeps pointing at the same rate after a new
	// ratecard is loaded. Without a usable Row WID, fall back to row numbers.
	const unique = new Set(rows.map((row) => row.id)).size === rows.length;
	if (!unique || !rows.every((row) => Number.isSafeInteger(row.id)))
		rows.forEach((row, i) => (row.id = i + 1));
	return rows;
};
