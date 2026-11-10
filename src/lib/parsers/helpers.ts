import { format, parse } from 'date-fns';

export const newDate = (value: string) => {
	return parse(value, 'dd-MMM-yyyy', new Date());
};

export const displayDate = (value: Date) => {
	return format(value, 'dd MMM yyyy');
};

// Dates are built in one step, at 02:00 local time. Setting day, month and year one by one
// on a fixed base date rolls over: day 31 on a 30-day base month becomes the 1st.
const localDate = (year: string, month: string, day: string) =>
	new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10), 2);

// Returned when the value does not match the expected format
const unknownDate = () => new Date('1972-09-10T02:00:00');

export const parseMDYDate = (value: string) => {
	const r = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value);
	return r ? localDate(r[3], r[1], r[2]) : unknownDate();
};

export const parseYMDDate = (value: string) => {
	const r = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
	return r ? localDate(r[1], r[2], r[3]) : unknownDate();
};

// Oracle writes large quantities with thousands separators ("999,999,999"), and parseFloat
// alone stops at the first comma
export const parseQuantity = (value: string | undefined) =>
	parseFloat((value ?? '').replace(/,/g, ''));

// Some Oracle exports end with a summary line such as "Confidential Oracle Restricted".
// Drop the last row only when it is that line (it has no key value), never a real record.
export const dropTrailer = <T>(rows: T[], hasKey: (row: T) => boolean) => {
	const last = rows.at(-1);
	if (last && !hasKey(last)) rows.pop();
	return rows;
};

export const cleanName = (value: string) =>
	value
		.replace(/^Oracle Cloud Infrastructure *-* */, '')
		.replace(/^Cloud Infrastructure *-* */, '')
		.replace(/^Oracle /, '');

export const splitValues = (line: string) => {
	const result: string[] = [];
	const values = line.split(`,`);
	for (let i = 0; i < values.length; i++) {
		const value = values[i];
		if (value === ``) result.push(value);
		else if (value === `""`) result.push(``);
		else if (/^[\d.]+$/.test(value)) result.push(value);
		else if (value.startsWith(`"`) && value.endsWith(`"`)) {
			result.push(value.replace(/(^"|"$)/g, ''));
		} else if (value.startsWith(`"`)) {
			const idx = values.slice(i + 1).findIndex((s) => s.endsWith(`"`));
			const end = i + idx + 1;
			result.push(
				values
					.slice(i, end + 1)
					.join(`,`)
					.replace(/(^"|"$)/g, '')
			);
			i = end;
		}
	}
	return result;
};

export const HOURS_PER_MONTH = 730;
export const DAYS_PER_MONTH = HOURS_PER_MONTH / 24;

export const uomMultiplier = (uom: string) => {
	switch (uom) {
		case '1 SMS MSG SENT':
		case '1000 EMAILS SENT':
		case '1000 REQUESTS PER MONTH':
		case '10000 REQUESTS PER MONTH':
		case '1000000 QUERIES':
		case '10K AUD REC PR TGT PR MO':
		case '10K GB MEM-SEC':
		case '1K TRANSACTIONS':
		case '1M API CALLS PER MONTH':
		case '1M DNS TRAF MGMT QUR':
		case '1M FX IVCX':
		case '1M INCG REQ PR MO':
		case '1M INCG REQ':
		case '1M REQ':
		case '250 VID AST PR MO':
		case '5000 ASSETS PER MONTH':
		case 'API CALL':
		case 'CONS USR PR MO':
		case 'DKTP PR MO':
		case 'EA':
		case 'ENDPOINTS PER MONTH':
		case 'EXCU PACK PR MO':
		case 'GB LOG STG PR MO':
		case 'GB OF DATA PROCESSED':
		case 'GB OF DATA TRANSFERRED':
		case 'GB OF GOOD TRAF':
		case 'GB OF PKGD VID CTEN':
		case 'GB OUTBOUND DATA TX MO':
		case 'GB PR MO':
		case 'GB STORAGE CAP PER MO':
		case 'HOSTED NAMED USER':
		case 'INST PR MO':
		case 'KEY VER PR MO':
		case 'LOG ANLY STG UN PR MO':
		case 'M DLVR OPRX':
		case 'MILLION DATAPOINTS':
		case 'MIN OF OUT MDIA CTEN':
		case 'PERF UN PR GB PR MO':
		case 'READ UNIT PER MONTH':
		case 'REQUEST':
		case 'TB STORAGE CAP PER MONTH':
		case 'TGT DB PR MO':
		case 'TOKN':
		case 'USER PER MONTH':
		case 'VID PK 500VID 500GB PR MO':
		case 'VIRT GB PR MO':
		case 'WKFR USR PR MO':
		case 'WRITE UNIT PER MONTH':
		case '10000 TRANSACTIONS':
		case 'GB STG RTRD PR MO':
		case 'HSTD ENVIRONMENT PER MO':
		case 'ANOT DATA REC':
		case 'HOST CPU CORE PR MO': // new
		case '1 MNAG RSRC PR MO':
		case 'PROC VID MIN':
		case '1M TOKN':
		case 'AI DATA PTFM UNIT':
		case 'UNIV CRED CNSP':
			return 1;
		case '10 MNTR RSRC PR HR':
		case 'GIGABYTE MEMORY PER HOUR':
		case '10 MTR RUNS PR HR':
		case '100 ENTITIES PER HOUR':
		case '100K EVTS PR HR':
		case '1K EVTS PR HR':
		case '20K MESSAGES PER HOUR':
		case '300 GIGABYTES PER HOUR':
		case '500 TRANSACTIONS PER HOUR':
		case '5K MESSAGES PER HOUR':
		case 'ACT PROC USR PR HR':
		case 'ACTIVE USER PER HOUR':
		case 'CLST PR HR':
		case 'ECPU PR HR':
		case 'EXCU HR':
		case 'GATEWAY PER HOUR':
		case 'GB DATA CAPACITY PER HOUR':
		case 'GB DATA PROCESS PER HOUR':
		case 'GB PR HR':
		case 'GIB MEM PR HR':
		case 'GIGABYTES PER HOUR':
		case 'GPU PER HOUR':
		case 'HST CPU CORE PR HR':
		case 'HSTD ENVIRONMENT PER HOUR':
		case 'HTWV CAP PR HR':
		case 'INFG UN HR':
		case 'INST PR HR':
		case 'LOAD BALANCER HOUR':
		case 'LOG ANLY STG UN PR HR':
		case 'MBPS PR HR':
		case 'MIGR HR':
		case 'MONITORED ACC PER HOUR':
		case 'MONITORED APP PER HOUR':
		case 'MONITORED SERVICE USER PH':
		case 'NODE PR HR':
		case 'NVME TB PR HR':
		case 'OCPU PER HOUR':
		case 'PORT HOUR':
		case 'REDI MEM GB PR HR':
		case 'TRAN HR':
		case 'TRNG HR':
		case 'VIRT NODE PR HR':
		case 'VIRTUAL PRIVATE VAULT PH':
		case 'WKSP USG PR HR':
		case 'AI UN PR HR':
		case 'MAC SVR PR HR': // new
		case 'GB STG PER HOUR':
		case 'GPU MNTR UNIT PR HR':
		case 'EPT PER HR':
		case 'CLST HR':
		case 'HSM PRTN PR HR':
			return HOURS_PER_MONTH;
		case 'RSRC POSS PR DY':
			return DAYS_PER_MONTH;
		default:
			console.log(`==>${uom} unknown`);
			break;
	}
	return 0;
};
