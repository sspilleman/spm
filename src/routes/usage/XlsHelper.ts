/* eslint-disable @typescript-eslint/no-explicit-any */
import { read } from "xlsx";
import type { WorkBook } from "xlsx";
// import type { Range, WorkBook, WorkSheet } from "xlsx";

// interface Cell {
//   v: any; // every cell has v
//   t: any;
//   w: any;
//   cell: any;
//   f: any;
//   l: {
//     // link
//     Target: string;
//     Tooltip: string;
//   };
//   F: any; // always undefined
// }

// function isUndef(columns: any[], start: number, end: number) {
//   for (let i = start; i <= end; i++) {
//     if (columns[i] !== undefined) {
//       return false;
//     }
//   }
//   return true;
// }

// function hasValues(columns: any[], start: number, end: number) {
//   for (let i = start; i <= end; i++) {
//     if (columns[i] === undefined) {
//       return false;
//     }
//   }
//   return true;
// }

// function hasOwnProperty<X extends {}, Y extends PropertyKey>(
//   obj: X,
//   prop: Y,
// ): obj is X & Record<Y, unknown> {
//   return obj.hasOwnProperty(prop);
// }

// function extractDate(arr: string[][]) {
//   for (let r = 0; r < arr.length; r++) {
//     if (arr[r][1] === "Global Price List") {
//       return arr[r + 1][1];
//     }
//   }
//   return undefined;
// }

// function extractFx(arr: any[]) {
//   const filtered = arr.slice(-100).filter((row) => {
//     return isUndef(row, 1, 11) && hasValues(row, 12, 15) &&
//       isUndef(row, 17, 49);
//   });
//   return filtered.map((row) => {
//     return {
//       country: row[12],
//       currency: row[13],
//       rate: row[14],
//       other: row[15],
//     };
//   });
// }

// function extractSections(arr: any[]) {
//   const set = new Set();
//   for (let r = 0; r < arr.length; r++) {
//     const row = arr[r];
//     if (
//       isUndef(row, 1, 1) && hasValues(row, 2, 2) && isUndef(row, 3, 31) &&
//       isUndef(row, 33, 49) && row[32] === "Prices in US Dollar"
//     ) {
//       set.add(row[2]);
//     }
//   }
//   return Array.from(set);
// }

