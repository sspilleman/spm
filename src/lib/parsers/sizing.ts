/* eslint-disable @typescript-eslint/no-explicit-any */
import { read, utils } from 'xlsx';
import type { Range, WorkBook, WorkSheet } from 'xlsx';

interface Cell {
	d: any; // every cell has v
	v: any; // every cell has v
	t: any;
	w: any;
	cell: any;
	f: any;
	l: {
		// link
		Target: string;
		Tooltip: string;
	};
	F: any; // always undefined
}

export const parseSizing = async () => {
	const url = '/sizing.xlsx';
	const file: ArrayBuffer = await (await fetch(url)).arrayBuffer();
	const sheets = getSheets(file);
	const sheet: WorkSheet = sheets['WCC on OCI'];
	sheet2arr(sheet);
	// const rows = utils.sheet_to_json(sheets["WCC on OCI"]);
	// console.log(rows)
};

export function getSheets(binary: string | ArrayBuffer) {
	const workbook: WorkBook = read(binary, {
		type: 'binary',
		cellDates: true,
		cellStyles: true,
		cellNF: true,
		WTF: true
	});
	//   const sheet = workbook.Sheets["Oracle PaaS and IaaS Price List"];
	return workbook.Sheets;
}

function sheet2arr(sheet: WorkSheet) {
	const range: Range = utils.decode_range(<string>sheet['!ref']);
	console.log('range', range);
	const rows = [];
	for (let rowNum = range.s.r; rowNum <= range.e.r; rowNum++) {
		const columns = [];
		for (let colNum = range.s.c; colNum <= range.e.c; colNum++) {
			const id: string = utils.encode_cell({ r: rowNum, c: colNum });
			const cell: Cell = sheet[id];
			columns.push({ id, cell });
		}
		rows.push(columns);
	}
	console.log(rows);
}
