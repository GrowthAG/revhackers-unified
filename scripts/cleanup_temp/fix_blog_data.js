const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/data/blogData.ts');
try {
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace content: `...` with content: "..."
    // We use a regex that matches `content:` followed by whitespace, then a backtick, 
    // then anything (non-greedy) until a backtick and comma.
    const regex = /content:\s*`[\s\S]*?`(?=,)/g;

    let count = 0;
    const newContent = content.replace(regex, (match) => {
        count++;
        return 'content: "Conteúdo renderizado via componente customizado"';
    });

    if (count > 0) {
        fs.writeFileSync(filePath, newContent);
        console.log(`Successfully fixed ${count} articles in blogData.ts`);
    } else {
        console.log('No legacy content blocks found to fix.');
    }
} catch (error) {
    console.error('Error processing file:', error);
    process.exit(1);
}
