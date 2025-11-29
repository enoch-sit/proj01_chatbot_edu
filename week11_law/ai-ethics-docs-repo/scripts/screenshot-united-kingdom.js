require('dotenv').config();
const { chromium } = require('playwright');
const path = require('path');
const { Logger, delay, takeScreenshot } = require('../utils/helpers');

const logger = new Logger();

const UK_PAGES = [
  {
    name: 'Pro-Innovation White Paper',
    url: 'https://www.gov.uk/government/publications/ai-regulation-a-pro-innovation-approach/white-paper',
    filename: 'uk_pro_innovation_page.png'
  },
  {
    name: 'AI Opportunities Action Plan',
    url: 'https://www.gov.uk/government/publications/ai-opportunities-action-plan/ai-opportunities-action-plan',
    filename: 'uk_ai_opportunities_page.png'
  },
  {
    name: 'AI Playbook',
    url: 'https://www.gov.uk/government/publications/ai-playbook-for-the-uk-government/artificial-intelligence-playbook-for-the-uk-government-html',
    filename: 'uk_ai_playbook_page.png'
  }
];

async function screenshotUnitedKingdom() {
  logger.info('Starting United Kingdom screenshot capture');
  
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

  for (const item of UK_PAGES) {
    try {
      logger.info(`Capturing: ${item.name}`);
      const screenshotPath = path.join(__dirname, '../screenshots/united-kingdom', item.filename);
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
  screenshotUnitedKingdom()
    .then(results => {
      console.log(`Success: ${results.success.length}, Failed: ${results.failed.length}`);
      process.exit(results.failed.length > 0 ? 1 : 0);
    })
    .catch(error => {
      logger.error('Fatal error', { error: error.message });
      process.exit(1);
    });
}

module.exports = { screenshotUnitedKingdom };
