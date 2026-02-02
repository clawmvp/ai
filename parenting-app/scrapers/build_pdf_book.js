const { chromium } = require('playwright');
const path = require('path');

const INPUT_HTML_PATH = path.join(__dirname, '../output/All_About_Parenting.html');
const OUTPUT_PDF_PATH = path.join(__dirname, '../output/All_About_Parenting.pdf');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Load the HTML file
    // We use file:// protocol
    const fileUrl = 'file://' + INPUT_HTML_PATH;
    console.log(`Loading ${fileUrl}...`);
    await page.goto(fileUrl, { waitUntil: 'networkidle' });

    // Generate PDF
    // format: 'A4' is standard. printBackground: true ensures any styling backgrounds are kept.
    // margin: defines margins for the PDF.
    await page.pdf({
        path: OUTPUT_PDF_PATH,
        format: 'A4',
        printBackground: true,
        margin: {
            top: '2cm',
            right: '2cm',
            bottom: '2cm',
            left: '2cm'
        },
        displayHeaderFooter: true,
        footerTemplate: `
      <div style="font-size: 10px; text-align: center; width: 100%; color: #grey;">
        <span class="pageNumber"></span> / <span class="totalPages"></span>
      </div>
    `,
        headerTemplate: '<div></div>'
    });

    console.log(`PDF generated at ${OUTPUT_PDF_PATH}`);

    await browser.close();
})();
