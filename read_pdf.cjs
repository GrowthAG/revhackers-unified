const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('RevHackers_CS.pptx_20260407_204924_0000.pdf');
pdf(dataBuffer).then(function(data) {
    console.log(data.text);
}).catch(console.error);
