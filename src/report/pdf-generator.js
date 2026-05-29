import puppeteer from 'puppeteer';
import path from 'path';

export async function generatePDF(htmlPath, outputPath) {
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Read the HTML file and load it
    const fileUrl = `file://${path.resolve(htmlPath)}`;
    await page.goto(fileUrl, { waitUntil: 'networkidle2' });

    // Generate PDF with optimized settings
    await page.pdf({
      path: outputPath,
      format: 'A4',
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      },
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 12px; width: 100%; text-align: center; color: #999;">
          <span></span>
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 12px; width: 100%; display: flex; justify-content: space-between; padding: 0 20mm; color: #999;">
          <span style="flex: 1;">iOS Feature Audit Report</span>
          <span style="flex: 1; text-align: right;"><span class="pageNumber"></span> / <span class="totalPages"></span></span>
        </div>
      `
    });

    return outputPath;
  } catch (error) {
    throw new Error(`PDF generation failed: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
