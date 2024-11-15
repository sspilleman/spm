export type RateSourceColumns =
	| 'Active'
	| 'End Date'
	| 'Max Quantity'
	| 'Net Unit Price UOM'
	| 'Net Unit Price'
	| 'Product Name'
	| 'Product Part'
	| 'Start Date'
	| 'UOM';
export interface Rate {
	id: number;
	Active: boolean;
	'End Date': Date;
	'Max Quantity': number;
	'Net Unit Price UOM': string;
	'Net Unit Price': number;
	'Product Name': string;
	'Product Part': string;
	'Start Date': Date;
	UOM: string;
}
