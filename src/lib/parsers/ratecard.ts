import type { Rate, RateSourceColumns } from "$lib/interfaces/index";
import { readFile } from "$lib/utils";
import * as d3 from "d3";
import { cleanName, newDate } from "./helpers";

let id = 0;

const rowCoverter = (r: d3.DSVRowString<RateSourceColumns>) => {
	const now = new Date();
	let Active = newDate(r["End Date"]) >= now;
	if (Active) Active = newDate(r["Start Date"]) <= now;
	const row = {
		"End Date": newDate(r["End Date"]),
		"Max Quantity": parseFloat(r["Usage Max"]),
		"Net Unit Price": parseFloat(r["Net Unit Price (LC)"]),
		"Product Name": cleanName(r["Product Name"]),
		"Product Part": r["Part Num"],
		"Start Date": newDate(r["Start Date"]),
		Active,
		Discount: parseFloat(r["Rate Card Discount (%)"]),
		id: ++id,
		UOM: r["UOM"],
	} as Rate;
	if (r["Part Num"] === "B110627") console.log(row);
	return row;
};

export const parseRatecard = async (file: File) => {
	const txt = await readFile(file);
	id = 0;
	const rows = await d3.csvParse(txt, rowCoverter);
	rows.pop();
	return rows;
};
