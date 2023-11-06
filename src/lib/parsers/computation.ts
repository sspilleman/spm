import type { Computation } from "$lib/interfaces/index";
import { readFile } from "$lib/XlsHelper";
import * as d3 from "d3";
import { cleanName, parseMDYDate } from "./helpers";

type SourceColumns =
  | "Computed Quantity"
  | "Line Net Amount Increased Precision"
  | "Metered service date"
  | "Net Unit Price"
  | "Product"
  | "UOM"
  | "Usage Quantity";

const rowCoverter = (r: d3.DSVRowString<SourceColumns>) => {
  const pp = r["Product"].split(` - `);
  const [part, name] = [pp[0], pp.slice(1).join(` - `)];
  return {
    "Computed Quantity": parseFloat(r["Computed Quantity"]),
    "Line Net Amount Increased Precision": parseFloat(
      r["Line Net Amount Increased Precision"],
    ),
    "Metered service date": parseMDYDate(r["Metered service date"]),
    "Net Unit Price": parseFloat(r["Net Unit Price"]),
    "Product Name": cleanName(name),
    "Product Part": part,
    UOM: r["UOM"],
    "Usage Quantity": parseFloat(r["Usage Quantity"]),
  } as Computation;
};

export const parseSampleComputation = async () => {
  const url = "https://s3.spilleman.nl/shared/computation.csv";
  const rows: Computation[] = await d3.csv(url, rowCoverter);
  rows.pop();
  return rows;
};

export const parseComputation = async (file: File) => {
  const txt = await readFile(file);
  const rows = await d3.csvParse(txt, rowCoverter);
  rows.pop();
  return rows;
};
