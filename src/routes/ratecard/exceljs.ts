import type { Line } from "$lib/interfaces/index";
import Excel, { type Row, type Workbook, type Worksheet } from "exceljs";
import { cleanName } from "$lib/utils";

const type =
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

const getWorkBook = async (): Promise<Workbook> => {
    const url = "/sizing.xlsx";
    const arrayBuffer: ArrayBuffer = await (await fetch(url)).arrayBuffer();
    const workbook = new Excel.Workbook();
    return await workbook.xlsx.load(arrayBuffer);
};

const changeWorkBook = (workbook: Workbook, lines: Line[]) => {
    const worksheet: Worksheet | undefined = workbook.getWorksheet("Quote");
    if (worksheet) {
        // console.log(worksheet.getCell("I11").value);
        let idx = 5;
        for (const line of lines) {
            const row: Row = worksheet.getRow(idx);
            const formula = line.multiplier === 1 ? `G${idx}` : `$D$2*G${idx}`;
            row.getCell("C").value = cleanName(line.name, line.uom);
            row.getCell("D").value = line.part;
            row.getCell("E").value = line.uom;
            row.getCell("F").value = line.quantity;
            row.getCell("G").value = line.rate;
            row.getCell("H").value = { formula };
            ++idx;
        }
        return true;
    }
    return false;
};

const downloadWorkBook = async (workbook: Workbook) => {
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "formulae.xlsx";
    link.click();
    URL.revokeObjectURL(link.href);
};

export const exportToXls = async (lines: Line[]) => {
    const workbook: Workbook = await getWorkBook();
    const success = changeWorkBook(workbook, lines);
    if (success) await downloadWorkBook(workbook);
};
