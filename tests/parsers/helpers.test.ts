import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	cleanName,
	DAYS_PER_MONTH,
	displayDate,
	dropTrailer,
	HOURS_PER_MONTH,
	newDate,
	parseMDYDate,
	parseQuantity,
	parseYMDDate,
	rateStatus,
	statusLabel,
	uomMultiplier
} from '#lib/parsers/helpers.ts';

// Dates are created in local time, so the assertions use local getters and the Date
// constructor with local fields. They hold in any time zone.
const local = (d: Date) => [
	d.getFullYear(),
	d.getMonth() + 1,
	d.getDate(),
	d.getHours(),
	d.getMinutes()
];

afterEach(() => {
	vi.restoreAllMocks();
});

describe('uomMultiplier', () => {
	it('has 730 hours and 730 / 24 days per month', () => {
		expect(HOURS_PER_MONTH).toBe(730);
		expect(DAYS_PER_MONTH).toBe(730 / 24);
	});

	it.each(['EA', 'GB PR MO', 'TGT DB PR MO', 'USER PER MONTH', '1M TOKN', 'REQUEST'])(
		'returns 1 for the monthly or per-unit UOM %s',
		(uom) => {
			expect(uomMultiplier(uom)).toBe(1);
		}
	);

	it.each(['OCPU PER HOUR', 'ECPU PR HR', 'GB PR HR', 'CLST HR', 'GIGABYTE MEMORY PER HOUR'])(
		'returns HOURS_PER_MONTH for the hourly UOM %s',
		(uom) => {
			expect(uomMultiplier(uom)).toBe(HOURS_PER_MONTH);
		}
	);

	it('returns DAYS_PER_MONTH for the daily UOM RSRC POSS PR DY', () => {
		expect(uomMultiplier('RSRC POSS PR DY')).toBe(DAYS_PER_MONTH);
	});

	it('returns 0 and logs an unknown UOM', () => {
		const log = vi.spyOn(console, 'log').mockImplementation(() => {});
		expect(uomMultiplier('NOT A UOM')).toBe(0);
		expect(log).toHaveBeenCalledExactlyOnceWith('==>NOT A UOM unknown');
	});

	it('matches UOMs exactly, so case and spacing matter', () => {
		vi.spyOn(console, 'log').mockImplementation(() => {});
		expect(uomMultiplier('gb pr mo')).toBe(0);
		expect(uomMultiplier(' GB PR MO')).toBe(0);
	});

	it('does not log a known UOM', () => {
		const log = vi.spyOn(console, 'log').mockImplementation(() => {});
		uomMultiplier('EA');
		expect(log).not.toHaveBeenCalled();
	});
});

describe('dropTrailer', () => {
	const hasKey = (row: { key: string }) => !!row.key;

	it('drops the last row when it has no key value', () => {
		const rows = [{ key: 'a' }, { key: 'b' }, { key: '' }];
		expect(dropTrailer(rows, hasKey)).toEqual([{ key: 'a' }, { key: 'b' }]);
	});

	it('keeps the last row when it has a key value', () => {
		const rows = [{ key: 'a' }, { key: 'b' }];
		expect(dropTrailer(rows, hasKey)).toEqual([{ key: 'a' }, { key: 'b' }]);
	});

	it('drops at most one row', () => {
		const rows = [{ key: 'a' }, { key: '' }, { key: '' }];
		expect(dropTrailer(rows, hasKey)).toEqual([{ key: 'a' }, { key: '' }]);
	});

	it('only looks at the last row', () => {
		const rows = [{ key: '' }, { key: 'a' }];
		expect(dropTrailer(rows, hasKey)).toEqual([{ key: '' }, { key: 'a' }]);
	});

	it('changes and returns the array it is given', () => {
		const rows = [{ key: 'a' }, { key: '' }];
		expect(dropTrailer(rows, hasKey)).toBe(rows);
		expect(rows).toHaveLength(1);
	});

	it('accepts an empty array', () => {
		expect(dropTrailer([], hasKey)).toEqual([]);
	});
});

describe('newDate (ratecard dates, dd-MMM-yyyy)', () => {
	it('parses to local midnight', () => {
		expect(local(newDate('28-Dec-2025'))).toEqual([2025, 12, 28, 0, 0]);
		expect(local(newDate('31-Dec-2999'))).toEqual([2999, 12, 31, 0, 0]);
	});

	it('accepts a lower-case month', () => {
		expect(local(newDate('28-dec-2025'))).toEqual([2025, 12, 28, 0, 0]);
	});

	it.each(['2025-12-28', '12-28-2025', '31-Feb-2024', ''])(
		'returns an invalid date for %j',
		(value) => {
			expect(Number.isNaN(newDate(value).getTime())).toBe(true);
		}
	);
});

describe('parseYMDDate (computation dates, yyyy-MM-dd)', () => {
	it('parses to 02:00 local time', () => {
		expect(local(parseYMDDate('2024-09-14'))).toEqual([2024, 9, 14, 2, 0]);
		expect(local(parseYMDDate('2024-01-31'))).toEqual([2024, 1, 31, 2, 0]);
	});

	it.each(['2024-9-14', '14-09-2024', '2024/09/14', ''])(
		'returns 10 Sep 1972 02:00 for the unmatched value %j',
		(value) => {
			expect(local(parseYMDDate(value))).toEqual([1972, 9, 10, 2, 0]);
		}
	);
});

