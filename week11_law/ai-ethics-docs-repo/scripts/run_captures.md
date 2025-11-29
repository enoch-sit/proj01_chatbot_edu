# How to Run Document Captures

## Method 1: Using Playwright MCP Browser Tools (When Available)

### Step-by-step for each document:

```javascript
// 1. Navigate to the page
await page.goto('https://www.elegislation.gov.hk/hk/cap486!en?INDEX_CS=N', {
  waitUntil: 'networkidle',
  timeout: 60000
});

// 2. Wait for JavaScript to finish loading
await page.waitForTimeout(5000);

// 3. Take screenshot
await page.screenshot({
  path: 'hk_privacy_ordinance.png',
  fullPage: true
});

// 4. Save as PDF
await page.pdf({
  path: 'hk_privacy_ordinance.pdf',
  format: 'A4',
  printBackground: true,
  margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' }
});

// 5. Extract PDF links
const pdfLinks = await page.evaluate(() => {
  return Array.from(document.querySelectorAll('a[href*=".pdf"]'))
    .map(a => ({ text: a.textContent.trim(), url: a.href }));
});
console.log(pdfLinks);
```

## Method 2: Using Puppeteer Directly (More Reliable)

### Install Puppeteer:
```powershell
cd C:\Users\user\Documents\proj01_chatbot_edu\week11_law\ai-ethics-docs-repo
npm init -y
npm install puppeteer
```

### Create standalone script:

**File: `capture_all.js`**
```javascript
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

async function captureDocument(browser, config) {
  const page = await browser.newPage();
  
  try {
    console.log(`Capturing: ${config.name}`);
    console.log(`URL: ${config.url}`);
    
    // Navigate
    await page.goto(config.url, {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    
    // Wait for dynamic content
    await page.waitForTimeout(5000);
    
    // Screenshot
    const screenshotPath = path.join('outputs', `${config.key}_page.png`);
    await page.screenshot({
      path: screenshotPath,
      fullPage: true
    });
    console.log(`✓ Screenshot: ${screenshotPath}`);
    
    // PDF of page
    const pagePdfPath = path.join('outputs', `${config.key}_page.pdf`);
    await page.pdf({
      path: pagePdfPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' }
    });
    console.log(`✓ Page PDF: ${pagePdfPath}`);
    
    // Find PDF links
    const pdfLinks = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a[href*=".pdf"]'))
        .map(a => a.href)
        .filter(href => href.startsWith('http'));
    });
    
    // Download official PDFs
    if (pdfLinks.length > 0) {
      console.log(`Found ${pdfLinks.length} PDF link(s)`);
      for (let i = 0; i < pdfLinks.length; i++) {
        const pdfUrl = pdfLinks[i];
        console.log(`Downloading PDF ${i + 1}: ${pdfUrl}`);
        
        const pdfPage = await browser.newPage();
        await pdfPage.goto(pdfUrl, { waitUntil: 'networkidle2' });
        await pdfPage.waitForTimeout(2000);
        
        const pdfPath = path.join('outputs', `${config.key}_doc${i + 1}.pdf`);
        await pdfPage.pdf({
          path: pdfPath,
          format: 'A4'
        });
        console.log(`✓ PDF ${i + 1}: ${pdfPath}`);
        await pdfPage.close();
      }
    }
    
    // Extract metadata
    const metadata = await page.evaluate(() => ({
      title: document.title,
      url: window.location.href,
      timestamp: new Date().toISOString()
    }));
    
    // Save metadata
    const metadataPath = path.join('outputs', `${config.key}_metadata.json`);
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
    console.log(`✓ Metadata: ${metadataPath}\n`);
    
    return { success: true, config, metadata };
    
  } catch (error) {
    console.error(`✗ Error: ${error.message}\n`);
    return { success: false, config, error: error.message };
  } finally {
    await page.close();
  }
}

async function main() {
  // Create output directory
  await fs.mkdir('outputs', { recursive: true });
  
  const documents = [
    {
      key: 'hk_privacy_ordinance',
      name: 'HK Privacy Ordinance',
      url: 'https://www.elegislation.gov.hk/hk/cap486!en?INDEX_CS=N'
    },
    {
      key: 'uk_ai_white_paper',
      name: 'UK AI White Paper',
      url: 'https://www.gov.uk/government/publications/ai-regulation-a-pro-innovation-approach/white-paper'
    },
    {
      key: 'uk_ai_regulation_policy',
      name: 'UK AI Regulation Policy',
      url: 'https://www.gov.uk/government/publications/establishing-a-pro-innovation-approach-to-regulating-ai'
    },
    {
      key: 'uk_data_ethics',
      name: 'UK Data Ethics Framework',
      url: 'https://www.gov.uk/government/publications/data-ethics-framework'
    },
    {
      key: 'uk_algorithmic_transparency',
      name: 'UK Algorithmic Transparency',
      url: 'https://www.gov.uk/government/collections/algorithmic-transparency-standard'
    }
  ];
  
  console.log('Starting document capture...\n');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const results = [];
  for (const doc of documents) {
    const result = await captureDocument(browser, doc);
    results.push(result);
  }
  
  await browser.close();
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('CAPTURE SUMMARY');
  console.log('='.repeat(60));
  const successful = results.filter(r => r.success).length;
  console.log(`Total: ${results.length}`);
  console.log(`Successful: ${successful}`);
  console.log(`Failed: ${results.length - successful}`);
  
  // Save summary
  await fs.writeFile(
    'outputs/capture_summary.json',
    JSON.stringify(results, null, 2)
  );
}

main().catch(console.error);
```

