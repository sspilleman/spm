import { describe, expect, it } from 'vitest';
import { cleanName, readFile } from '#lib/utils.ts';

describe('cleanName (lib/utils.ts, for the Excel export)', () => {
	// Product names and UOMs as they appear in the sample ratecard after parsing
	it.each([
		[
			'Compute - Standard - A4 - OCPU - OCPU Per Hour',
			'OCPU PER HOUR',
			'Compute - Standard - A4 - OCPU'
		],
		['Compute - GPU - B300 - GPU Per Hour', 'GPU PER HOUR', 'Compute - GPU - B300'],
		[
			'Database Autonomous Recovery Service - Cloud Protect - Virtualized GB Per Month',
			'VIRT GB PR MO',
			'Database Autonomous Recovery Service - Cloud Protect'
		],
		['AI Data Platform - AI Data Platform Unit', 'AI DATA PTFM UNIT', 'AI Data Platform'],
		[
			'Internet of Things Platform - Additional Storage - Gigabyte Storage Capacity Per Month',
			'GB STORAGE CAP PER MO',
			'Internet of Things Platform - Additional Storage'
		],
		[
			'Exadata Cloud@Customer - Database ECPU - Developer - ECPU Per Hour',
			'ECPU PR HR',
			'Exadata Cloud@Customer - Database ECPU - Developer'
		],
		[
			'Compute - Standard - A4 - Memory - Gigabyte Per Hour',
			'GB PR HR',
			'Compute - Standard - A4 - Memory'
		],
		[
			'Generative AI - Model Import - AI Unit Per Hour',
			'AI UN PR HR',
			'Generative AI - Model Import'
		],
		['FastConnect 400 Gbps - Port Hour', 'PORT HOUR', 'FastConnect 400 Gbps'],
		[
			'Generative AI - Large Cohere - 10,000 Transactions',
			'10000 TRANSACTIONS',
			'Generative AI - Large Cohere'
		],
		[
			'Cloud Guard Instance Security Adhoc Queries Enterprise - Request',
			'REQUEST',
			'Cloud Guard Instance Security Adhoc Queries Enterprise'
		],
		[
			'MySQL Database - Outbound Data Transfer - Inter OCI Region - Gigabyte Outbound Data Transfer Per Month',
			'GB OUTBOUND DATA TX MO',
			'MySQL Database - Outbound Data Transfer - Inter OCI Region'
		],
		[
			'Roving Edge Device - RED.2 Compute - Resource Possession Per Day',
			'RSRC POSS PR DY',
			'Roving Edge Device - RED.2 Compute'
		],
		[
			'File Storage Service - High Performance Mount Target - Performance Units Per Gigabyte Per Month',
			'PERF UN PR GB PR MO',
			'File Storage Service - High Performance Mount Target'
		]
	])('turns %j (%s) into %j', (name, uom, expected) => {
		expect(cleanName(name, uom)).toBe(expected);
	});

	it('keeps a name whose last word is not part of the UOM', () => {
		expect(cleanName('Batch - Each', 'EA')).toBe('Batch - Each');
	});

	it('trims leading spaces and the dash before the removed UOM words', () => {
		expect(cleanName('  Thing - Hour', 'HR')).toBe('Thing');
	});
});

describe('readFile', () => {
	it('decodes UTF-8 and strips a byte order mark', async () => {
		const file = new File([new Uint8Array([0xef, 0xbb, 0xbf]), 'Café,Ü'], 'x.csv');
		expect(await readFile(file)).toBe('Café,Ü');
	});
});

// Known bugs: each test states the correct result and is marked it.fails, because the code
// does not do this yet. When a fix makes one pass, Vitest reports it as a failure; then
// change it.fails to it.
describe('known bugs', () => {
	it.fails('removes "1000000 Tokens" for the UOM 1M TOKN', () => {
		// Today the result ends in "- 1000000"
		expect(
			cleanName(
				'Generative AI - Google - Gemini 2.5 Pro - Output Tokens - Text Output greater than 200K input tokens - 1000000 Tokens',
				'1M TOKN'
			)
		).toBe(
			'Generative AI - Google - Gemini 2.5 Pro - Output Tokens - Text Output greater than 200K input tokens'
		);
	});

	it.fails('removes "Gigabyte (GB) of Data Transferred" for the UOM GB OF DATA TRANSFERRED', () => {
		// Today the result ends in "- Gigabyte (GB)"
		expect(
			cleanName(
				'MySQL Database - AWS - Private inbound and outbound network traffic - Gigabyte (GB) of Data Transferred',
				'GB OF DATA TRANSFERRED'
			)
		).toBe('MySQL Database - AWS - Private inbound and outbound network traffic');
	});
});
