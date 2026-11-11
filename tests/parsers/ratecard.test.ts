import { describe, expect, it, vi } from 'vitest';
import { parseRatecard } from '#lib/parsers/index.ts';
import { uomMultiplier } from '#lib/parsers/helpers.ts';
import { csvFile, dataRows, ratecardCsv, ratecardFile } from '../fixtures.ts';

const header =
	'Row WID,Part Num,Product Name,Start Date,End Date,Net Unit Price (LC),Usage Max,UOM,Rate Card Discount (%)';
const line = (wid: string | number, part: string) =>
	`${wid},${part},Oracle Cloud Infrastructure - Thing,01-Jan-2025,31-Dec-2025,1.5,-,OCPU PER HOUR,10`;
const parse = (...lines: string[]) =>
	parseRatecard(csvFile([header, ...lines].join('\r\n') + '\r\n'));
const ids = async (...lines: string[]) => (await parse(...lines)).map((rate) => rate.id);

describe('parseRatecard with the sample export', async () => {
	const rates = await parseRatecard(ratecardFile());

	it('returns one rate per data row', () => {
		expect(dataRows(ratecardCsv)).toBe(3657);
		expect(rates).toHaveLength(3657);
	});

	it('maps the first row', () => {
		expect({ ...rates[0] }).toEqual({
			'End Date': new Date(2999, 11, 31),
			'Max Quantity': NaN,
			'Net Unit Price': 0.0109,
			'Product Name': 'Compute - Standard - A4 - OCPU - OCPU Per Hour',
			'Product Part': 'B112145',
			'Start Date': new Date(2025, 11, 28),
			Discount: 15,
			id: 951651091,
			UOM: 'OCPU PER HOUR'
		});
	});

	it('maps the last row, including a quantity with thousands separators', () => {
		expect({ ...rates.at(-1) }).toEqual({
			'End Date': new Date(2025, 8, 30),
			'Max Quantity': 999999999999999,
			'Net Unit Price': 27.9,
			'Product Name':
				'Data Safe for On-Premises Databases & Databases on Compute - Target Database Per Month',
			'Product Part': 'B92733',
			'Start Date': new Date(2023, 3, 1),
			Discount: 40,
			id: 371322649,
			UOM: 'TGT DB PR MO'
		});
	});

	it('takes the price from the local-currency column', () => {
		// Row 1: Net Unit Price (USD) is 0.0123, Net Unit Price (LC) is 0.0109
		expect(rates[0]['Net Unit Price']).toBe(0.0109);
	});

	it('does not set Net Unit Price UOM', () => {
		expect(rates.every((rate) => !('Net Unit Price UOM' in rate))).toBe(true);
	});

	it('uses Row WID as the id', () => {
		expect(new Set(rates.map((rate) => rate.id)).size).toBe(rates.length);
		expect(rates.slice(0, 3).map((rate) => rate.id)).toEqual([951651091, 977590591, 900178237]);
	});

	it('parses every price, discount and date', () => {
		expect(rates.filter((rate) => Number.isNaN(rate['Net Unit Price']))).toEqual([]);
		expect(rates.filter((rate) => Number.isNaN(rate.Discount))).toEqual([]);
		expect(
			rates.filter(
				(rate) =>
					Number.isNaN(rate['Start Date'].getTime()) || Number.isNaN(rate['End Date'].getTime())
			)
		).toEqual([]);
	});

	it('leaves Max Quantity as NaN where Usage Max is "-"', () => {
		expect(rates.filter((rate) => Number.isNaN(rate['Max Quantity']))).toHaveLength(2962);
	});

	it('strips the Oracle prefixes from every product name', () => {
		expect(
			rates.filter((rate) => /^(Oracle|Cloud Infrastructure)\b/.test(rate['Product Name']))
		).toEqual([]);
	});

	it('knows the multiplier for every UOM in the export', () => {
		const log = vi.spyOn(console, 'log').mockImplementation(() => {});
		const uoms = [...new Set(rates.map((rate) => rate.UOM))];
		expect(uoms).toHaveLength(110);
		expect(uoms.filter((uom) => uomMultiplier(uom) === 0)).toEqual([]);
		expect(log).not.toHaveBeenCalled();
		log.mockRestore();
	});
});

