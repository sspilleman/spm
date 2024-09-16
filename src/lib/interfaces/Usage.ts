export type UsageSourceColumns = 'Product' | 'Starting Date' | 'UOM' | 'Usage Quantity';

export interface Usage {
	'Starting Date': number;
	'Usage Quantity': number;
	UOM: string;
	'Product Name': string;
	'Product Part': string;
}
