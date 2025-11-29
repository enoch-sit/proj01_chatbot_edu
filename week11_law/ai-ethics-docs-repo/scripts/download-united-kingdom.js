require('dotenv').config();
const { chromium } = require('playwright');
const path = require('path');
const { Logger, delay, downloadFile, takeScreenshot } = require('../utils/helpers');

const logger = new Logger();

// UK Documents Configuration
const UK_DOCUMENTS = [
  {
    name: 'A Pro-Innovation Approach to AI Regulation White Paper',
    url: 'https://www.gov.uk/government/publications/ai-regulation-a-pro-innovation-approach/white-paper',
    type: 'html',
    filename: 'uk_pro_innovation_ai_regulation_white_paper.html'
  },
  {
    name: 'A Pro-Innovation Approach - Government Response PDF',
    url: 'https://assets.publishing.service.gov.uk/media/65c1e399c43191000d1a45f4/a-pro-innovation-approach-to-ai-regulation-amended-governement-response-web-ready.pdf',
    type: 'pdf',
    pageUrl: 'https://www.gov.uk/government/publications/ai-regulation-a-pro-innovation-approach',
    filename: 'uk_pro_innovation_government_response.pdf'
  },
  {
    name: 'AI Opportunities Action Plan',
    url: 'https://www.gov.uk/government/publications/ai-opportunities-action-plan/ai-opportunities-action-plan',
    type: 'html',
    filename: 'uk_ai_opportunities_action_plan.html'
  },
  {
    name: 'AI Opportunities Action Plan - Government Response PDF',
    url: 'https://assets.publishing.service.gov.uk/media/678639913a9388161c5d2376/ai_opportunities_action_plan_government_repsonse.pdf',
    type: 'pdf',
    pageUrl: 'https://www.gov.uk/government/publications/ai-opportunities-action-plan',
    filename: 'uk_ai_opportunities_government_response.pdf'
  },
  {
    name: 'AI Playbook for UK Government',
    url: 'https://www.gov.uk/government/publications/ai-playbook-for-the-uk-government/artificial-intelligence-playbook-for-the-uk-government-html',
    type: 'html',
    filename: 'uk_ai_playbook_government.html'
  }
];

async function downloadUnitedKingdomDocs() {
  logger.info('Starting United Kingdom documents download');
  
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

  for (const doc of UK_DOCUMENTS) {
    try {
      logger.info(`Processing: ${doc.name}`);
      
      // Take screenshot of the page
      const screenshotUrl = doc.pageUrl || doc.url;
      const screenshotPath = path.join(
        __dirname, 
        '../screenshots/united-kingdom',
        `${doc.filename.replace(/\.(pdf|html)$/, '')}_page.png`
      );
      
      const screenshotSuccess = await takeScreenshot(page, screenshotUrl, screenshotPath, logger);
      if (screenshotSuccess) {
        results.screenshots.push(screenshotPath);
      }
      
      await delay(parseInt(process.env.RATE_LIMIT_DELAY) || 2000);
      
      // Download the document
      const downloadPath = path.join(__dirname, '../downloads/united-kingdom', doc.filename);
      
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
  
  logger.info('United Kingdom documents download completed', {
    downloaded: results.downloaded.length,
    failed: results.failed.length,
    screenshots: results.screenshots.length
  });

  return results;
}

// Run if called directly
if (require.main === module) {
  downloadUnitedKingdomDocs()
    .then(results => {
      console.log('\n=== United Kingdom Download Summary ===');
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

module.exports = { downloadUnitedKingdomDocs };
