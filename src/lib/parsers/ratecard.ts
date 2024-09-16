import type { Rate, RateSourceColumns } from '$lib/interfaces/index';
import { readFile } from '$lib/utils';
import * as d3 from 'd3';
import { cleanName, parseMDYDate } from './helpers';

let id = 0;

const rowCoverter = (r: d3.DSVRowString<RateSourceColumns>) => {
	return {
		id: ++id,
		'End Date': parseMDYDate(r['End Date']),
		'Max Quantity': parseFloat(r['Max Quantity']),
		'Net Unit Price': parseFloat(r['Net Unit Price']),
		'Product Name': cleanName(r['Product Name']),
		'Product Part': r['Product Part'],
		'Start Date': parseMDYDate(r['Start Date']),
		Active: r['Active'] === 'true' ? true : false,
		UOM: r['UOM']
	} as Rate;
};

export const parseRatecard = async (file: File) => {
	const txt = await readFile(file);
	id = 0;
	const rows = await d3.csvParse(txt, rowCoverter);
	rows.pop();
	return rows;
};
