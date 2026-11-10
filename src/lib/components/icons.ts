// The icons the app uses, stored locally so that nothing is fetched from a third party.
// Each value is the `d` attribute of a single 24x24 path, taken from Material Design Icons
// (Pictogrammers, Apache License 2.0) through the @iconify-json/mdi package.
// To add an icon, add its path here; `IconName` then accepts the new name.
export const icons = {
	'content-save-check-outline':
		'M14 12.8c-.5-.49-1.22-.8-2-.8a2.996 2.996 0 0 0-1 5.82a6.03 6.03 0 0 1 3-5.02M11.09 19H5V5h11.17L19 7.83v4.52c.75.26 1.42.65 2 1.19V7l-4-4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6.81c-.35-.61-.6-1.28-.72-2M6 10h9V6H6zm9.75 11L13 18l1.16-1.16l1.59 1.59l3.59-3.59l1.16 1.41z',
	'currency-eur':
		'M15 18.5c-2.5 0-4.68-1.42-5.76-3.5H15l1-2H8.58c-.05-.33-.08-.66-.08-1s.03-.67.08-1H15l1-2H9.24A6.49 6.49 0 0 1 15 5.5c1.61 0 3.09.59 4.23 1.57L21 5.3A8.96 8.96 0 0 0 15 3c-3.92 0-7.24 2.5-8.5 6H3l-1 2h4.06c-.06.33-.06.66-.06 1s0 .67.06 1H3l-1 2h4.5c1.26 3.5 4.58 6 8.5 6c2.31 0 4.41-.87 6-2.3l-1.78-1.77c-1.13.98-2.6 1.57-4.22 1.57',
	edit: 'M20.71 7.04c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84 1.83l3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75z',
	'plus-circle-outline':
		'M12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8m0-18A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2m1 5h-2v4H7v2h4v4h2v-4h4v-2h-4z',
	search:
		'M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5l-1.5 1.5l-5-5v-.79l-.27-.27A6.52 6.52 0 0 1 9.5 16A6.5 6.5 0 0 1 3 9.5A6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14S14 12 14 9.5S12 5 9.5 5',
	'table-edit':
		'm21.7 13.35l-1 1l-2.05-2.05l1-1c.21-.22.56-.22.77 0l1.28 1.28c.22.21.22.56 0 .77M12 18.94l6.07-6.06l2.05 2.05L14.06 21H12zM4 2h14a2 2 0 0 1 2 2v4.17L16.17 12H12v4.17L10.17 18H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2m0 4v4h6V6zm8 0v4h6V6zm-8 6v4h6v-4z',
	'trash-can-outline':
		'M9 3v1H4v2h1v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6h1V4h-5V3zM7 6h10v13H7zm2 2v9h2V8zm4 0v9h2V8z'
} as const;

export type IconName = keyof typeof icons;
