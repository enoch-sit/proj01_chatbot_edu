const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

class Logger {
  constructor(logDir = './logs') {
    this.logDir = logDir;
    this.logFile = path.join(logDir, `download-${new Date().toISOString().split('T')[0]}.log`);
    fs.ensureDirSync(logDir);
  }

  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data
    };

    const logLine = `[${timestamp}] [${level.toUpperCase()}] ${message}${data ? ' | ' + JSON.stringify(data) : ''}\n`;
    
    console.log(logLine.trim());
    
    if (process.env.LOG_TO_FILE !== 'false') {
      fs.appendFileSync(this.logFile, logLine);
    }
  }

  info(message, data) {
    this.log('info', message, data);
  }

  error(message, data) {
    this.log('error', message, data);
  }

  warn(message, data) {
    this.log('warn', message, data);
  }

  success(message, data) {
    this.log('success', message, data);
  }
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function downloadFile(page, url, outputPath, logger) {
  try {
    logger.info(`Downloading from: ${url}`);
    
    // Use axios for direct file downloads (PDFs, etc.)
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'arraybuffer',
      timeout: parseInt(process.env.DOWNLOAD_TIMEOUT) || 60000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    await fs.ensureDir(path.dirname(outputPath));
    await fs.writeFile(outputPath, response.data);
    
    logger.success(`Downloaded successfully: ${path.basename(outputPath)}`, { size: response.data.length });
    return true;
  } catch (error) {
    logger.error(`Failed to download ${url}`, { error: error.message });
    return false;
  }
}

async function takeScreenshot(page, url, screenshotPath, logger, options = {}) {
  try {
    logger.info(`Navigating to: ${url}`);
    
    await page.goto(url, { 
      waitUntil: 'networkidle',
      timeout: parseInt(process.env.DOWNLOAD_TIMEOUT) || 60000 
    });
    
    await delay(2000); // Wait for page to fully render
    
    await fs.ensureDir(path.dirname(screenshotPath));
    
    const screenshotOptions = {
      path: screenshotPath,
      fullPage: options.fullPage !== false,
      type: options.type || 'png'
    };
    
    await page.screenshot(screenshotOptions);
    
    logger.success(`Screenshot saved: ${path.basename(screenshotPath)}`);
    return true;
  } catch (error) {
    logger.error(`Failed to capture screenshot for ${url}`, { error: error.message });
    return false;
  }
}

function sanitizeFilename(filename) {
  return filename.replace(/[^a-z0-9_\-\.]/gi, '_').toLowerCase();
}

module.exports = {
  Logger,
  delay,
  downloadFile,
  takeScreenshot,
  sanitizeFilename
};
