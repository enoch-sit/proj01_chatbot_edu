require('dotenv').config();
const { chromium } = require('playwright');
const path = require('path');
const { Logger, delay, downloadFile, takeScreenshot } = require('../utils/helpers');

const logger = new Logger();

// EU Documents Configuration
const EU_DOCUMENTS = [
  {
    name: 'AI Act - Regulation EU 2024/1689',
    url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=OJ:L_202401689',
    type: 'pdf',
    pageUrl: 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng',
    filename: 'eu_ai_act_regulation_2024_1689.pdf'
  }
];

async function downloadEuropeDocs() {
  logger.info('Starting Europe (EU) documents download');
  
  const browser = await chromium.launch({ 
    headless: process.env.HEADLESS !== 'false' 
  });
  const context = await browser.newContext({
    userAgent: process.env.USER_AGENT
  });
  const page = await context.newPage();

  const results = {
    downloaded: [],
    failed: [],
    screenshots: []
  };

  for (const doc of EU_DOCUMENTS) {
    try {
      logger.info(`Processing: ${doc.name}`);
      
      // Take screenshot of the EUR-Lex page
      const screenshotPath = path.join(
        __dirname, 
        '../screenshots/europe-eu',
        `${doc.filename.replace('.pdf', '')}_page.png`
      );
      
      const screenshotSuccess = await takeScreenshot(page, doc.pageUrl, screenshotPath, logger);
      if (screenshotSuccess) {
        results.screenshots.push(screenshotPath);
      }
      
      await delay(parseInt(process.env.RATE_LIMIT_DELAY) || 2000);
      
      // Download the PDF
      const downloadPath = path.join(__dirname, '../downloads/europe-eu', doc.filename);
      const downloadSuccess = await downloadFile(page, doc.url, downloadPath, logger);
      
      if (downloadSuccess) {
        results.downloaded.push({
          name: doc.name,
          path: downloadPath,
          url: doc.url
        });
      } else {
        results.failed.push({
          name: doc.name,
          url: doc.url,
          error: 'Download failed'
        });
      }
      
      await delay(parseInt(process.env.RATE_LIMIT_DELAY) || 2000);
      
    } catch (error) {
      logger.error(`Error processing ${doc.name}`, { error: error.message });
      results.failed.push({
        name: doc.name,
        url: doc.url,
        error: error.message
      });
    }
  }

  await browser.close();
  
  logger.info('Europe (EU) documents download completed', {
    downloaded: results.downloaded.length,
    failed: results.failed.length,
    screenshots: results.screenshots.length
  });

  return results;
}

// Run if called directly
if (require.main === module) {
  downloadEuropeDocs()
    .then(results => {
      console.log('\n=== Europe (EU) Download Summary ===');
      console.log(`Successfully downloaded: ${results.downloaded.length}`);
      console.log(`Failed: ${results.failed.length}`);
      console.log(`Screenshots captured: ${results.screenshots.length}`);
      process.exit(results.failed.length > 0 ? 1 : 0);
    })
    .catch(error => {
      logger.error('Fatal error', { error: error.message });
      process.exit(1);
    });
}

module.exports = { downloadEuropeDocs };
