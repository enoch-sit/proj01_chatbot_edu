# AI Ethics Documentation Repository

Automated repository for downloading and archiving official AI ethics and regulation documents from Hong Kong, Europe (EU), United States, and United Kingdom, with screenshot capture capabilities using Playwright.

## 📋 Overview

This repository provides automated scripts to:
- Download official AI ethics and regulation documents (PDFs, HTML pages)
- Capture screenshots of source pages showing where documents can be found
- Track and verify downloaded files
- Generate comprehensive reports in CSV and Markdown formats

### Regions Covered

1. **Hong Kong** - Generative AI guidelines and privacy ordinances
2. **Europe (EU)** - AI Act and harmonized regulations
3. **United States** - Executive orders, blueprints, and state legislation
4. **United Kingdom** - White papers, action plans, and playbooks

## 🗂️ Repository Structure

```
ai-ethics-docs-repo/
├── downloads/              # Downloaded documents organized by region
│   ├── hong-kong/
│   ├── europe-eu/
│   ├── united-states/
│   └── united-kingdom/
├── screenshots/            # Screenshots of source pages
│   ├── hong-kong/
│   ├── europe-eu/
│   ├── united-states/
│   └── united-kingdom/
├── scripts/                # Automation scripts
│   ├── download-all.js           # Download all documents
│   ├── download-hong-kong.js     # Hong Kong specific
│   ├── download-europe.js        # EU specific
│   ├── download-united-states.js # US specific
│   ├── download-united-kingdom.js # UK specific
│   ├── verify-downloads.js       # Verify downloads
│   └── generate-report.js        # Generate reports
├── utils/                  # Helper utilities
│   └── helpers.js          # Common functions (logging, downloading, etc.)
├── logs/                   # Log files and reports
├── package.json            # Node.js dependencies
├── .env.example            # Environment configuration template
├── .gitignore             # Git ignore rules
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** (comes with Node.js)

### Installation

1. **Clone or navigate to the repository:**
   ```cmd
   cd c:\Users\user\Documents\proj01_chatbot_edu\week11_law\ai-ethics-docs-repo
   ```

2. **Install dependencies:**
   ```cmd
   npm install
   ```

3. **Install Playwright browsers:**
   ```cmd
   npx playwright install chromium
   ```

4. **Configure environment (optional):**
   ```cmd
   copy .env.example .env
   ```
   
   Edit `.env` to customize settings like timeouts, screenshot format, etc.

### Basic Usage

#### Download All Documents

```cmd
npm run download:all
```

This will:
- Download all documents from all regions
- Capture screenshots of source pages
- Save files to appropriate directories
- Generate logs

#### Download by Region

```cmd
npm run download:hk     # Hong Kong only
npm run download:eu     # Europe (EU) only
npm run download:us     # United States only
npm run download:uk     # United Kingdom only
```

#### Verify Downloads

Check what files have been downloaded:

```cmd
npm run verify
```

#### Generate Reports

Create CSV and Markdown reports of all downloaded files:

```cmd
npm run report
```

Reports are saved to the `logs/` directory.

## 📚 Documents Included

### Hong Kong
- **Generative AI Technical and Application Guideline** (PDF)
- **Personal Data (Privacy) Ordinance Cap. 486** (PDF)

### Europe (EU)
- **AI Act - Regulation (EU) 2024/1689** (PDF)

### United States
- **Removing Barriers to American Leadership in AI** (HTML)
- **Preventing Woke AI in Federal Government** (HTML)
- **America's AI Action Plan** (PDF)
- **Blueprint for an AI Bill of Rights** (PDF)
- **Colorado SB24-205 - Consumer Protections for AI** (PDF)

### United Kingdom
- **A Pro-Innovation Approach to AI Regulation White Paper** (HTML)
- **Pro-Innovation Approach - Government Response** (PDF)
- **AI Opportunities Action Plan** (HTML)
- **AI Opportunities Action Plan - Government Response** (PDF)
- **Artificial Intelligence Playbook for UK Government** (HTML)

## ⚙️ Configuration

### Environment Variables

Edit `.env` to customize behavior:

```env
# Download Settings
DOWNLOAD_TIMEOUT=60000        # Download timeout in milliseconds
MAX_RETRIES=3                 # Number of retry attempts
RETRY_DELAY=5000             # Delay between retries (ms)

