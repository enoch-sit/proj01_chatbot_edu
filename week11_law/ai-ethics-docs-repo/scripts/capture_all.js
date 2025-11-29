const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

async function captureDocument(browser, config) {
  const page = await browser.newPage();
  
  try {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`📄 Capturing: ${config.name}`);
    console.log(`🔗 URL: ${config.url}`);
    console.log('='.repeat(70));
    
    // Set viewport for consistent screenshots
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Navigate with timeout
    console.log('⏳ Loading page...');
    await page.goto(config.url, {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    console.log('✓ Page loaded');
    
    // Wait for dynamic content (especially for HK e-Legislation)
    await page.waitForTimeout(config.waitTime || 5000);
    console.log(`✓ Waited ${config.waitTime || 5000}ms for dynamic content`);
    
    // Take full page screenshot
    const screenshotPath = path.join('outputs', `${config.key}_page.png`);
    await page.screenshot({
      path: screenshotPath,
      fullPage: true
    });
    console.log(`📸 Screenshot saved: ${screenshotPath}`);
    
    // Generate PDF of the page
    const pagePdfPath = path.join('outputs', `${config.key}_page.pdf`);
    await page.pdf({
      path: pagePdfPath,
      format: 'A4',
      printBackground: true,
      margin: { 
        top: '20mm', 
        right: '15mm', 
        bottom: '20mm', 
        left: '15mm' 
      },
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: `
        <div style="font-size: 10px; text-align: center; width: 100%; padding: 5px;">
          <span>${config.url} | Captured: ${new Date().toISOString().split('T')[0]}</span>
        </div>
      `
    });
    console.log(`📄 Page PDF saved: ${pagePdfPath}`);
    
    // Find PDF download links
    console.log('🔍 Searching for PDF download links...');
    const pdfLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href*=".pdf"]'));
      return links.map(a => ({
        text: a.textContent.trim(),
        url: a.href
      })).filter(link => link.url.startsWith('http'));
    });
    
    if (pdfLinks.length > 0) {
      console.log(`✓ Found ${pdfLinks.length} PDF link(s):`);
      pdfLinks.forEach((link, i) => {
        console.log(`  ${i + 1}. ${link.text} → ${link.url}`);
      });
      
      // Download the first/primary PDF
      const primaryPdfUrl = pdfLinks[0].url;
      console.log(`📥 Downloading primary PDF from: ${primaryPdfUrl}`);
      
      const pdfPage = await browser.newPage();
      try {
        await pdfPage.goto(primaryPdfUrl, { 
          waitUntil: 'networkidle2',
          timeout: 30000
        });
        await pdfPage.waitForTimeout(2000);
        
        const officialPdfPath = path.join('outputs', `${config.key}_official.pdf`);
        await pdfPage.pdf({
          path: officialPdfPath,
          format: 'A4',
          printBackground: true
        });
        console.log(`✓ Official PDF saved: ${officialPdfPath}`);
      } catch (pdfError) {
        console.log(`⚠️  Could not download PDF directly: ${pdfError.message}`);
      } finally {
        await pdfPage.close();
      }
    } else {
      console.log('⚠️  No PDF download links found on this page');
    }
    
    // Extract page metadata
    const metadata = await page.evaluate((url) => {
      const getMetaContent = (name) => {
        const meta = document.querySelector(`meta[name="${name}"]`) || 
                     document.querySelector(`meta[property="${name}"]`);
        return meta ? meta.getAttribute('content') : '';
      };
      
      return {
        title: document.title,
        url: window.location.href,
        originalUrl: url,
        description: getMetaContent('description') || getMetaContent('og:description'),
        timestamp: new Date().toISOString(),
        lastModified: document.lastModified
      };
    }, config.url);
    
    // Save metadata as JSON
    const metadataPath = path.join('outputs', `${config.key}_metadata.json`);
    await fs.writeFile(metadataPath, JSON.stringify({
      ...metadata,
      captureDate: new Date().toISOString(),
      documentName: config.name,
      pdfLinks: pdfLinks
    }, null, 2));
    console.log(`💾 Metadata saved: ${metadataPath}`);
    
    console.log(`✅ Successfully captured: ${config.name}`);
    return { 
      success: true, 
      config, 
      metadata,
      filesCreated: {
        screenshot: screenshotPath,
        pagePdf: pagePdfPath,
        metadata: metadataPath
      }
    };
    
  } catch (error) {
    console.error(`❌ Error capturing ${config.name}: ${error.message}`);
    return { 
      success: false, 
      config, 
      error: error.message,
      stack: error.stack 
    };
  } finally {
    await page.close();
  }
}

