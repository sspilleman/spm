import type { RateStatus } from '#lib/parsers/helpers.ts';

export interface Quote {
	id: number;
	part: string;
	quantity: number;
}

export interface Line extends Quote {
	/** The quote's rate is not in the loaded ratecard, so the line is not priced */
	missing: boolean;
	/** Whether the line's rate is valid today */
	status: RateStatus;
	rate: number;
	uom: string;
	name: string;
	ppm: number;
	multiplier: number;
	discount: number;
}
