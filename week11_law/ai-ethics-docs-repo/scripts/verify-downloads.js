require('dotenv').config();
const fs = require('fs-extra');
const path = require('path');
const { Logger } = require('../utils/helpers');

const logger = new Logger();

async function verifyDownloads() {
  logger.info('Starting download verification');
  
  const regions = ['hong-kong', 'europe-eu', 'united-states', 'united-kingdom'];
  const results = {
    found: [],
    missing: [],
    totalSize: 0
  };

  for (const region of regions) {
    const downloadDir = path.join(__dirname, '../downloads', region);
    const screenshotDir = path.join(__dirname, '../screenshots', region);

    try {
      // Check downloads
      if (await fs.pathExists(downloadDir)) {
        const files = await fs.readdir(downloadDir);
        for (const file of files) {
          const filePath = path.join(downloadDir, file);
          const stats = await fs.stat(filePath);
          results.found.push({
            region,
            type: 'download',
            file,
            size: stats.size,
            path: filePath
          });
          results.totalSize += stats.size;
        }
      }

      // Check screenshots
      if (await fs.pathExists(screenshotDir)) {
        const files = await fs.readdir(screenshotDir);
        for (const file of files) {
          const filePath = path.join(screenshotDir, file);
          const stats = await fs.stat(filePath);
          results.found.push({
            region,
            type: 'screenshot',
            file,
            size: stats.size,
            path: filePath
          });
        }
      }
    } catch (error) {
      logger.error(`Error verifying ${region}`, { error: error.message });
    }
  }

  // Generate report
  console.log('\n' + '='.repeat(60));
  console.log('VERIFICATION REPORT');
  console.log('='.repeat(60));
  console.log(`Total files found: ${results.found.length}`);
  console.log(`Total size: ${(results.totalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log('='.repeat(60));

  // Breakdown by region
  console.log('\nBreakdown by Region:');
  for (const region of regions) {
    const regionFiles = results.found.filter(f => f.region === region);
    const downloads = regionFiles.filter(f => f.type === 'download');
    const screenshots = regionFiles.filter(f => f.type === 'screenshot');
    console.log(`\n${region.toUpperCase()}:`);
    console.log(`  Downloads: ${downloads.length}`);
    console.log(`  Screenshots: ${screenshots.length}`);
    
    if (downloads.length > 0) {
      downloads.forEach(d => {
        console.log(`    - ${d.file} (${(d.size / 1024).toFixed(2)} KB)`);
      });
    }
  }

  return results;
}

// Run if called directly
if (require.main === module) {
  verifyDownloads()
    .then(results => {
      logger.success('Verification completed', { totalFiles: results.found.length });
      process.exit(0);
    })
    .catch(error => {
      logger.error('Fatal error', { error: error.message });
      process.exit(1);
    });
}

module.exports = { verifyDownloads };
