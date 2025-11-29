/**
 * Robust Document Capture Script for Playwright MCP
 * Handles page loading, PDF generation, and screenshot capture
 */

const CONFIGS = {
  // Document configurations with URLs and selectors
  documents: {
    'hk_privacy_ordinance': {
      url: 'https://www.elegislation.gov.hk/hk/cap486!en?INDEX_CS=N',
      waitFor: 'networkidle',
      timeout: 60000,
      pdfName: 'hk_privacy_ordinance_full.pdf',
      screenshotName: 'hk_privacy_ordinance_page.png'
    },
    'uk_ai_white_paper_pdf': {
      url: 'https://www.gov.uk/government/publications/ai-regulation-a-pro-innovation-approach',
      waitFor: 'domcontentloaded',
      timeout: 30000,
      findPdfLink: true, // Will search for PDF download link
      pdfName: 'uk_ai_white_paper.pdf',
      screenshotName: 'uk_ai_white_paper_page.png'
    },
    'uk_ai_regulation_policy': {
      url: 'https://www.gov.uk/government/publications/establishing-a-pro-innovation-approach-to-regulating-ai',
      waitFor: 'domcontentloaded',
      timeout: 30000,
      findPdfLink: true,
      pdfName: 'uk_ai_regulation_policy.pdf',
      screenshotName: 'uk_ai_regulation_policy_page.png'
    },
    'uk_data_ethics_framework': {
      url: 'https://www.gov.uk/government/publications/data-ethics-framework',
      waitFor: 'domcontentloaded',
      timeout: 30000,
      findPdfLink: true,
      pdfName: 'uk_data_ethics_framework.pdf',
      screenshotName: 'uk_data_ethics_framework_page.png'
    },
    'uk_algorithmic_transparency': {
      url: 'https://www.gov.uk/government/collections/algorithmic-transparency-standard',
      waitFor: 'domcontentloaded',
      timeout: 30000,
      findPdfLink: true,
      pdfName: 'uk_algorithmic_transparency.pdf',
      screenshotName: 'uk_algorithmic_transparency_page.png'
    }
  }
};

/**
 * Main capture function
 */
async function captureDocument(page, documentKey) {
  const config = CONFIGS.documents[documentKey];
  if (!config) {
    throw new Error(`Unknown document: ${documentKey}`);
  }

  console.log(`[${documentKey}] Starting capture...`);
  console.log(`[${documentKey}] URL: ${config.url}`);

  try {
    // Navigate with retry logic
    await navigateWithRetry(page, config.url, config.waitFor, config.timeout);
    
    // Wait for any dynamic content
    await page.waitForTimeout(3000);

    // Take full page screenshot
    console.log(`[${documentKey}] Taking screenshot...`);
    await page.screenshot({
      path: config.screenshotName,
      fullPage: true
    });
    console.log(`[${documentKey}] ✓ Screenshot saved: ${config.screenshotName}`);

    // Generate PDF of the page
    console.log(`[${documentKey}] Generating page PDF...`);
    await page.pdf({
      path: config.pdfName,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    });
    console.log(`[${documentKey}] ✓ PDF saved: ${config.pdfName}`);

    // Find and download actual PDF if configured
    if (config.findPdfLink) {
      console.log(`[${documentKey}] Searching for PDF download link...`);
      const pdfUrl = await findPdfDownloadLink(page);
      if (pdfUrl) {
        console.log(`[${documentKey}] Found PDF: ${pdfUrl}`);
        
        // Navigate to PDF
        await page.goto(pdfUrl, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(2000);
        
        // Save the actual PDF document
        const actualPdfName = config.pdfName.replace('.pdf', '_official.pdf');
        await page.pdf({
          path: actualPdfName,
          format: 'A4',
          printBackground: true
        });
        console.log(`[${documentKey}] ✓ Official PDF saved: ${actualPdfName}`);
      } else {
        console.log(`[${documentKey}] ⚠ No PDF link found on page`);
      }
    }

    // Extract metadata
    const metadata = await extractMetadata(page, config.url);
    console.log(`[${documentKey}] Metadata:`, metadata);

    return {
      success: true,
      documentKey,
      files: {
        screenshot: config.screenshotName,
        pdf: config.pdfName
      },
      metadata
    };

  } catch (error) {
    console.error(`[${documentKey}] ✗ Error:`, error.message);
    return {
      success: false,
      documentKey,
      error: error.message
    };
  }
}

/**
 * Navigate with retry logic
 */
async function navigateWithRetry(page, url, waitFor, timeout, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`  Attempt ${i + 1}/${maxRetries}: Navigating to ${url}`);
      await page.goto(url, { 
        waitUntil: waitFor, 
        timeout: timeout 
      });
      console.log(`  ✓ Navigation successful`);
      return;
    } catch (error) {
      console.log(`  ✗ Attempt ${i + 1} failed: ${error.message}`);
      if (i === maxRetries - 1) throw error;
      await page.waitForTimeout(2000); // Wait before retry
    }
  }
}

/**
 * Find PDF download link on gov.uk pages
 */
async function findPdfDownloadLink(page) {
  try {
    // Common PDF link patterns on gov.uk
    const pdfUrl = await page.evaluate(() => {
      // Look for direct PDF links
      const pdfLinks = Array.from(document.querySelectorAll('a[href*=".pdf"]'));
      
      // Prioritize links with specific text
      const downloadLink = pdfLinks.find(link => 
        link.textContent.toLowerCase().includes('download') ||
        link.textContent.toLowerCase().includes('pdf') ||
        link.href.includes('assets.publishing.service.gov.uk')
      );
      
      if (downloadLink) return downloadLink.href;
      
      // Fallback: return first PDF link
      if (pdfLinks.length > 0) return pdfLinks[0].href;
      
      return null;
    });
    
    return pdfUrl;
  } catch (error) {
    console.log(`  Error finding PDF link: ${error.message}`);
    return null;
  }
}

/**
 * Extract page metadata
 */
async function extractMetadata(page, originalUrl) {
  try {
    return await page.evaluate((url) => {
      return {
        title: document.title || 'Unknown',
        url: window.location.href,
        originalUrl: url,
        timestamp: new Date().toISOString(),
        description: document.querySelector('meta[name="description"]')?.content || '',
        lastModified: document.lastModified || ''
      };
    }, originalUrl);
  } catch (error) {
    return {
      title: 'Unknown',
      url: originalUrl,
      timestamp: new Date().toISOString(),
      error: error.message
    };
  }
}

/**
 * Batch capture multiple documents
 */
async function batchCapture(page, documentKeys) {
  const results = [];
  
  for (const key of documentKeys) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Processing: ${key}`);
    console.log('='.repeat(60));
    
    const result = await captureDocument(page, key);
    results.push(result);
    
    // Wait between captures to avoid rate limiting
    await page.waitForTimeout(2000);
  }
  
  return results;
}

// Export for use with Playwright MCP
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    captureDocument,
    batchCapture,
    CONFIGS
  };
}
