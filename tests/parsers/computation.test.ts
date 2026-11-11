import { describe, expect, it } from 'vitest';
import { parseComputation } from '#lib/parsers/index.ts';
import { computationCsv, computationFile, csvFile, dataRows } from '../fixtures.ts';

const header =
	'"Subscription Plan Number","Subscription Id","SKU/Product","UOM","Usage Quantity","Compute Type","Metered Service Date","Currency","Computed Amount","Computed Amount CD","Overage","Data Center","Unit Rate Card"';
const line = (product: string, overage = 'false', date = '2024-09-14') =>
	`"1","2","${product}","OCPU PER HOUR","1.5","USAGE","${date}","EUR","3","4","${overage}","eu-frankfurt-1","0.5"`;
const parse = (...lines: string[]) =>
	parseComputation(csvFile([header, ...lines].join('\n') + '\n'));

describe('parseComputation with the sample export', async () => {
	const records = await parseComputation(computationFile());

	it('returns one record per data row', () => {
		expect(dataRows(computationCsv)).toBe(5214);
		expect(records).toHaveLength(5214);
	});

	it('maps the first row', () => {
		expect(records[0]).toEqual({
			'Subscription Plan Number': '11334480',
			'Subscription Id': '7811090',
			SKU: 'B88319',
			Product: 'Load Balancer Capacity - Metered',
			UOM: 'LOAD BALANCER HOUR',
			'Usage Quantity': 4,
			'Compute Type': 'USAGE-UCM-ANNUAL',
			'Metered Service Date': new Date(2024, 8, 14, 2),
			Currency: 'EUR',
			'Computed Amount': 0.08,
			'Computed Amount CD': 0.09,
			Overage: false,
			'Data Center': 'eu-frankfurt-1',
			'Unit Rate Card': 0.01683765
		});
	});

	it('maps the last row', () => {
		expect(records.at(-1)).toEqual({
			'Subscription Plan Number': '11334480',
			'Subscription Id': '7811090',
			SKU: 'B91364',
			Product: 'Gen 2 Exadata Cloud at Customer - Database OCPU - BYOL - Metered',
			UOM: 'OCPU PER HOUR',
			'Usage Quantity': 6240,
			'Compute Type': 'USAGE-UCM-ANNUAL',
			'Metered Service Date': new Date(2024, 6, 1, 2),
			Currency: 'EUR',
			'Computed Amount': 1404,
			'Computed Amount CD': 1521.51,
			Overage: false,
			'Data Center': 'eu-frankfurt-1',
			'Unit Rate Card': 0.2250135
		});
	});

	it('finds 45 SKUs between 1 Jul and 14 Sep 2024', () => {
		expect(new Set(records.map((record) => record.SKU)).size).toBe(45);
		const times = records.map((record) => record['Metered Service Date'].getTime());
		expect(new Date(Math.min(...times))).toEqual(new Date(2024, 6, 1, 2));
		expect(new Date(Math.max(...times))).toEqual(new Date(2024, 8, 14, 2));
	});

	it('parses every number', () => {
		const numbers = records.flatMap((record) => [
			record['Usage Quantity'],
			record['Computed Amount'],
			record['Computed Amount CD'],
			record['Unit Rate Card']
		]);
		expect(numbers.filter(Number.isNaN)).toEqual([]);
	});

	it('has no overage records', () => {
		expect(records.filter((record) => record.Overage)).toEqual([]);
	});
});

describe('parseComputation fields', () => {
	it('splits SKU/Product at the first " - " and cleans the product name', async () => {
		const [record] = await parse(
			line('B90453 - Oracle Cloud Infrastructure - Autonomous Transaction Processing - Compute')
		);
		expect(record.SKU).toBe('B90453');
		expect(record.Product).toBe('Autonomous Transaction Processing - Compute');
	});

	it('reads Overage "true" as true and "false" as false', async () => {
		const records = await parse(line('B1 - X', 'true'), line('B2 - Y', 'false'));
		expect(records.map((record) => record.Overage)).toEqual([true, false]);
	});

	it('uses 10 Sep 1972 for a date in another format', async () => {
		const [record] = await parse(line('B1 - X', 'false', '14-09-2024'));
		expect(record['Metered Service Date']).toEqual(new Date(1972, 8, 10, 2));
	});

	it('drops a summary line without a SKU', async () => {
		const records = await parse(line('B1 - X'), line('B2 - Y'), 'Confidential Oracle Restricted');
		expect(records.map((record) => record.SKU)).toEqual(['B1', 'B2']);
	});
});

// Known bugs: each test states the correct result and is marked it.fails, because the code
// does not do this yet. When a fix makes one pass, Vitest reports it as a failure; then
// change it.fails to it.
describe('known bugs', () => {
	it.fails('reads an empty Overage cell as false', async () => {
		// Today every value other than "false" counts as overage
		const [record] = await parse(line('B1 - X', ''));
		expect(record.Overage).toBe(false);
	});
});
