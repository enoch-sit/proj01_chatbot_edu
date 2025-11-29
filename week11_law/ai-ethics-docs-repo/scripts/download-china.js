const { chromium } = require('playwright');
const fs = require('fs-extra');
const path = require('path');
const { Logger, delay, takeScreenshot } = require('../utils/helpers');
const axios = require('axios');

const logger = new Logger();

const CHINA_DOCUMENTS = [
  {
    name: 'Generative AI Service Management Measures',
    pageUrl: 'http://www.cac.gov.cn/2023-07/13/c_1690898327029107.htm',
    filename: 'china_generative_ai_service_measures.html',
    screenshotName: 'china_generative_ai_service_measures_page.png'
  },
  {
    name: 'Deep Synthesis Regulations',
    pageUrl: 'http://www.cac.gov.cn/2022-11/25/c_1672221949318349.htm',
    filename: 'china_deep_synthesis_regulations.html',
    screenshotName: 'china_deep_synthesis_regulations_page.png'
  }
];

async function downloadChinaDocuments() {
  logger.info('Starting China documents download');
  
  const browser = await chromium.launch({ 
    headless: true,
    timeout: 120000 // 2 minutes for Chinese sites
  });
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'zh-CN',
    timezoneId: 'Asia/Shanghai'
  });
  
  const page = await context.newPage();
  
  let downloaded = 0;
  let failed = 0;
  let screenshots = 0;
  
  for (const doc of CHINA_DOCUMENTS) {
    try {
      logger.info(`Processing: ${doc.name}`);
      
      // Take screenshot
      const screenshotPath = path.join(__dirname, '../screenshots/china', doc.screenshotName);
      const screenshotSuccess = await takeScreenshot(page, doc.pageUrl, screenshotPath, logger, {
        fullPage: true,
        timeout: 120000
      });
      
      if (screenshotSuccess) {
        screenshots++;
      }
      
      await delay(2000);
      
      // Download HTML page
      try {
        logger.info(`Downloading HTML from: ${doc.pageUrl}`);
        
        const response = await axios({
          method: 'GET',
          url: doc.pageUrl,
          timeout: 120000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
          }
        });
        
        const outputPath = path.join(__dirname, '../downloads/china', doc.filename);
        await fs.ensureDir(path.dirname(outputPath));
        await fs.writeFile(outputPath, response.data, 'utf-8');
        
        logger.success(`Downloaded HTML: ${doc.filename}`, { size: response.data.length });
        downloaded++;
      } catch (downloadError) {
        logger.error(`Failed to download HTML for ${doc.name}`, { error: downloadError.message });
        failed++;
      }
      
      await delay(3000); // Rate limiting for Chinese government site
      
    } catch (error) {
      logger.error(`Failed to process ${doc.name}`, { error: error.message });
      failed++;
    }
  }
  
  await browser.close();
  
  logger.info('China documents download completed', { downloaded, failed, screenshots });
  
  return { downloaded, failed, screenshots };
}

async function main() {
  try {
    const stats = await downloadChinaDocuments();
    
    console.log('\n============================================================');
    console.log('CHINA DOWNLOAD SUMMARY');
    console.log('============================================================');
    console.log(`Total documents downloaded: ${stats.downloaded}`);
    console.log(`Total failed: ${stats.failed}`);
    console.log(`Total screenshots: ${stats.screenshots}`);
    console.log('============================================================\n');
    
    process.exit(stats.failed > 0 ? 1 : 0);
  } catch (error) {
    logger.error('Download process failed', { error: error.message });
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { downloadChinaDocuments };
