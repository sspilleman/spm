export interface Quote {
	id: number;
	part: string;
	quantity: number;
}

export interface Line extends Quote {
	editing: boolean;
	rate: number;
	uom: string;
	name: string;
	ppm: number;
	multiplier: number;
}
