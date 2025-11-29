require('dotenv').config();
const { chromium } = require('playwright');
const path = require('path');
const { Logger, delay, takeScreenshot } = require('../utils/helpers');

const logger = new Logger();

const US_PAGES = [
  {
    name: 'Removing Barriers Executive Order',
    url: 'https://www.whitehouse.gov/presidential-actions/2025/01/removing-barriers-to-american-leadership-in-artificial-intelligence/',
    filename: 'us_removing_barriers_page.png'
  },
  {
    name: 'Preventing Woke AI Executive Order',
    url: 'https://www.whitehouse.gov/presidential-actions/2025/07/preventing-woke-ai-in-the-federal-government/',
    filename: 'us_preventing_woke_ai_page.png'
  },
  {
    name: 'AI Bill of Rights Page',
    url: 'https://www.whitehouse.gov/ostp/ai-bill-of-rights/',
    filename: 'us_ai_bill_rights_page.png'
  },
  {
    name: 'Colorado SB24-205 Page',
    url: 'http://leg.colorado.gov/bills/sb24-205',
    filename: 'us_colorado_sb24_205_page.png'
  }
];

async function screenshotUnitedStates() {
  logger.info('Starting United States screenshot capture');
  
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

  for (const item of US_PAGES) {
    try {
      logger.info(`Capturing: ${item.name}`);
      const screenshotPath = path.join(__dirname, '../screenshots/united-states', item.filename);
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
  screenshotUnitedStates()
    .then(results => {
      console.log(`Success: ${results.success.length}, Failed: ${results.failed.length}`);
      process.exit(results.failed.length > 0 ? 1 : 0);
    })
    .catch(error => {
      logger.error('Fatal error', { error: error.message });
      process.exit(1);
    });
}

module.exports = { screenshotUnitedStates };
