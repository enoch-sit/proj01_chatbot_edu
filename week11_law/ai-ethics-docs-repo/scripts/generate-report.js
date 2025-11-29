require('dotenv').config();
const fs = require('fs-extra');
const path = require('path');
const { createObjectCsvWriter } = require('csv-writer');
const { Logger } = require('../utils/helpers');

const logger = new Logger();

async function generateReport() {
  logger.info('Generating comprehensive report');
  
  const regions = ['hong-kong', 'europe-eu', 'united-states', 'united-kingdom'];
  const reportData = [];

  for (const region of regions) {
    const downloadDir = path.join(__dirname, '../downloads', region);
    const screenshotDir = path.join(__dirname, '../screenshots', region);

    // Check downloads
    if (await fs.pathExists(downloadDir)) {
      const files = await fs.readdir(downloadDir);
      for (const file of files) {
        const filePath = path.join(downloadDir, file);
        const stats = await fs.stat(filePath);
        reportData.push({
          region: region,
          type: 'Document',
          filename: file,
          size_kb: (stats.size / 1024).toFixed(2),
          modified: stats.mtime.toISOString(),
          path: filePath
        });
      }
    }

    // Check screenshots
    if (await fs.pathExists(screenshotDir)) {
      const files = await fs.readdir(screenshotDir);
      for (const file of files) {
        const filePath = path.join(screenshotDir, file);
        const stats = await fs.stat(filePath);
        reportData.push({
          region: region,
          type: 'Screenshot',
          filename: file,
          size_kb: (stats.size / 1024).toFixed(2),
          modified: stats.mtime.toISOString(),
          path: filePath
        });
      }
    }
  }

  // Write CSV report
  const csvPath = path.join(__dirname, '../logs', `report-${new Date().toISOString().split('T')[0]}.csv`);
  const csvWriter = createObjectCsvWriter({
    path: csvPath,
    header: [
      { id: 'region', title: 'Region' },
      { id: 'type', title: 'Type' },
      { id: 'filename', title: 'Filename' },
      { id: 'size_kb', title: 'Size (KB)' },
      { id: 'modified', title: 'Last Modified' },
      { id: 'path', title: 'File Path' }
    ]
  });

  await csvWriter.writeRecords(reportData);
  logger.success(`CSV report generated: ${csvPath}`);

  // Generate markdown report
  const mdPath = path.join(__dirname, '../logs', `report-${new Date().toISOString().split('T')[0]}.md`);
  let markdown = '# AI Ethics Documentation Repository Report\n\n';
  markdown += `Generated: ${new Date().toISOString()}\n\n`;
  markdown += `Total Files: ${reportData.length}\n\n`;
  
  markdown += '## Summary by Region\n\n';
  for (const region of regions) {
    const regionData = reportData.filter(r => r.region === region);
    const docs = regionData.filter(r => r.type === 'Document');
    const screenshots = regionData.filter(r => r.type === 'Screenshot');
    
    markdown += `### ${region.toUpperCase()}\n`;
    markdown += `- Documents: ${docs.length}\n`;
    markdown += `- Screenshots: ${screenshots.length}\n`;
    markdown += `- Total Size: ${(regionData.reduce((sum, r) => sum + parseFloat(r.size_kb), 0) / 1024).toFixed(2)} MB\n\n`;
    
    if (docs.length > 0) {
      markdown += '#### Documents\n';
      docs.forEach(d => {
        markdown += `- ${d.filename} (${d.size_kb} KB)\n`;
      });
      markdown += '\n';
    }
  }

  markdown += '## Document Inventory\n\n';
  markdown += '| Region | Type | Filename | Size (KB) | Last Modified |\n';
  markdown += '|--------|------|----------|-----------|---------------|\n';
  reportData.forEach(row => {
    markdown += `| ${row.region} | ${row.type} | ${row.filename} | ${row.size_kb} | ${new Date(row.modified).toLocaleDateString()} |\n`;
  });

  await fs.writeFile(mdPath, markdown);
  logger.success(`Markdown report generated: ${mdPath}`);

  console.log('\n' + '='.repeat(60));
  console.log('REPORT GENERATION COMPLETE');
  console.log('='.repeat(60));
  console.log(`CSV Report: ${csvPath}`);
  console.log(`Markdown Report: ${mdPath}`);
  console.log(`Total Files Cataloged: ${reportData.length}`);
  console.log('='.repeat(60));

  return { csvPath, mdPath, reportData };
}

// Run if called directly
if (require.main === module) {
  generateReport()
    .then(() => {
      logger.success('Report generation completed');
      process.exit(0);
    })
    .catch(error => {
      logger.error('Fatal error', { error: error.message });
      process.exit(1);
    });
}

module.exports = { generateReport };
