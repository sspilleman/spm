export const parseMDYDate = (value: string) => {
	const date = new Date('1972-09-10T02:00:00');
	const r = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value);
	if (r && r.length === 4) {
		date.setDate(parseInt(r[2], 10));
		date.setMonth(parseInt(r[1], 10) - 1);
		date.setFullYear(parseInt(r[3], 10));
	}
	return date;
};

export const parseYMDDate = (value: string) => {
	const date = new Date('1972-09-10T02:00:00');
	const r = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
	if (r && r.length === 4) {
		date.setDate(parseInt(r[3], 10));
		date.setMonth(parseInt(r[2], 10) - 1);
		date.setFullYear(parseInt(r[1], 10));
	}
	return date;
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

// type UOM =
//   | "1000 EMAILS SENT"
//   | "10000 REQUESTS PER MONTH"
//   | "100K EVTS PR HR"
//   | "10K GB MEM-SEC"
//   | "1K EVTS PR HR"
//   | "1M API CALLS PER MONTH"
//   | "1M FX IVCX"
//   | "5K MESSAGES PER HOUR"
//   | "ECPU PR HR"
//   | "ENDPOINTS PER MONTH"
//   | "GB LOG STG PR MO"
//   | "GB OUTBOUND DATA TX MO"
//   | "GB PR HR"
//   | "GB STORAGE CAP PER MO"
//   | "KEY VER PR MO"
//   | "LOAD BALANCER HOUR"
//   | "LOG ANLY STG UN PR MO"
//   | "M DLVR OPRX"
//   | "MILLION DATAPOINTS"
//   | "OCPU PER HOUR"
//   | "PERF UN PR GB PR MO"
//   | "PORT HOUR"
//   | "REQUEST"
//   | "TB STORAGE CAP PER MONTH"
//   | "OCPU PER HOUR"
//   | "USER PER MONTH";

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
		case 'RSRC POSS PR DY':
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
		case 'HSM PRTN PR HR':
		case 'ANOT DATA REC':
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
			return 730;
		default:
			// alert(`${uom} unknown`);
			console.log(`==>${uom} unknown`);
			break;
	}
	return 0;
};
