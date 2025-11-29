require('dotenv').config();
const { chromium } = require('playwright');
const path = require('path');
const { Logger, delay, downloadFile, takeScreenshot } = require('../utils/helpers');

const logger = new Logger();

// Hong Kong Documents Configuration
const HK_DOCUMENTS = [
  {
    name: 'Generative AI Technical and Application Guideline',
    url: 'https://www.digitalpolicy.gov.hk/en/our_work/data_governance/policies_standards/ethical_ai_framework/doc/HK_Generative_AI_Technical_and_Application_Guideline_en.pdf',
    type: 'pdf',
    pageUrl: 'https://www.digitalpolicy.gov.hk/en/our_work/data_governance/policies_standards/ethical_ai_framework/',
    filename: 'hk_generative_ai_guideline.pdf'
  },
  {
    name: 'Personal Data Privacy Ordinance Cap 486',
    url: 'https://www.elegislation.gov.hk/hk/cap486!en.pdf',
    type: 'pdf',
    pageUrl: 'https://www.elegislation.gov.hk/hk/cap486',
    filename: 'hk_personal_data_privacy_ordinance.pdf'
  }
];

async function downloadHongKongDocs() {
  logger.info('Starting Hong Kong documents download');
  
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

  for (const doc of HK_DOCUMENTS) {
    try {
      logger.info(`Processing: ${doc.name}`);
      
      // Take screenshot of the page where document is available
      const screenshotPath = path.join(
        __dirname, 
        '../screenshots/hong-kong',
        `${doc.filename.replace('.pdf', '')}_page.png`
      );
      
      const screenshotSuccess = await takeScreenshot(page, doc.pageUrl, screenshotPath, logger);
      if (screenshotSuccess) {
        results.screenshots.push(screenshotPath);
      }
      
      await delay(parseInt(process.env.RATE_LIMIT_DELAY) || 2000);
      
      // Download the document
      const downloadPath = path.join(__dirname, '../downloads/hong-kong', doc.filename);
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
  
  logger.info('Hong Kong documents download completed', {
    downloaded: results.downloaded.length,
    failed: results.failed.length,
    screenshots: results.screenshots.length
  });

  return results;
}

// Run if called directly
if (require.main === module) {
  downloadHongKongDocs()
    .then(results => {
      console.log('\n=== Hong Kong Download Summary ===');
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

module.exports = { downloadHongKongDocs };
