require('dotenv').config();
const { chromium } = require('playwright');
const path = require('path');
const { Logger, delay, downloadFile, takeScreenshot } = require('../utils/helpers');

const logger = new Logger();

// US Documents Configuration
const US_DOCUMENTS = [
  {
    name: 'Removing Barriers to American Leadership in AI',
    url: 'https://www.whitehouse.gov/presidential-actions/2025/01/removing-barriers-to-american-leadership-in-artificial-intelligence/',
    type: 'html',
    filename: 'us_removing_barriers_ai_leadership.html'
  },
  {
    name: 'Preventing Woke AI in Federal Government',
    url: 'https://www.whitehouse.gov/presidential-actions/2025/07/preventing-woke-ai-in-the-federal-government/',
    type: 'html',
    filename: 'us_preventing_woke_ai.html'
  },
  {
    name: 'Americas AI Action Plan',
    url: 'https://www.whitehouse.gov/wp-content/uploads/2025/07/Americas-AI-Action-Plan.pdf',
    type: 'pdf',
    pageUrl: 'https://www.whitehouse.gov/briefing-room/statements-releases/',
    filename: 'us_americas_ai_action_plan.pdf'
  },
  {
    name: 'Blueprint for an AI Bill of Rights',
    url: 'https://www.whitehouse.gov/wp-content/uploads/2022/10/Blueprint-for-an-AI-Bill-of-Rights.pdf',
    type: 'pdf',
    pageUrl: 'https://www.whitehouse.gov/ostp/ai-bill-of-rights/',
    filename: 'us_blueprint_ai_bill_of_rights.pdf'
  },
  {
    name: 'Colorado SB24-205 Consumer Protections for AI',
    url: 'https://leg.colorado.gov/sites/default/files/documents/2024A/bills/2024a_205_enr.pdf',
    type: 'pdf',
    pageUrl: 'http://leg.colorado.gov/bills/sb24-205',
    filename: 'us_colorado_sb24_205_ai_act.pdf'
  }
];

async function downloadUnitedStatesDocs() {
  logger.info('Starting United States documents download');
  
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

  for (const doc of US_DOCUMENTS) {
    try {
      logger.info(`Processing: ${doc.name}`);
      
      // Take screenshot of the page
      const screenshotUrl = doc.pageUrl || doc.url;
      const screenshotPath = path.join(
        __dirname, 
        '../screenshots/united-states',
        `${doc.filename.replace(/\.(pdf|html)$/, '')}_page.png`
      );
      
      const screenshotSuccess = await takeScreenshot(page, screenshotUrl, screenshotPath, logger);
      if (screenshotSuccess) {
        results.screenshots.push(screenshotPath);
      }
      
      await delay(parseInt(process.env.RATE_LIMIT_DELAY) || 2000);
      
      // Download the document
      const downloadPath = path.join(__dirname, '../downloads/united-states', doc.filename);
      
      if (doc.type === 'html') {
        // For HTML pages, save the full page content
        await page.goto(doc.url, { waitUntil: 'networkidle' });
        const content = await page.content();
        const fs = require('fs-extra');
        await fs.writeFile(downloadPath, content);
        logger.success(`Downloaded HTML: ${doc.filename}`);
        results.downloaded.push({
          name: doc.name,
          path: downloadPath,
          url: doc.url
        });
      } else {
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
  
  logger.info('United States documents download completed', {
    downloaded: results.downloaded.length,
    failed: results.failed.length,
    screenshots: results.screenshots.length
  });

  return results;
}

// Run if called directly
if (require.main === module) {
  downloadUnitedStatesDocs()
    .then(results => {
      console.log('\n=== United States Download Summary ===');
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

module.exports = { downloadUnitedStatesDocs };