describe('parseMDYDate (older ratecard dates, MM-dd-yyyy)', () => {
	it('parses to 02:00 local time', () => {
		expect(local(parseMDYDate('12-31-2025'))).toEqual([2025, 12, 31, 2, 0]);
		expect(local(parseMDYDate('02-29-2024'))).toEqual([2024, 2, 29, 2, 0]);
	});

	it.each(['2025-12-31', '31-Dec-2025', '1-1-2025', ''])(
		'returns 10 Sep 1972 02:00 for the unmatched value %j',
		(value) => {
			expect(local(parseMDYDate(value))).toEqual([1972, 9, 10, 2, 0]);
		}
	);
});

describe('displayDate', () => {
	it('formats as dd MMM yyyy', () => {
		expect(displayDate(new Date(2025, 11, 28))).toBe('28 Dec 2025');
		expect(displayDate(new Date(2025, 0, 5, 23, 59))).toBe('05 Jan 2025');
	});
});

describe('parseQuantity', () => {
	it.each([
		['300', 300],
		['12.5', 12.5],
		['999,999,999', 999999999],
		['999,999,999,999,999', 999999999999999],
		// Commas are always thousands separators, never a decimal comma
		['1,5', 15]
	])('parses %j as %d', (value, expected) => {
		expect(parseQuantity(value)).toBe(expected);
	});

	it.each(['-', '', undefined])('returns NaN for %j', (value) => {
		expect(parseQuantity(value)).toBeNaN();
	});
});

describe('rateStatus', () => {
	const rate = { 'Start Date': new Date(2025, 0, 1), 'End Date': new Date(2025, 11, 31) };

	it('is active from the start of the start date', () => {
		expect(rateStatus(rate, new Date(2025, 0, 1))).toBe('active');
	});

	it('is upcoming before the start date', () => {
		expect(rateStatus(rate, new Date(2024, 11, 31, 23, 59, 59, 999))).toBe('upcoming');
	});

	it('is active through the whole of the end date', () => {
		expect(rateStatus(rate, new Date(2025, 11, 31, 23, 59, 59, 999))).toBe('active');
	});

	it('is expired after the end date', () => {
		expect(rateStatus(rate, new Date(2026, 0, 1))).toBe('expired');
	});

	it('does not change the rate it is given', () => {
		rateStatus(rate, new Date(2025, 5, 1));
		expect(rate['End Date']).toEqual(new Date(2025, 11, 31));
	});

	it('uses the current time by default', () => {
		const open = { 'Start Date': new Date(2000, 0, 1), 'End Date': new Date(2999, 11, 31) };
		const past = { 'Start Date': new Date(2000, 0, 1), 'End Date': new Date(2000, 11, 31) };
		const future = { 'Start Date': new Date(2999, 0, 1), 'End Date': new Date(2999, 11, 31) };
		expect(rateStatus(open)).toBe('active');
		expect(rateStatus(past)).toBe('expired');
		expect(rateStatus(future)).toBe('upcoming');
	});

	it('has a label for each status', () => {
		expect(statusLabel).toEqual({
			active: 'valid',
			expired: 'expired',
			upcoming: 'not yet valid'
		});
	});
});

describe('cleanName (parsers/helpers.ts)', () => {
	it.each([
		['Oracle Cloud Infrastructure - Compute - Standard', 'Compute - Standard'],
		['Oracle Cloud Infrastructure Compute', 'Compute'],
		['Oracle Cloud Infrastructure-Compute', 'Compute'],
		['Cloud Infrastructure - Load Balancer Capacity - Metered', 'Load Balancer Capacity - Metered'],
		['Oracle TimesTen for Oracle Cloud', 'TimesTen for Oracle Cloud'],
		['Autonomous Transaction Processing - Shared', 'Autonomous Transaction Processing - Shared'],
		['', '']
	])('turns %j into %j', (value, expected) => {
		expect(cleanName(value)).toBe(expected);
	});

	it('only strips prefixes at the start', () => {
		expect(cleanName('Data Safe for Oracle Cloud Infrastructure - Databases')).toBe(
			'Data Safe for Oracle Cloud Infrastructure - Databases'
		);
	});
});

// Known bugs: each test states the correct result and is marked it.fails, because the code
// does not do this yet. When a fix makes one pass, Vitest reports it as a failure; then
// change it.fails to it.
describe('known bugs', () => {
	it.fails('parseYMDDate returns 10 Sep 1972 for a day that does not exist', () => {
		// Today 2024-02-30 rolls over to 1 Mar 2024
		expect(local(parseYMDDate('2024-02-30'))).toEqual([1972, 9, 10, 2, 0]);
	});

	it.fails('parseMDYDate returns 10 Sep 1972 for a day that does not exist', () => {
		// Today 02-30-2024 rolls over to 1 Mar 2024
		expect(local(parseMDYDate('02-30-2024'))).toEqual([1972, 9, 10, 2, 0]);
	});
});