// const metrics: Record<string, boolean> = {
//   "1 Million Messages": true,
//   "1 SMS Message Sent": true,
//   "1,000 Emails Sent": true,
//   "1,000 Events Per Hour": true,
//   "1,000 Requests per Month": true,
//   "1,000 Requests Per Month": true,
//   "1,000 Transactions": true,
//   "1,000,000 API Calls Per Month": true,
//   "1,000,000 DNS Traffic Management Queries": true,
//   "1,000,000 Function Invocations": true,
//   "1,000,000 Incoming Requests Per Month": true,
//   "1,000,000 Incoming Requests": true,
//   "1,000,000 Queries": true,
//   "10 Monitor Runs Per Hour": true,
//   "10,000 API Calls Per Month": true,
//   "10,000 Audit Records Per Target Per Month": true,
//   "10,000 Gigabyte Memory-Seconds": true,
//   "10,000 Requests per Month": true,
//   "10,000 Requests Per Month": true,
//   "100 Entities Per Hour": true,
//   "100,000 Events Per Hour": true,
//   "20K Messages Per Hour": true,
//   "250 Video Assets per Month": true,
//   "300 Gigabytes Per Hour": true,
//   "5,000 Assets Per Month": true,
//   "5K Messages Per Hour": true,
//   "Day": true,
//   "Each": true,
//   "Endpoints Per Month": true,
//   "Execution Hour": true,
//   "Gateway Per Hour": true,
//   "GB of Data Processed": true,
//   "Gigabyte Data Capacity Per Hour": true,
//   "Gigabyte Log Storage Per Month": true,
//   "Gigabyte Memory Per Hour": true,
//   "Gigabyte Memory Per Month": true,
//   "Gigabyte of Data Processed Per Hour": true,
//   "Gigabyte of Good Traffic Per Month": true,
//   "Gigabyte Of Good Traffic": true,
//   "Gigabyte Outbound Data Transfer per Month": true,
//   "Gigabyte Outbound Data Transfer Per Month": true,
//   "Gigabyte Per Hour": true,
//   "Gigabyte Storage Capacity Per Month": true,
//   "Gigabyte Storage Capacity per Month": true, // dup
//   "Gigabyte Storage Retrieved Per Month": true,
//   "Gigabytes of Data Transferred": true,
//   "GPU Per Hour": true,
//   "Host CPU Core Per Hour": true,
//   "Hosted Connection Per Month": true,
//   "Hosted Employee Per Month": true,
//   "Hosted Environment Per Hour": true,
//   "Hosted Environment Per Month": true,
//   "Hosted Environment": true,
//   "Hosted Named User Per Month": true,
//   "Hosted Named User": true,
//   "Hosted Nodes": true,
//   "Increases Cloud balance by 1 (one) currency unit, for use to purchase Oracle Analytics Public Cloud Services.":
//     true,
//   "Increases Cloud balance by 1 (one) currency unit, for use to purchase Oracle Big Data Public Cloud Services.":
//     true,
//   "Increases Cloud balance by 1 (one) currency unit, for use to purchase Oracle Database Public Cloud Services.":
//     true,
//   "Increases Cloud balance by 1 (one) currency unit, for use to purchase Oracle IaaS Public Cloud Services.":
//     true,
//   "Increases Cloud balance by 1 (one) currency unit, for use to purchase Oracle Middleware Public Cloud Services.":
//     true,
//   "Interactions Per Month": true,
//   "Key Version Per Month": true,
//   "Load Balancer Hour": true,
//   "Logging Analytics Storage Unit Per Hour": true,
//   "Mbps Per Hour": true,
//   "Metric": true,
//   "Migration Hour": true,
//   "Million Datapoints": true,
//   "Million Delivery Options": true,
//   "Monitored Account Per Hour": true,
//   "Monitored App Per Hour": true,
//   "Monitored Service User Per Hour": true,
//   "Node Per Hour": true,
//   "OCPU Per Hour": true,
//   "OCPU Per Month": true,
//   "OCPU": true,
//   "One Million IO Requests Per Month": true,
//   "Performance Units Per Gigabyte Per Month": true,
//   "Port Hour": true,
//   "Private Pool": true,
//   "Ravello Compute Hour": true,
//   "Read Unit Per Month": true,
//   "Request": true,
//   "Static IP Per Hour": true,
//   "Storage Pack Per Month": true,
//   "Target Database Per Month": true,
//   "TB of Storage Capacity": true,
//   "Terabyte Storage Capacity Per Month": true,
//   "User Per Month": true,
//   "vCPU Per Hour": true,
//   "Virtual Machine IP Per Hour": true,
//   "Virtual Private Vault Per Hour": true,
//   "VPN Connection": true,
//   "Workspace Usage Per Hour": true,
//   "Write Unit Per Month": true,
// };

// function findMetric(row: any[]) {
//   for (let i = 8; i < row.length; i++) {
//     if (metrics[row[i]]) {
//       return i;
//     }
//   }
//   return undefined;
// }

