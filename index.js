const prompt = require('prompt-sync')({ sigint: true });
const fs = require('fs');
const path = require('path');
const PDFParser = require('pdf-parse');
const { PDFDocument, rgb } = require('pdf-lib');

clearDirectory = (dirPath) => {
    console.log(`clearing files from directory ${dirPath}`);

    if (!fs.existsSync(dirPath)) {
        return;
    }

    const files = fs.readdirSync(dirPath);
    files.forEach((file) => {
        const filePath = path.join(dirPath, file);
        if (fs.statSync(filePath).isDirectory()) {
            clearDirectory(filePath);
            fs.rmdirSync(filePath);
        } else {
            fs.unlinkSync(filePath);
        }
      });
}

copyFilesRecursively = (inputDirectory, outputDirectory) => {
    console.log(`Parsing input directory ${inputDirectory}`);
    console.log(`Copying files to output directory ${outputDirectory}`);

    fs.readdir(inputDirectory, (err, files) => {
        if (err) {
            console.error('Error reading source directory:', err);
            return;
        }

        files.forEach((file) => {
            const sourceFilePath = path.join(inputDirectory, file);
            const destinationFilePath = path.join(outputDirectory, file);

            fs.lstat(sourceFilePath, (err, stats) => {
                if (err) {
                    console.error('Error reading file stats:', err);
                    return;
                }

                if (stats.isDirectory()) {
                    fs.mkdir(destinationFilePath, { recursive: true }, (err) => {
                        if (err) {
                            console.error('Error creating directory:', err);
                          } else {
                            console.log(`Directory ${destinationFilePath} created`);
                            copyFilesRecursively(sourceFilePath, destinationFilePath);
                          }
                    });
                } else {
                    fs.copyFile(sourceFilePath, destinationFilePath, (err) => {
                        if (err) {
                          console.error(`Error copying file ${file}:`, err);
                        } else {
                          console.log(`File ${file} successfully copied!`);
            
                          // Check if the file is a PDF and add the file name at the top if not present
                          if (path.extname(file).toLowerCase() === '.pdf') {
                            const fileName = path.basename(file, '.pdf');
                            addFileNameToPDF(destinationFilePath, fileName);
                          }
                        }
                      });
                }
                
            });
        });
    });
}

addFileNameToPDF = (filePath, fileName) => {
    fs.readFile(filePath, async (err, data) => {
        if (err) {
          console.error(`Error reading PDF file ${filePath}:`, err);
          return;
        }
    
        try {
          const pdfDoc = await PDFDocument.load(data);
          const [page] = pdfDoc.getPages();
    
          // Set font and font size for the text
          const font = await pdfDoc.embedFont('Helvetica');
          const fontSize = 12;
    
          // Add the file name as the first page's content
          page.drawText(fileName, {
            x: 50,
            y: page.getHeight() - 50,
            size: fontSize,
            font: font,
            color: rgb(0, 0, 0),
          });
    
          // Save the modified PDF to the same file
          const modifiedPDFBytes = await pdfDoc.save();
          fs.writeFile(filePath, modifiedPDFBytes, (err) => {
            if (err) {
              console.error(`Error writing to PDF file ${filePath}:`, err);
            } else {
              console.log(`File name added to ${filePath}.`);
            }
          });
        } catch (err) {
          console.error(`Error parsing or modifying PDF file ${filePath}:`, err);
        }
      });
}

startApp = () => {
    const inputDirectory = prompt('Enter input directory: ');
    const outputDirectory = prompt('Enter output directory: ');
    
    clearDirectory(outputDirectory);

    copyFilesRecursively(inputDirectory, outputDirectory);

    // readAndAddFileNameToPDF(outputDirectory);
}

startApp();