async function main() {
  console.log('\n🚀 Starting AI Ethics Documentation Capture\n');
  
  // Create output directory
  try {
    await fs.mkdir('outputs', { recursive: true });
    console.log('✓ Output directory ready: ./outputs\n');
  } catch (err) {
    console.error('Error creating output directory:', err);
    process.exit(1);
  }
  
  // Document configurations
  const documents = [
    {
      key: 'hk_privacy_ordinance',
      name: 'Hong Kong - Personal Data (Privacy) Ordinance Cap. 486',
      url: 'https://www.elegislation.gov.hk/hk/cap486!en?INDEX_CS=N',
      waitTime: 10000  // HK e-Legislation needs more time to load
    },
    {
      key: 'uk_ai_white_paper',
      name: 'UK - AI Regulation: A Pro-Innovation Approach (White Paper)',
      url: 'https://www.gov.uk/government/publications/ai-regulation-a-pro-innovation-approach/white-paper',
      waitTime: 5000
    },
    {
      key: 'uk_ai_regulation_policy',
      name: 'UK - Establishing a Pro-Innovation Approach to Regulating AI',
      url: 'https://www.gov.uk/government/publications/establishing-a-pro-innovation-approach-to-regulating-ai',
      waitTime: 5000
    },
    {
      key: 'uk_data_ethics',
      name: 'UK - Data Ethics Framework',
      url: 'https://www.gov.uk/government/publications/data-ethics-framework',
      waitTime: 5000
    },
    {
      key: 'uk_algorithmic_transparency',
      name: 'UK - Algorithmic Transparency Standard',
      url: 'https://www.gov.uk/government/collections/algorithmic-transparency-standard',
      waitTime: 5000
    }
  ];
  
  // Launch browser
  console.log('🌐 Launching Chromium browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security'
    ]
  });
  console.log('✓ Browser launched\n');
  
  // Capture all documents
  const results = [];
  for (const doc of documents) {
    const result = await captureDocument(browser, doc);
    results.push(result);
    
    // Small delay between captures to be respectful
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  await browser.close();
  console.log('\n✓ Browser closed');
  
  // Generate summary report
  console.log('\n' + '='.repeat(70));
  console.log('📊 CAPTURE SUMMARY');
  console.log('='.repeat(70));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`Total documents: ${results.length}`);
  console.log(`✅ Successful: ${successful.length}`);
  console.log(`❌ Failed: ${failed.length}`);
  
  if (successful.length > 0) {
    console.log('\n✅ Successfully captured:');
    successful.forEach(r => {
      console.log(`  • ${r.config.name}`);
    });
  }
  
  if (failed.length > 0) {
    console.log('\n❌ Failed captures:');
    failed.forEach(r => {
      console.log(`  • ${r.config.name}`);
      console.log(`    Error: ${r.error}`);
    });
  }
  
  // Save complete summary
  const summaryPath = 'outputs/capture_summary.json';
  await fs.writeFile(summaryPath, JSON.stringify({
    captureDate: new Date().toISOString(),
    totalDocuments: results.length,
    successful: successful.length,
    failed: failed.length,
    results: results
  }, null, 2));
  
  console.log(`\n💾 Complete summary saved: ${summaryPath}`);
  console.log('\n✨ Capture process complete!\n');
}

// Run the capture
main().catch(error => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});
