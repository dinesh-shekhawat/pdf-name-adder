const prompt = require('prompt-sync')({ sigint: true });
const fs = require('fs');
const path = require('path');

listPdfFiles = (directoryPath) => {
    const pdfFiles = [];

    traverseDirectory = (dirPath) => {
        const files = fs.readdirSync(dirPath);

        files.forEach(file => {
            const filePath = path.join(dirPath, file);

            const stats = fs.statSync(filePath);

            if (stats.isDirectory()) {
                // If it's a subdirectory, recursively call the function
                traverseDirectory(filePath);
            } else if (path.extname(file).toLowerCase() === '.pdf') {
                // If it's a PDF file, add the file path to the list
                pdfFiles.push(filePath);
            }
        });
    }

    traverseDirectory(directoryPath);
    return pdfFiles;
}

startApp = () => {
    const inputDirectory = prompt('Enter input directory: ');
    console.log(`Parsing input directory ${inputDirectory}`);
    inputPDFFiles = listPdfFiles(inputDirectory);
    inputPDFFiles.forEach(filePath => console.log(filePath));
}

startApp();