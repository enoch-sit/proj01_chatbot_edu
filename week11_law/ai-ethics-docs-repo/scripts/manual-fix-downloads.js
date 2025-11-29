const { chromium } = require('playwright');
const fs = require('fs-extra');
const path = require('path');
const { Logger } = require('../utils/helpers');

const logger = new Logger();

async function downloadWithBrowser(url, outputPath) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Set up download handler
    const downloadPromise = page.waitForEvent('download', { timeout: 30000 });
    
    // Navigate to trigger download
    await page.goto(url, { timeout: 30000 });
    
    const download = await downloadPromise;
    const savePath = path.resolve(outputPath);
    await fs.ensureDir(path.dirname(savePath));
    await download.saveAs(savePath);
    
    logger.success(`Downloaded: ${path.basename(outputPath)}`);
    return true;
  } catch (error) {
    logger.error(`Failed: ${url}`, { error: error.message });
    return false;
  } finally {
    await browser.close();
  }
}

async function main() {
  logger.info('Attempting to download failed files with browser download handler');
  
  const files = [
    {
      url: 'https://www.whitehouse.gov/wp-content/uploads/2022/10/Blueprint-for-an-AI-Bill-of-Rights.pdf',
      output: './downloads/united-states/us_blueprint_ai_bill_of_rights.pdf'
    },
    {
      url: 'https://leg.colorado.gov/sites/default/files/documents/2024A/bills/2024a_205_enr.pdf',
      output: './downloads/united-states/us_colorado_sb24_205_ai_act.pdf'
    }
  ];
  
  for (const file of files) {
    await downloadWithBrowser(file.url, file.output);
  }
  
  logger.info('Manual download attempt completed');
}

main();
