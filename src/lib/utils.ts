const words = [
    ["10000", "10,000"],
    ["CAP", "Capacity"],
    ["EXCU", "Execution"],
    ["GB", "Gigabyte"],
    ["HR", "Hour"],
    ["HSTD", "Hosted"],
    ["INST", "Instance"],
    ["M", "Million"],
    ["MNTR", "Monitored"],
    ["MO", "Month"],
    ["PR", "Per"],
    ["PROCESS", "Processed"],
    ["PRTN", "Partition"],
    ["RSRC", "Resources"],
    ["TB", "Terabyte"],
    ["TX", "Transfer"],
    ["UN", "Unit"],
    ["UN", "Units"],
    ["WKSP", "Workspace"],
];

const replace = (word: string): string[] => {
    const terms = words.filter((r) => r[0] === word.toUpperCase());
    return terms.length ? terms.map((t) => t[1]) : [word];
};

export const cleanName = (name: string, uom: string) => {
    const abbrevs = uom.split(" ");
    for (let i = abbrevs.length - 1; i >= 0; i--) {
        const searchterms = replace(abbrevs[i]);
        for (const term of searchterms) {
            name = name.replace(new RegExp(` +${term}$`, "i"), "");
        }
        name = name.replace(new RegExp(` +${abbrevs[i]}$`, "i"), "");
        const lastword = / +([a-z]+)$/i.exec(name);
        if (i !== 0 && lastword && lastword.length === 2) {
            name = name.replace(new RegExp(` +${lastword[1]}$`, "i"), "");
        }
    }
    name = name.replace(/ *- *$/, "");
    // console.log('name', name);
    return name.trim();
};
