require('dotenv').config();
const { Logger } = require('../utils/helpers');
const { downloadHongKongDocs } = require('./download-hong-kong');
const { downloadEuropeDocs } = require('./download-europe');
const { downloadUnitedStatesDocs } = require('./download-united-states');
const { downloadUnitedKingdomDocs } = require('./download-united-kingdom');

const logger = new Logger();

async function downloadAll() {
  logger.info('Starting complete download process for all regions');
  
  const startTime = Date.now();
  const allResults = {
    hongKong: null,
    europe: null,
    unitedStates: null,
    unitedKingdom: null
  };

  try {
    // Download Hong Kong documents
    logger.info('=== Processing Hong Kong ===');
    allResults.hongKong = await downloadHongKongDocs();
    
    // Download Europe documents
    logger.info('\n=== Processing Europe (EU) ===');
    allResults.europe = await downloadEuropeDocs();
    
    // Download United States documents
    logger.info('\n=== Processing United States ===');
    allResults.unitedStates = await downloadUnitedStatesDocs();
    
    // Download United Kingdom documents
    logger.info('\n=== Processing United Kingdom ===');
    allResults.unitedKingdom = await downloadUnitedKingdomDocs();
    
  } catch (error) {
    logger.error('Error during download process', { error: error.message });
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  // Generate summary
  const totalDownloaded = Object.values(allResults).reduce(
    (sum, result) => sum + (result?.downloaded?.length || 0), 
    0
  );
  const totalFailed = Object.values(allResults).reduce(
    (sum, result) => sum + (result?.failed?.length || 0), 
    0
  );
  const totalScreenshots = Object.values(allResults).reduce(
    (sum, result) => sum + (result?.screenshots?.length || 0), 
    0
  );

  console.log('\n' + '='.repeat(60));
  console.log('COMPLETE DOWNLOAD SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total documents downloaded: ${totalDownloaded}`);
  console.log(`Total failed: ${totalFailed}`);
  console.log(`Total screenshots: ${totalScreenshots}`);
  console.log(`Duration: ${duration} seconds`);
  console.log('='.repeat(60));

  // Detailed breakdown
  console.log('\nDetailed Breakdown:');
  console.log(`Hong Kong: ${allResults.hongKong?.downloaded?.length || 0} downloaded, ${allResults.hongKong?.failed?.length || 0} failed`);
  console.log(`Europe (EU): ${allResults.europe?.downloaded?.length || 0} downloaded, ${allResults.europe?.failed?.length || 0} failed`);
  console.log(`United States: ${allResults.unitedStates?.downloaded?.length || 0} downloaded, ${allResults.unitedStates?.failed?.length || 0} failed`);
  console.log(`United Kingdom: ${allResults.unitedKingdom?.downloaded?.length || 0} downloaded, ${allResults.unitedKingdom?.failed?.length || 0} failed`);

  return allResults;
}

// Run if called directly
if (require.main === module) {
  downloadAll()
    .then(results => {
      const totalFailed = Object.values(results).reduce(
        (sum, result) => sum + (result?.failed?.length || 0), 
        0
      );
      process.exit(totalFailed > 0 ? 1 : 0);
    })
    .catch(error => {
      logger.error('Fatal error', { error: error.message });
      process.exit(1);
    });
}

module.exports = { downloadAll };