describe('parseRatecard ids', () => {
	it('takes the id from Row WID', async () => {
		expect(await ids(line(5, 'B1'), line(7, 'B2'), line(0, 'B3'))).toEqual([5, 7, 0]);
	});

	it('numbers the rows from 1 when there is no Row WID column', async () => {
		const file = csvFile(
			'Part Num,Product Name,Start Date,End Date,Net Unit Price (LC),UOM\n' +
				'B1,X,01-Jan-2025,31-Dec-2025,1,EA\n' +
				'B2,Y,01-Jan-2025,31-Dec-2025,2,EA\n'
		);
		expect((await parseRatecard(file)).map((rate) => rate.id)).toEqual([1, 2]);
	});

	it('numbers the rows from 1 when a Row WID repeats', async () => {
		expect(await ids(line(5, 'B1'), line(5, 'B2'), line(9, 'B3'))).toEqual([1, 2, 3]);
	});

	it('numbers the rows from 1 when a Row WID is empty', async () => {
		expect(await ids(line(5, 'B1'), line('', 'B2'))).toEqual([1, 2]);
	});

	it('numbers the rows from 1 when a Row WID is not an integer', async () => {
		expect(await ids(line(5, 'B1'), line('5.5', 'B2'))).toEqual([1, 2]);
		expect(await ids(line(5, 'B1'), line('abc', 'B2'))).toEqual([1, 2]);
	});
});

describe('parseRatecard trailer', () => {
	it('drops a summary line without a part number', async () => {
		expect(
			await ids(line(5, 'B1'), line(7, 'B2'), 'Confidential Oracle Restricted,,,,,,,,')
		).toEqual([5, 7]);
		expect(await ids(line(5, 'B1'), 'Confidential Oracle Restricted')).toEqual([5]);
	});

	it('keeps the last row when it has a part number', async () => {
		expect(await ids(line(5, 'B1'), line(7, 'B2'))).toEqual([5, 7]);
	});
});

describe('parseRatecard input', () => {
	it('ignores a byte order mark', async () => {
		const rates = await parseRatecard(csvFile('﻿' + header + '\n' + line(5, 'B1') + '\n'));
		expect(rates.map((rate) => rate.id)).toEqual([5]);
	});

	it('accepts LF line endings', async () => {
		const rates = await parseRatecard(csvFile(header + '\n' + line(5, 'B1') + '\n'));
		expect(rates.map((rate) => [rate.id, rate['Product Name'], rate.Discount])).toEqual([
			[5, 'Thing', 10]
		]);
	});

	it('keeps non-ASCII characters', async () => {
		const rates = await parse(line(5, 'B1').replace('Thing', 'Café – Überall'));
		expect(rates[0]['Product Name']).toBe('Café – Überall');
	});
});

// Known bugs: each test states the correct result and is marked it.fails, because the code
// does not do this yet. When a fix makes one pass, Vitest reports it as a failure; then
// change it.fails to it.
describe('known bugs', () => {
	it.fails('keeps every row of an older export', async () => {
		// Older exports have Product Part instead of Part Num, so no row has a part number and
		// dropTrailer removes the last real row as if it were a summary line
		const file = csvFile(
			'Row WID,Product Part,Product Name,Start Date,End Date,Net Unit Price,UOM\n' +
				'11,B1,X,01-01-2025,12-31-2025,1,EA\n' +
				'12,B2,Y,01-01-2025,12-31-2025,1,EA\n'
		);
		expect((await parseRatecard(file)).map((rate) => rate.id)).toEqual([11, 12]);
	});
});
