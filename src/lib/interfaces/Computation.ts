export type ComputationSourceColumns =
	| 'Subscription Plan Number'
	| 'Subscription Id'
	| 'SKU/Product'
	| 'UOM'
	| 'Usage Quantity'
	| 'Compute Type'
	| 'Metered Service Date'
	| 'Currency'
	| 'Computed Amount'
	| 'Computed Amount CD'
	| 'Overage'
	| 'Data Center'
	| 'Unit Rate Card';

export interface Computation {
	'Subscription Plan Number': string;
	'Subscription Id': string;
	SKU: string;
	Product: string;
	UOM: string;
	'Usage Quantity': number;
	'Compute Type': string;
	'Metered Service Date': Date;
	Currency: string;
	'Computed Amount': number;
	'Computed Amount CD': number;
	Overage: boolean;
	'Data Center': string;
	'Unit Rate Card': number;
}
