import type { Line } from '#lib/interfaces/index.ts';
import Excel, { type Row, type Workbook, type Worksheet } from 'exceljs';
import { cleanName } from '#lib/utils.ts';
import { DAYS_PER_MONTH, HOURS_PER_MONTH } from '#lib/parsers/helpers.ts';

const type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

const getWorkBook = async (): Promise<Workbook> => {
	const url = '/sizing.xlsx';
	const arrayBuffer: ArrayBuffer = await (await fetch(url)).arrayBuffer();
	const workbook = new Excel.Workbook();
	return await workbook.xlsx.load(arrayBuffer);
};

// Proposal lines start on this row of the template
const FIRST_ROW = 5;

// The number of lines the template can take: its line rows end just above the "Total" row
const capacity = (worksheet: Worksheet) => {
	for (let row = FIRST_ROW; row <= worksheet.rowCount; row++) {
		if (worksheet.getCell(`B${row}`).value === 'Total') return row - FIRST_ROW;
	}
	return Infinity;
};

const changeWorkBook = (workbook: Workbook, lines: Line[]) => {
	const worksheet: Worksheet | undefined = workbook.getWorksheet('Quote');
	if (!worksheet) return false;
	const max = capacity(worksheet);
	if (lines.length > max) {
		// Writing more lines would overwrite the Total row
		alert(
			`The Excel template has room for ${max} lines and this proposal has ${lines.length}. ` +
				`Remove lines, or add rows to static/sizing.xlsx.`
		);
		return false;
	}
	let idx = FIRST_ROW;
	for (const line of lines) {
		const row: Row = worksheet.getRow(idx);
		// D2 holds the hours per month
		let formula = `G${idx}`;
		if (line.multiplier === HOURS_PER_MONTH) formula = `$D$2*G${idx}`;
		else if (line.multiplier === DAYS_PER_MONTH) formula = `$D$2/24*G${idx}`;
		row.getCell('C').value = cleanName(line.name, line.uom);
		row.getCell('D').value = line.part;
		row.getCell('E').value = line.uom;
		row.getCell('F').value = line.quantity;
		row.getCell('G').value = line.rate;
		row.getCell('H').value = { formula };
		++idx;
	}
	return true;
};

const downloadWorkBook = async (workbook: Workbook) => {
	const buffer = await workbook.xlsx.writeBuffer();
	const blob = new Blob([buffer], { type });
	const link = document.createElement('a');
	link.href = URL.createObjectURL(blob);
	link.download = 'formulae.xlsx';
	link.click();
	URL.revokeObjectURL(link.href);
};

export const exportToXls = async (lines: Line[]) => {
	const workbook: Workbook = await getWorkBook();
	const success = changeWorkBook(workbook, lines);
	if (success) await downloadWorkBook(workbook);
};
