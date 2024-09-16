import type { Computation, ComputationSourceColumns } from '$lib/interfaces/index';
import { readFile } from '$lib/utils';
import * as d3 from 'd3';
import { cleanName, parseYMDDate } from './helpers';

const rowCoverter = (r: d3.DSVRowString<ComputationSourceColumns>) => {
	const pp = r['SKU/Product'].split(` - `);
	const [part, name] = [pp[0], pp.slice(1).join(` - `)];
	return {
		'Subscription Plan Number': r['Subscription Plan Number'],
		'Subscription Id': r['Subscription Id'],
		SKU: part,
		Product: cleanName(name),
		UOM: r['UOM'],
		'Usage Quantity': parseFloat(r['Usage Quantity']),
		'Compute Type': r['Compute Type'],
		'Metered Service Date': parseYMDDate(r['Metered Service Date']),
		Currency: r['Currency'],
		'Computed Amount': parseFloat(r['Computed Amount']),
		'Computed Amount CD': parseFloat(r['Computed Amount CD']),
		Overage: r['Overage'] === 'false' ? false : true,
		'Data Center': r['Data Center'],
		'Unit Rate Card': parseFloat(r['Unit Rate Card'])
	} as Computation;
};

export const parseComputation = async (file: File) => {
	const txt = await readFile(file);
	const rows = await d3.csvParse(txt, rowCoverter);
	rows.pop();
	return rows;
};
