// The sample exports in static/ serve as fixtures. They are loaded with Vite's ?raw import,
// so the tests need no file system API and run the same under any runtime that runs Vitest.
import computationCsv from '../static/computation.csv?raw';
import ratecardCsv from '../static/ratecard 2026-02-26.csv?raw';

// The parsers take a File, as the upload input in Header.svelte provides it
export const csvFile = (text: string, name = 'test.csv') => new File([text], name);

export const ratecardFile = () => csvFile(ratecardCsv, 'ratecard 2026-02-26.csv');
export const computationFile = () => csvFile(computationCsv, 'computation.csv');

// Number of data rows: all lines minus the header (both files end with a line break)
export const dataRows = (csv: string) => csv.trimEnd().split(/\r?\n/).length - 1;
export { computationCsv, ratecardCsv };
