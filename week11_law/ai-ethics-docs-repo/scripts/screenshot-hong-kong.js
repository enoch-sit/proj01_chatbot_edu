require('dotenv').config();
const { chromium } = require('playwright');
const path = require('path');
const { Logger, delay, takeScreenshot } = require('../utils/helpers');

const logger = new Logger();

const HK_PAGES = [
  {
    name: 'Generative AI Guideline Page',
    url: 'https://www.digitalpolicy.gov.hk/en/our_work/data_governance/policies_standards/ethical_ai_framework/',
    filename: 'hk_gen_ai_guideline_page.png'
  },
  {
    name: 'Personal Data Ordinance Page',
    url: 'https://www.elegislation.gov.hk/hk/cap486',
    filename: 'hk_privacy_ordinance_page.png'
  }
];

async function screenshotHongKong() {
  logger.info('Starting Hong Kong screenshot capture');
  
  const browser = await chromium.launch({ 
    headless: process.env.HEADLESS !== 'false' 
  });
  const context = await browser.newContext({
    userAgent: process.env.USER_AGENT,
    viewport: {
      width: parseInt(process.env.SCREENSHOT_WIDTH) || 1920,
      height: parseInt(process.env.SCREENSHOT_HEIGHT) || 1080
    }
  });
  const page = await context.newPage();

  const results = { success: [], failed: [] };

  for (const item of HK_PAGES) {
    try {
      logger.info(`Capturing: ${item.name}`);
      const screenshotPath = path.join(__dirname, '../screenshots/hong-kong', item.filename);
      const success = await takeScreenshot(page, item.url, screenshotPath, logger);
      
      if (success) {
        results.success.push(item);
      } else {
        results.failed.push(item);
      }
      
      await delay(parseInt(process.env.RATE_LIMIT_DELAY) || 2000);
    } catch (error) {
      logger.error(`Error capturing ${item.name}`, { error: error.message });
      results.failed.push(item);
    }
  }

  await browser.close();
  return results;
}

if (require.main === module) {
  screenshotHongKong()
    .then(results => {
      console.log(`Success: ${results.success.length}, Failed: ${results.failed.length}`);
      process.exit(results.failed.length > 0 ? 1 : 0);
    })
    .catch(error => {
      logger.error('Fatal error', { error: error.message });
      process.exit(1);
    });
}

module.exports = { screenshotHongKong };