### Run it:
```powershell
node capture_all.js
```

## Method 3: Using Selenium with Python (Alternative)

### Install:
```powershell
pip install selenium webdriver-manager
```

### Script:
```python
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import time
import json

def capture_document(driver, config):
    try:
        print(f"Capturing: {config['name']}")
        print(f"URL: {config['url']}")
        
        driver.get(config['url'])
        time.sleep(5)  # Wait for page load
        
        # Screenshot
        screenshot_path = f"outputs/{config['key']}_page.png"
        driver.save_screenshot(screenshot_path)
        print(f"✓ Screenshot: {screenshot_path}")
        
        # Execute print to PDF (Chrome only)
        pdf_path = f"outputs/{config['key']}_page.pdf"
        result = driver.execute_cdp_cmd("Page.printToPDF", {
            "printBackground": True,
            "landscape": False,
            "paperWidth": 8.27,
            "paperHeight": 11.69
        })
        
        with open(pdf_path, 'wb') as f:
            import base64
            f.write(base64.b64decode(result['data']))
        print(f"✓ PDF: {pdf_path}")
        
        return True
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

# Setup
chrome_options = Options()
chrome_options.add_argument('--headless')
chrome_options.add_argument('--no-sandbox')

driver = webdriver.Chrome(
    service=Service(ChromeDriverManager().install()),
    options=chrome_options
)

# Documents to capture
documents = [
    {
        "key": "hk_privacy_ordinance",
        "name": "HK Privacy Ordinance",
        "url": "https://www.elegislation.gov.hk/hk/cap486!en?INDEX_CS=N"
    },
    # ... add more
]

for doc in documents:
    capture_document(driver, doc)

driver.quit()
```

## Method 4: Playwright MCP with Firefox/WebKit

If Chrome/Chromium is causing issues, try different browsers:

```javascript
// In Playwright MCP settings, change browser
{
  "playwright-mcp.browser": "firefox"  // or "webkit"
}
```

## Current Status & Next Steps

### Already Captured (via Playwright MCP):
- ✅ US Executive Order 14110 (2 files)
- ✅ US Executive Order 13960 (2 files)
- ✅ US NIST AI RMF (2 files)
- ✅ US Colorado SB24-205 (2 files)
- ✅ EU AI Act (2 files)
- ✅ HK Generative AI (2 screenshots)
- ✅ UK AI White Paper (1 page PDF)
- ⚠️ HK Privacy Ordinance (1 screenshot, needs PDF)

### Need to Capture:
1. HK Privacy Ordinance - Full PDF
2. UK AI White Paper - Official PDF document
3. UK AI Regulation Policy - Page + PDF
4. UK Data Ethics Framework - Page + PDF
5. UK Algorithmic Transparency - Page + PDF

### Recommended Approach:
1. **Try Puppeteer standalone** (most reliable)
2. **Fallback to manual browser** capture if automated fails
3. **Document all URLs** and verification dates

## Quick Test Command

Test if Playwright MCP is working:
```javascript
await page.goto('https://example.com');
await page.screenshot({ path: 'test.png' });
```

If this fails → Use Puppeteer/Selenium
If this works → Run batch captures with custom scripts