# Screenshot Settings
SCREENSHOT_WIDTH=1920         # Screenshot width
SCREENSHOT_HEIGHT=1080        # Screenshot height
SCREENSHOT_FORMAT=png         # png or jpeg
SCREENSHOT_FULL_PAGE=true     # Capture full page

# Browser Settings
BROWSER_TYPE=chromium         # Browser to use
HEADLESS=true                 # Run browser in headless mode

# Logging
LOG_LEVEL=info               # Logging level
LOG_TO_FILE=true             # Save logs to file

# Rate Limiting
RATE_LIMIT_DELAY=2000        # Delay between requests (ms)
```

## 🛠️ Advanced Usage

### Running Individual Scripts

You can run scripts directly using Node.js:

```cmd
node scripts/download-hong-kong.js
node scripts/verify-downloads.js
node scripts/generate-report.js
```

### Customizing Document Lists

To add or modify documents, edit the respective script files:
- `scripts/download-hong-kong.js`
- `scripts/download-europe.js`
- `scripts/download-united-states.js`
- `scripts/download-united-kingdom.js`

Each script contains a configuration array with document details.

### Screenshot Customization

Screenshots are automatically captured when downloading documents. To customize:

1. Edit screenshot settings in `.env`
2. Modify `takeScreenshot()` function in `utils/helpers.js`

## 📊 Logging and Reporting

### Log Files

Logs are saved to `logs/` with timestamps:
- `download-YYYY-MM-DD.log` - Download activity logs

### Reports

Generate reports with:
```cmd
npm run report
```

Outputs:
- `logs/report-YYYY-MM-DD.csv` - CSV format
- `logs/report-YYYY-MM-DD.md` - Markdown format

## 🔍 Verification

To verify all downloads are complete:

```cmd
npm run verify
```

This displays:
- Total files found
- File sizes
- Breakdown by region and type

## 📝 Notes

### Rate Limiting

Scripts include delays between requests to avoid overwhelming servers. Default is 2 seconds (configurable via `RATE_LIMIT_DELAY`).

### Error Handling

- Failed downloads are logged but don't stop execution
- Retry logic is built-in for transient failures
- Check logs for detailed error information

### File Organization

- **PDFs** are downloaded directly from official sources
- **HTML pages** are saved as complete HTML files
- **Screenshots** capture the visual appearance of source pages
- All files are organized by region for easy navigation

## 🤝 Contributing

To add new documents:

1. Identify the official source URL
2. Add document configuration to appropriate regional script
3. Include both PDF/HTML URL and page URL for screenshots
4. Test the download script
5. Update this README

## 📄 License

MIT License - See LICENSE file for details

## 🔗 Document Sources

All documents are sourced from official government websites:

- **Hong Kong**: digitalpolicy.gov.hk, elegislation.gov.hk
- **EU**: eur-lex.europa.eu
- **US**: whitehouse.gov, leg.colorado.gov
- **UK**: gov.uk

## ⚠️ Important Notes

- Documents are official government publications
- URLs may change; verify links periodically
- Large PDF files may take time to download
- Screenshots require sufficient disk space
- Always respect website terms of service and robots.txt

## 🐛 Troubleshooting

### Common Issues

**Playwright not installed:**
```cmd
npx playwright install chromium
```

**Download timeouts:**
Increase `DOWNLOAD_TIMEOUT` in `.env`

**Permission errors:**
Ensure write permissions for `downloads/`, `screenshots/`, and `logs/` directories

**Missing dependencies:**
```cmd
npm install
```

## 📞 Support

For issues or questions:
1. Check logs in `logs/` directory
2. Verify `.env` configuration
3. Ensure all dependencies are installed
4. Review script output for specific error messages

---

**Last Updated:** November 2025  
**Version:** 1.0.0
