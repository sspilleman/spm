import type { Computation,Rate,Usage } from "$lib/interfaces/index";
import { readFile } from "./XlsHelper";

const splitValues = (line: string) => {
  const result: string[] = [];
  const values = line.split(`,`);
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (value === ``) result.push(value);
    else if (value === `""`) result.push(``);
    else if (/^[\d.]+$/.test(value)) result.push(value);
    else if (value.startsWith(`"`) && value.endsWith(`"`)) {
      result.push(value.replace(/(^"|"$)/g, ""));
    } else if (value.startsWith(`"`)) {
      const idx = values.slice(i + 1).findIndex((s) => s.endsWith(`"`));
      const end = i + idx + 1;
      result.push(values.slice(i, end + 1).join(`,`).replace(/(^"|"$)/g, ""));
      i = end;
    }
  }
  return result;
};

export const parseRatecard = async (file: File) => {
  const mandatory = [
    "Active",
    "End Date",
    "Max Quantity",
    "Net Unit Price UOM",
    "Net Unit Price",
    "Product Name",
    "Product Part",
    "Start Date",
    "UOM",
  ];
  const txt = await readFile(file);
  const lines = txt.split("\n");
  const first = mandatory.reduce((prev, cur) => {
    return prev && lines[0].includes(cur);
  }, true);
  const last = lines.at(-1)?.includes(`Confidential Oracle Restricted`);
  if (first && last) {
    const records = ratecardToRecords(lines);
    return records;
  } else {alert(
      `${file.text} format incorrect: (mandatory fields: ${first}, last line: ${last})`,
    );}
};

export const ratecardToRecords = (lines: string[]) => {
  const result: Rate[] = [];
  const fields = splitValues(lines[0]);
  const records = lines.slice(1, -1);
  for (const line of records) {
    const values = splitValues(line);
    const rate: Rate = {} as Rate;
    for (let i = 0; i < values.length; i++) {
      const [key, value] = [fields[i], values[i]];
      switch (key) {
        case "Active":
          rate[key] = value.toLocaleLowerCase() === "true" ? true : false;
          break;
        case "Product Name":
        case "Product Part":
        case "UOM":
          rate[key] = value.replace("Oracle Cloud Infrastructure - ", "");
          break;
        case "Max Quantity":
        case "Net Unit Price":
          rate[key] = parseFloat(value);
          break;
        case "End Date":
        case "Start Date": {
          const r = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value);
          if (r && r.length === 4) {
            const d = new Date("1972-09-10T00:00:00");
            d.setDate(parseInt(r[2], 10));
            d.setMonth(parseInt(r[1], 10) - 1);
            d.setFullYear(parseInt(r[3], 10));
            rate[key] = d;
          }
          break;
        }
      }
    }
    result.push(rate);
  }
  return result;
};

export const parseUsage = async (file: File) => {
  const mandatory = [
    "Active",
    "Ending Date",
    "Product",
    "Starting Date",
    "UOM",
    "Usage Quantity",
  ];
  const txt = await readFile(file);
  const lines = txt.split("\n");
  const first = mandatory.reduce((prev, cur) => {
    return prev && lines[0].includes(cur);
  }, true);
  const last = lines.at(-1)?.includes(`Confidential Oracle Restricted`);
  if (first && last) {
    const records = usageToRecords(lines);
    return records;
  } else {alert(
      `${file.text} format incorrect: (mandatory fields: ${first}, last line: ${last})`,
    );}
};

export const usageToRecords = (lines: string[]) => {
  const fields = splitValues(lines[0]);
  const result: Usage[] = [];
  const records = lines.slice(1, -1);
  for (const line of records) {
    const values = splitValues(line);
    const usage: Usage = {} as Usage;
    for (let i = 0; i < values.length; i++) {
      const [key, value] = [fields[i], values[i]];
      switch (key) {
        case "Product": {
          const splitted = value.split(` - `);
          const [part, name] = [splitted[0], splitted.slice(1).join(` - `)];
          usage["Product Part"] = part;
          usage["Product Name"] = name
            .replace("Oracle Cloud Infrastructure - ", "")
            .replace(/Oracle Cloud Infrastructure /, "")
            .replace(/Oracle /, "");
          break;
        }
        case "UOM":
          usage[key] = value;
          break;
        case "Usage Quantity":
          usage[key] = parseFloat(value);
          break;
        case "Active":
          usage[key] = value.toLocaleLowerCase() === "true" ? true : false;
          break;
        case "Starting Date":
        case "Ending Date": {
          usage[key] = new Date(value).getTime();
          break;
        }
      }
    }
    result.push(usage);
  }
  return result;
};

export const parseComputation = async (file: File) => {
  const mandatory = [
    "Computed Quantity",
    "Line Net Amount Increased Precision",
    "Metered service date",
    "Net Unit Price",
    "Product",
    "UOM",
    "Usage Quantity",
  ];
  const txt = await readFile(file);
  const lines = txt.split("\n");
  const first = mandatory.reduce((prev, cur) => {
    return prev && lines[0].includes(cur);
  }, true);
  const last = lines.at(-1)?.includes(`Confidential Oracle Restricted`);
  if (first && last) {
    const records = computationToRecords(lines);
    return records;
  } else {alert(
      `${file.text} format incorrect: (mandatory fields: ${first}, last line: ${last})`,
    );}
};

export const computationToRecords = (lines: string[]) => {
  const fields = splitValues(lines[0]);
  const result: Computation[] = [];
  const records = lines.slice(1, -1);
  for (const line of records) {
    const values = splitValues(line);

    const computation: Computation = {} as Computation;
    for (let i = 0; i < values.length; i++) {
      const [key, value] = [fields[i], values[i]];
      switch (key) {
        case "Product": {
          const splitted = value.split(` - `);
          const [part, name] = [splitted[0], splitted.slice(1).join(` - `)];
          computation["Product Part"] = part;
          computation["Product Name"] = name
            .replace("Oracle Cloud Infrastructure - ", "")
            .replace(/Oracle Cloud Infrastructure /, "")
            .replace(/Oracle /, "");
          break;
        }
        case "UOM":
          computation[key] = value;
          break;
        case "Computed Quantity":
        case "Line Net Amount Increased Precision":
        case "Net Unit Price":
        case "Usage Quantity":
          computation[key] = parseFloat(value);
          break;
        case "Metered service date": {
          const r = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value);
          if (r && r.length === 4) {
            const d = new Date("1972-09-10T00:00:00");
            d.setDate(parseInt(r[2], 10));
            d.setMonth(parseInt(r[1], 10) - 1);
            d.setFullYear(parseInt(r[3], 10));
            computation[key] = d;
          }
          break;
        }
      }
    }
    result.push(computation);
    // if (line.includes(`B91364`)) {
    //   console.log({ line, fields, values, computation });
    // }
  }
  return result;
};
