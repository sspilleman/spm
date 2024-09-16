import type { Usage, UsageSourceColumns } from '$lib/interfaces/index';
import { readFile } from '$lib/utils';
import * as d3 from 'd3';
import { cleanName } from './helpers';

const rowCoverter = (r: d3.DSVRowString<UsageSourceColumns>) => {
	const pp = r['Product'].split(` - `);
	const [part, name] = [pp[0], pp.slice(1).join(` - `)];
	//   console.log(r);
	return {
		'Product Name': cleanName(name),
		'Product Part': part,
		'Starting Date': new Date(r['Starting Date']).getTime(),
		'Usage Quantity': parseFloat(r['Usage Quantity']),
		UOM: r['UOM']
	} as Usage;
};

export const parseUsage = async (file: File) => {
	const txt = await readFile(file);
	const rows = await d3.csvParse(txt, rowCoverter);
	rows.pop();
	return rows;
};