// function extractRows(arr: any[]) {
//   // const set = new Set();
//   const filtered = arr.filter((row) => {
//     const hasService = hasValues(row, 2, 2);
//     const hasPrice = hasValues(row, 14, 14) && hasValues(row, 16, 16) &&
//       hasValues(row, 18, 18);
//     const hasCode = hasValues(row, 32, 32) &&
//       row[32].toString().startsWith("B") && row[32] !== "B88206";
//     const ok = hasService && (hasPrice || hasCode);
//     // if (ok) {
//     //   if (typeof row[14] === "string") set.add(row[14]);
//     //   if (typeof row[14] === "string") set.add(row[16]);
//     //   if (typeof row[14] === "string") set.add(row[18]);
//     // }
//     return ok;
//   });
//   // console.log(Array.from(set));
//   return filtered.map((row) => {
//     const obj = {
//       row: row[0],
//       service: row[2],
//       payg: row[14],
//       uc: row[16],
//       metric: row[18],
//       code: row[32],
//       source: row,
//     };
//     const metric = findMetric(row);
//     if (metric) {
//       obj.payg = row[metric - 4];
//       obj.uc = row[metric - 2];
//       obj.metric = row[metric];
//     }
//     return obj;
//   });
// }

// function parse(arr: string[][]) {
//   // console.log(arr);
//   const date = extractDate(arr);
//   const fx = extractFx(arr);
//   const sections = extractSections(arr);
//   const records = extractRows(arr);
//   console.log({ date, fx, sections, records });
//   return { date, fx, sections, records };
// }

export function getWorkbook(binary: string) {
  const workbook: WorkBook = read(binary, {
    type: "binary",
    cellText: false,
    cellDates: true,
    cellStyles: false,
  });
  //   const sheet = workbook.Sheets["Oracle PaaS and IaaS Price List"];
  //   const sheet = workbook.Sheets[`Scenario 2`];
  //   return sheet;
  return workbook.Sheets;
  //   const arr = sheet2arr(sheet);
  //   return parse(arr);
}

export function readFile(file: File): Promise<string> {
  const fileReader = new FileReader();
  return new Promise((resolve) => {
    fileReader.onload = function (e: ProgressEvent<FileReader>) {
      return resolve(e.target?.result as string);
    };
    fileReader.readAsBinaryString(file);
  });
}

// function sheet2arr(sheet: WorkSheet) {
//   const rows = [];
//   const range: Range = utils.decode_range(<string> sheet["!ref"]);
//   for (let rowNum = range.s.r; rowNum <= range.e.r; rowNum++) {
//     const columns: any[] = [rowNum + 1];
//     let valueCount = 0;
//     for (let colNum = range.s.c; colNum <= range.e.c; colNum++) {
//       const cellID: string = utils.encode_cell({ r: rowNum, c: colNum });
//       const cell: Cell = sheet[cellID];
//       if (typeof cell === "undefined") {
//         columns.push(void 0);
//       } else {
//         cell.cell = cellID;
//         if (cell.t === "s") {
//           cell.v = cell.v.trim()
//             .replace(/\n/g, "<br>")
//             .replace(/ {1,}/g, " ");
//         }
//         if (
//           cell.t === "s" && cell.v.trim() === ""
//         ) {
//           cell.v = undefined;
//         } else {
//           valueCount++;
//         }
//         // if (
//         //   cell.t === "s" && cell.v &&
//         //   cell.v.startsWith("Section 4 - Government")
//         // ) {
//         //   console.log(rowNum + 1, cell);
//         // }
//         columns.push(cell.v);
//       }
//     }
//     // const obj = {
//     //   row: rowNum + 1,
//     //   service: columns[1],
//     //   payg: columns[13],
//     //   uc: columns[15],
//     //   metric: columns[17],
//     //   comments: columns[21],
//     //   limits: columns[23],
//     //   notes: columns[29],
//     //   code: columns[31],
//     //   source: columns,
//     // };
//     // if (
//     //   valueCount > 0 &&
//     //   obj.service &&
//     //   obj.payg &&
//     //   obj.uc &&
//     //   obj.metric &&
//     //   obj.code &&
//     //   obj.code.toString &&
//     //   obj.code.toString().startsWith("B")
//     // ) {
//     //   rows.push(obj);
//     // }
//     // columns.push(rowNum + 1);
//     if (valueCount > 0) rows.push(columns);
//   }
//   return rows;
// }
