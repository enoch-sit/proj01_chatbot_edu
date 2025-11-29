require('dotenv').config();
const { chromium } = require('playwright');
const path = require('path');
const { Logger, delay, takeScreenshot } = require('../utils/helpers');

const logger = new Logger();

// All document page URLs
const ALL_PAGES = [
  // Hong Kong
  {
    region: 'hong-kong',
    name: 'Generative AI Guideline Page',
    url: 'https://www.digitalpolicy.gov.hk/en/our_work/data_governance/policies_standards/ethical_ai_framework/',
    filename: 'hk_gen_ai_guideline_page.png'
  },
  {
    region: 'hong-kong',
    name: 'Personal Data Ordinance Page',
    url: 'https://www.elegislation.gov.hk/hk/cap486',
    filename: 'hk_privacy_ordinance_page.png'
  },
  // Europe
  {
    region: 'europe-eu',
    name: 'AI Act EUR-Lex Page',
    url: 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng',
    filename: 'eu_ai_act_eurlex_page.png'
  },
  // United States
  {
    region: 'united-states',
    name: 'Removing Barriers Executive Order',
    url: 'https://www.whitehouse.gov/presidential-actions/2025/01/removing-barriers-to-american-leadership-in-artificial-intelligence/',
    filename: 'us_removing_barriers_page.png'
  },
  {
    region: 'united-states',
    name: 'Preventing Woke AI Executive Order',
    url: 'https://www.whitehouse.gov/presidential-actions/2025/07/preventing-woke-ai-in-the-federal-government/',
    filename: 'us_preventing_woke_ai_page.png'
  },
  {
    region: 'united-states',
    name: 'AI Bill of Rights Page',
    url: 'https://www.whitehouse.gov/ostp/ai-bill-of-rights/',
    filename: 'us_ai_bill_rights_page.png'
  },
  {
    region: 'united-states',
    name: 'Colorado SB24-205 Page',
    url: 'http://leg.colorado.gov/bills/sb24-205',
    filename: 'us_colorado_sb24_205_page.png'
  },
  // United Kingdom
  {
    region: 'united-kingdom',
    name: 'Pro-Innovation White Paper',
    url: 'https://www.gov.uk/government/publications/ai-regulation-a-pro-innovation-approach/white-paper',
    filename: 'uk_pro_innovation_page.png'
  },
  {
    region: 'united-kingdom',
    name: 'AI Opportunities Action Plan',
    url: 'https://www.gov.uk/government/publications/ai-opportunities-action-plan/ai-opportunities-action-plan',
    filename: 'uk_ai_opportunities_page.png'
  },
  {
    region: 'united-kingdom',
    name: 'AI Playbook',
    url: 'https://www.gov.uk/government/publications/ai-playbook-for-the-uk-government/artificial-intelligence-playbook-for-the-uk-government-html',
    filename: 'uk_ai_playbook_page.png'
  }
];

async function screenshotAll() {
  logger.info('Starting screenshot capture for all pages');
  
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

  const results = {
    success: [],
    failed: []
  };

  for (const item of ALL_PAGES) {
    try {
      logger.info(`Capturing: ${item.name}`);
      
      const screenshotPath = path.join(
        __dirname, 
        '../screenshots',
        item.region,
        item.filename
      );
      
      const success = await takeScreenshot(page, item.url, screenshotPath, logger, {
        fullPage: process.env.SCREENSHOT_FULL_PAGE !== 'false'
      });
      
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
  
  logger.info('Screenshot capture completed', {
    success: results.success.length,
    failed: results.failed.length
  });

  return results;
}

// Run if called directly
if (require.main === module) {
  screenshotAll()
    .then(results => {
      console.log('\n=== Screenshot Summary ===');
      console.log(`Successfully captured: ${results.success.length}`);
      console.log(`Failed: ${results.failed.length}`);
      process.exit(results.failed.length > 0 ? 1 : 0);
    })
    .catch(error => {
      logger.error('Fatal error', { error: error.message });
      process.exit(1);
    });
}

module.exports = { screenshotAll };
