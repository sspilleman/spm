import type { Rate } from "$lib/interfaces/index";
import { readFile } from "$lib/XlsHelper";
import * as d3 from "d3";
import { cleanName, parseMDYDate } from "./helpers";

type SourceColumns =
  | "Active"
  | "End Date"
  | "Max Quantity"
  | "Net Unit Price UOM"
  | "Net Unit Price"
  | "Product Name"
  | "Product Part"
  | "Start Date"
  | "UOM";

let id = 0;

const rowCoverter = (r: d3.DSVRowString<SourceColumns>) => {
  return {
    id: ++id,
    "End Date": parseMDYDate(r["End Date"]),
    "Max Quantity": parseFloat(r["Max Quantity"]),
    "Net Unit Price": parseFloat(r["Net Unit Price"]),
    "Product Name": cleanName(r["Product Name"]),
    "Product Part": r["Product Part"],
    "Start Date": parseMDYDate(r["Start Date"]),
    Active: r["Active"] === "true" ? true : false,
    UOM: r["UOM"],
  } as Rate;
};

export const parseSampleRatecard = async () => {
  const url = "https://s3.spilleman.nl/shared/ratecard.csv";
  id = 0;
  const rows = await d3.csv(url, rowCoverter);
  rows.pop();
  return rows;
};

export const parseRatecard = async (file: File) => {
  const txt = await readFile(file);
  id = 0;
  const rows = await d3.csvParse(txt, rowCoverter);
  rows.pop();
  return rows;
};
