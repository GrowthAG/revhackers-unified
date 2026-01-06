const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/data/blogData.ts');

try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let newLines = [...lines];

    // 1. Fix Duplicates
    // Strategy: Find the SECOND occurrence of "id: 2," and remove the block surrounding it up to the end of the array.
    let id2Indices = [];
    lines.forEach((line, index) => {
        if (line.includes('id: 2,')) {
            id2Indices.push(index);
        }
    });

    if (id2Indices.length > 1) {
        const secondId2Index = id2Indices[1];
        // The block for ID 2 starts one line before (the '{')
        const startCut = secondId2Index - 1;

        // We want to keep the closing ]; of the array.
        // Assuming the duplicate block goes until the line before the last ];
        // Find the last ];
        let arrayEndIndex = -1;
        for (let i = lines.length - 1; i >= 0; i--) {
            if (lines[i].trim() === '];') {
                arrayEndIndex = i;
                break;
            }
        }

        if (startCut > 0 && arrayEndIndex > startCut) {
            console.log(`Removing duplicate block from line ${startCut + 1} to ${arrayEndIndex}`);
            // Remove from startCut up to (but not including) arrayEndIndex
            // We also want to remove individual comma if strictly needed, but Javascript lists allow trailing commas or we can leave the previous one.
            // Actually, the previous block (ID 15) ends with },
            // So if we remove from startCut, the previous line is }, which is valid.
            newLines.splice(startCut, arrayEndIndex - startCut);
        } else {
            console.log('Could not determine safe cut range.');
        }
    } else {
        console.log('Duplicate ID 2 not found.');
    }

    // 2. Fix Slug for ID 1001
    // Target: estrategia-go-to-market-gtm-guia-definitivo -> estrategia-gtm-go-to-market-para-novos-produtos
    const wrongSlug = 'estrategia-go-to-market-gtm-guia-definitivo';
    const correctSlug = 'estrategia-gtm-go-to-market-para-novos-produtos';

    let slugFixed = false;
    newLines = newLines.map(line => {
        if (line.includes(wrongSlug)) {
            slugFixed = true;
            return line.replace(wrongSlug, correctSlug);
        }
        return line;
    });

    if (slugFixed) console.log('Fixed ID 1001 slug.');

    fs.writeFileSync(filePath, newLines.join('\n'));
    console.log('Done.');

} catch (e) {
    console.error(e);
}
