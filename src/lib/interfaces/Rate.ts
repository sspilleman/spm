export type RateSourceColumns =
	| "Active"
	| "End Date"
	| "Usage Max"
	| "Net Unit Price UOM"
	| "Net Unit Price (LC)"
	| "Net Unit Price (USD)"
	| "Rate Card Discount (%)"
	| "Product Name"
	| "Part Num"
	| "Start Date"
	| "UOM";
export interface Rate {
	id: number;
	Active: boolean;
	"End Date": Date;
	"Discount": number;
	"Max Quantity": number;
	"Net Unit Price UOM": string;
	"Net Unit Price": number;
	"Product Name": string;
	"Product Part": string;
	"Start Date": Date;
	UOM: string;
}
