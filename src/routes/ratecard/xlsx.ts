import type { Line } from "$lib/interfaces/index";
import { read, utils, type WorkBook, type WorkSheet } from "xlsx";
import { writeFile } from "xlsx";

export const getWorkBook = async (): Promise<WorkBook> => {
    const url = "/sizing.xlsx";
    const file: ArrayBuffer = await (await fetch(url)).arrayBuffer();
    const workbook: WorkBook = read(file, {
        type: "binary",
        cellDates: true,
        cellStyles: true,
        cellFormula: true,
        cellHTML: true,
        cellNF: true,
        WTF: true,
    });
    return workbook;
    // const sheet: WorkSheet = sheets["Quote"];
    // const rows = utils.sheet_to_json(sheets["WCC on OCI"]);
    // console.log(rows)
};

export const exportToXls = async (lines: Line[]) => {
    const workbook = await getWorkBook();
    const worksheet: WorkSheet = workbook.Sheets["Quote"];
    let line = 5;
    const aoa = lines.map((l) => {
        const ppm = l.multiplier === 1
            ? { t: "n", f: `G${line}` }
            : { t: "n", f: `$D$2*${l.rate}` };
        ++line;
        return [
            l.name,
            l.part,
            l.uom,
            l.quantity,
            l.rate,
            ppm,
        ];
    });
    utils.sheet_add_aoa(worksheet, aoa, { origin: "C5" });
    writeFile(workbook, "formulae.xlsx", {
        compression: true,
        cellStyles: true,
    });
};
