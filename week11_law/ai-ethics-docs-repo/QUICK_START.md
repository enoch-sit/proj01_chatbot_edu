# Quick Start Guide

This guide will help you get started with the AI Ethics Documentation Repository.

## Step-by-Step Setup

### 1. Install Node.js

If you don't have Node.js installed:
- Download from: https://nodejs.org/
- Install the LTS (Long Term Support) version
- Verify installation:
  ```cmd
  node --version
  npm --version
  ```

### 2. Navigate to Project Directory

```cmd
cd c:\Users\user\Documents\proj01_chatbot_edu\week11_law\ai-ethics-docs-repo
```

### 3. Install Dependencies

```cmd
npm install
```

This will install:
- Playwright (browser automation)
- Axios (HTTP client)
- Cheerio (HTML parser)
- CSV utilities
- Other supporting libraries

### 4. Install Playwright Browsers

```cmd
npx playwright install chromium
```

This downloads the Chromium browser needed for automation.

### 5. Configure Environment (Optional)

```cmd
copy .env.example .env
```

Then edit `.env` if you want to customize settings.

### 6. Run Your First Download

Test with a single region:

```cmd
npm run download:hk
```

Or download everything:

```cmd
npm run download:all
```

### 7. Verify Downloads

```cmd
npm run verify
```

### 8. Generate Report

```cmd
npm run report
```

## What Gets Created

After running downloads, you'll have:

```
ai-ethics-docs-repo/
├── downloads/
│   ├── hong-kong/
│   │   ├── hk_generative_ai_guideline.pdf
│   │   └── hk_personal_data_privacy_ordinance.pdf
│   ├── europe-eu/
│   │   └── eu_ai_act_regulation_2024_1689.pdf
│   ├── united-states/
│   │   ├── us_removing_barriers_ai_leadership.html
│   │   ├── us_preventing_woke_ai.html
│   │   ├── us_americas_ai_action_plan.pdf
│   │   ├── us_blueprint_ai_bill_of_rights.pdf
│   │   └── us_colorado_sb24_205_ai_act.pdf
│   └── united-kingdom/
│       ├── uk_pro_innovation_ai_regulation_white_paper.html
│       ├── uk_pro_innovation_government_response.pdf
│       ├── uk_ai_opportunities_action_plan.html
│       ├── uk_ai_opportunities_government_response.pdf
│       └── uk_ai_playbook_government.html
├── screenshots/
│   └── (organized by region with PNG screenshots)
└── logs/
    ├── download-YYYY-MM-DD.log
    ├── report-YYYY-MM-DD.csv
    └── report-YYYY-MM-DD.md
```

## Common Commands

### Download Commands

```cmd
npm run download:all     # All regions
npm run download:hk      # Hong Kong only
npm run download:eu      # Europe only
npm run download:us      # United States only
npm run download:uk      # United Kingdom only
```

### Screenshot Commands

```cmd
npm run screenshot:all   # All page screenshots
npm run screenshot:hk    # Hong Kong pages
npm run screenshot:eu    # Europe pages
npm run screenshot:us    # US pages
npm run screenshot:uk    # UK pages
```

### Utility Commands

```cmd
npm run verify          # Verify what's been downloaded
npm run report          # Generate CSV and Markdown reports
npm run full-capture    # Download everything and take screenshots
```

## Troubleshooting

### "Playwright not found"

Run:
```cmd
npx playwright install chromium
```

### "Permission denied" errors

Make sure you have write permissions for the project directory.

### Downloads timing out

Edit `.env` and increase `DOWNLOAD_TIMEOUT`:
```
DOWNLOAD_TIMEOUT=120000
```

### Network errors

Check your internet connection and try again. The scripts have built-in retry logic.

## Next Steps

1. Review downloaded documents in the `downloads/` folder
2. Check screenshots in the `screenshots/` folder
3. Review logs in the `logs/` folder
4. Generate reports with `npm run report`
5. Customize scripts in the `scripts/` folder to add more documents

## Support

- Check the main README.md for detailed documentation
- Review log files in `logs/` for error details
- Ensure all dependencies are installed with `npm install`

---

Happy downloading! 📚
