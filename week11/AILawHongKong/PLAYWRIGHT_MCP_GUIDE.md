# Playwright MCP Browser Research - Execution Guide

**Project**: AI Law Hong Kong Legal Risk Research
**Tool**: Playwright MCP Browser Automation
**Purpose**: Systematic, traceable web research using Google Search

---

## Quick Start Checklist

Before starting ANY search session:
- [ ] Read the search query from research_plan.md
- [ ] Open search log template for today's date
- [ ] Have screenshot folder ready
- [ ] Have notes template ready
- [ ] Browser tools tested and working

---

## Complete Playwright MCP Workflow

### PHASE A: Session Initialization

**A1. Start Browser & Navigate to Google**

```
Tool: mcp_playwright_browser_navigate
URL: https://www.google.com
```

**Document in search log**:
- Session start time: [HH:MM]
- Browser initialized successfully: ✓

---

### PHASE B: Execute Search

**B1. Enter Search Query**

```
Tool: mcp_playwright_browser_type
Element: "Google search box"
Ref: [search input element reference from snapshot]
Text: "[Exact query from research plan]"
```

**B2. Submit Search**

```
Option 1: mcp_playwright_browser_press_key
Key: "Enter"

Option 2: mcp_playwright_browser_click
Element: "Google Search button"
Ref: [button element reference]
```

**B3. Wait for Results**

```
Tool: mcp_playwright_browser_wait_for
Text: "About"  (wait for results count to appear)
```

**Document in search log**:
- Exact query used: "[copy exact query string]"
- Search executed at: [HH:MM]

---

### PHASE C: Capture Search Results Overview

**C1. Take Accessibility Snapshot**

```
Tool: mcp_playwright_browser_snapshot
Purpose: Get structured view of search results
```

**C2. Screenshot Search Results**

```
Tool: mcp_playwright_browser_take_screenshot
Filename: "screenshots/YYYY-MM-DD_[topic-keyword]_google-results.png"
Type: "png"
```

**C3. Document Results Overview**

In search log, record:
- Number of results shown: "[About X,XXX results]"
- Top result domain: [domain.com]
- Number of .gov.hk results visible: [count]
- Number of ads shown: [count]
- Featured snippet present: [Yes/No]

---

### PHASE D: Evaluate & Prioritize Results

**D1. Scan Results for Priority Sources**

Review snapshot and identify sources by priority:

**PRIORITY 1 - Official Hong Kong Sources** (.gov.hk, pcpd.org.hk):
- [ ] List position #[X]: [domain] - [title snippet]
- [ ] List position #[X]: [domain] - [title snippet]

**PRIORITY 2 - International Official Sources** (europa.eu, .gov):
- [ ] List position #[X]: [domain] - [title snippet]
- [ ] List position #[X]: [domain] - [title snippet]

**PRIORITY 3 - Academic/Professional** (.edu, law firms):
- [ ] List position #[X]: [domain] - [title snippet]
- [ ] List position #[X]: [domain] - [title snippet]

**PRIORITY 4 - News/Commentary**:
- [ ] List position #[X]: [domain] - [title snippet]

**D2. Select Top 3-5 Sources to Investigate**

Criteria:
- At least 1 official source (Priority 1-2) if available
- Mix of source types for corroboration
- Recent publication dates (visible in snippet)
- Relevant to specific search objective

**Document in search log**:
- Total results evaluated: [number]
- Sources selected for investigation: [number]
- Reasoning: [brief note on selection criteria applied]

---

### PHASE E: Investigate Each Source (REPEAT FOR EACH)

**E1. Pre-Click Documentation**

Before clicking on search result, record in notes template:

```markdown
## Source Metadata - PRELIMINARY

**Position in Search Results**: #[number]
**Title (from Google)**: [exact title from search result]
**URL (from Google)**: [URL shown in search result]
**Domain**: [extract domain]
**Snippet Text**: "[exact snippet from Google]"
```

**E2. Click on Search Result**

```
Tool: mcp_playwright_browser_click
Element: "[Description of search result link]"
Ref: [element reference from snapshot for specific result]
```

**E3. Wait for Page Load**

```
Tool: mcp_playwright_browser_wait_for
Time: 3  (wait 3 seconds for page to fully load)

OR if specific element expected:
Tool: mcp_playwright_browser_wait_for
Text: "[Expected page element text]"
```

**E4. Verify Page Loaded Successfully**

Check for:
- Page title matches expectation
- Not a 404 error
- Not blocked by paywall (if blocked, note in log)
- Content is in accessible language

```
Tool: mcp_playwright_browser_snapshot
Purpose: Verify page structure
```

**E5. IMMEDIATE Credibility Assessment**

**STEP 1: Check Domain Authenticity**

For .gov.hk sources:
- [ ] URL starts with https:// (secure)
- [ ] Domain ends with .gov.hk exactly
- [ ] No suspicious subdomains
- [ ] No redirects to non-government site

For pcpd.org.hk:
- [ ] Exact domain is pcpd.org.hk
- [ ] Look for official logo/header
- [ ] Check "About Us" confirms Privacy Commissioner

For other official sources:
- [ ] Cross-check domain against known official list
- [ ] Look for government seals/logos
- [ ] Check page footer for official contact info

**STEP 2: Assess Page Credibility Markers**

- [ ] Organization name clearly displayed
- [ ] Contact information present (address, phone, email)
- [ ] Publication date visible
- [ ] Author or department attribution
- [ ] Professional design (not amateur)
- [ ] No advertising (for official sources)
- [ ] Legal disclaimers present

**STEP 3: Assign Credibility Tier**

Based on assessment, assign tier:

⭐⭐⭐⭐⭐ TIER 1 - OFFICIAL/PRIMARY SOURCES
- Confirmed .gov.hk or official regulatory body
- Example: pcpd.org.hk, elegislation.gov.hk
- **Justification**: [Write 1 sentence why this is Tier 1]

⭐⭐⭐⭐ TIER 2 - SEMI-OFFICIAL SOURCES
- .edu, international bodies, court systems
- Example: hku.hk, europa.eu
- **Justification**: [Write 1 sentence why this is Tier 2]

⭐⭐⭐ TIER 3 - PROFESSIONAL SOURCES
- Major law firms, professional publishers
- Example: DLA Piper, LexisNexis
- **Justification**: [Write 1 sentence why this is Tier 3]

⭐⭐ TIER 4 - NEWS/COMMENTARY
- News outlets, legal news services
- Example: Bloomberg, SCMP
- **Justification**: [Write 1 sentence why this is Tier 4]

⭐ TIER 5 - UNVERIFIED SOURCES
- Unknown sites, blogs, forums
- **Justification**: [Write 1 sentence why this is Tier 5]
- **WARNING**: Requires corroboration from Tier 1-3 sources

**E6. Extract Complete Source Details**

Update notes file with verified information:

```markdown
## Source Metadata - VERIFIED

**Complete URL**: [Copy from address bar - exact full URL]
**Domain**: [domain.com]
**Domain Type**: [.gov.hk / .org / .com / .edu.hk / etc.]
**Credibility Tier**: ⭐⭐⭐⭐⭐ [1-5 stars]
**Credibility Justification**: [1-2 sentences explaining tier assignment]

**Page Title**: [From browser tab or page <h1>]
**Organization/Author**: [Full official name]
**Department/Division**: [If applicable]
**Contact Information**: 
  - Email: [if present]
  - Phone: [if present]
  - Address: [if present]

**Publication Date**: [DD/MM/YYYY or "Not visible"]
**Last Updated**: [DD/MM/YYYY or "Not visible"]
**Date Accessed**: [Today's date - auto]

**Document Type**: [Legislation / Guidance / Case Law / Article / Report / etc.]
**Language**: [English / Traditional Chinese / Both]
**File Format**: [HTML / PDF / Word / etc.]
```

**E7. Comprehensive Page Screenshots**

**Screenshot 1: Top of Page**
```
Tool: mcp_playwright_browser_take_screenshot
Filename: "screenshots/YYYY-MM-DD_[topic]_[domain]_page1.png"
Type: "png"
```

**Screenshot 2: Key Content Sections**

If page is long, scroll and capture additional screenshots:
```
Tool: mcp_playwright_browser_evaluate
Function: "() => window.scrollBy(0, 800)"

Then:
Tool: mcp_playwright_browser_take_screenshot
Filename: "screenshots/YYYY-MM-DD_[topic]_[domain]_page2.png"
```

Repeat scrolling/screenshots until all key content captured.

**Screenshot 3: Footer/Contact Info**
```
Tool: mcp_playwright_browser_evaluate
Function: "() => window.scrollTo(0, document.body.scrollHeight)"

Then:
Tool: mcp_playwright_browser_take_screenshot
Filename: "screenshots/YYYY-MM-DD_[topic]_[domain]_footer.png"
```

**Document in notes**:
- Screenshot files: `[list all filenames]`

**E8. Extract and Document Key Content**

```
Tool: mcp_playwright_browser_snapshot
Purpose: Extract text content for analysis
```

In notes file, document:

### Key Findings

**Finding 1: [Topic/Heading]**
- Content: [Detailed description of requirement/rule/finding]
- Source: [Specific section of page, e.g., "Section 3, paragraph 2"]
- Quote: "[Exact quote if critical]"
- Legal Citation: [If references specific law - e.g., "PDPO Section 13"]

**Finding 2: [Topic/Heading]**
- Content: [Description]
- Source: [Location on page]
- Quote: "[Exact quote]"
- Legal Citation: [Reference]

[Continue for all relevant findings...]

### Legal Framework Identified

**Laws/Regulations Mentioned**:
- **[Law Name]**: [Brief description]
  - Citation: [Specific article/section]
  - Requirement: [What it requires]
  - Penalty: [If mentioned]

**Definitions Found**:
- **[Legal Term]**: "[Definition as stated in source]"

### Requirements & Obligations

**Mandatory Requirements**:
- [ ] [Specific requirement 1]
- [ ] [Specific requirement 2]

**Recommended Practices**:
- [ ] [Best practice 1]
- [ ] [Best practice 2]

**Prohibitions**:
- ❌ [Prohibited action 1]
- ❌ [Prohibited action 2]

**E9. Document Cross-References**

Look for and document:

**Links to Other Official Documents**:
- [Link text] → [URL]
- [Link text] → [URL]

**Referenced Legislation**:
- [Name of law/regulation] - [Where it was cited]

**Related Guidance Mentioned**:
- [Title of guidance] - [Issuing body]

**Case Law Citations**:
- [Case name] ([Year]) - [Court]

**International Standards Referenced**:
- [Standard name] - [Organization]

**E10. Navigate Back to Search Results**

```
Option 1 - Use back button:
Tool: mcp_playwright_browser_navigate_back

Option 2 - If using tabs:
Tool: mcp_playwright_browser_tabs
Action: "select"
Index: [index of Google results tab]
```

---

### PHASE F: Complete Source Documentation

**F1. Create/Update Notes File**

Save comprehensive notes file:
```
Filename: /research_data/[phase_folder]/YYYY-MM-DD_[topic]_[source-type]_notes.md
```

Use notes template and ensure all sections completed:
- [x] Source metadata (verified)
- [x] Credibility assessment with justification
- [x] Key findings documented
- [x] Legal citations captured
- [x] Requirements listed
- [x] Cross-references noted
- [x] Screenshots referenced
- [x] Verification status

**F2. Verification Check**

Before moving to next source:
- [ ] URL tested (click to verify it works)
- [ ] Screenshot files exist and are readable
- [ ] Credibility tier has justification
- [ ] At least 3 key findings documented
- [ ] Source type correctly categorized
- [ ] Notes file saved

---

### PHASE G: Search Session Wrap-Up

**After completing all sources for a query:**

**G1. Update Search Log**

In `/progress_logs/YYYY-MM-DD_search-log.md`:

```markdown
### Search #[number]
**Query**: "[exact query]"
**Time**: [HH:MM - HH:MM]
**Results Found**: [Total shown by Google]
**Sources Investigated**: [Number actually visited]
**Sources Documented**: [Number with notes files created]

#### Source Summary
- Tier 1 (Official): [count]
- Tier 2 (Semi-official): [count]
- Tier 3 (Professional): [count]
- Tier 4 (News): [count]
- Tier 5 (Unverified): [count]

#### Top Sources Captured
1. **[Title]** - [Domain] - ⭐⭐⭐⭐⭐
   - URL: [URL]
   - Notes: `[filename]`
   - Key finding: [1 sentence summary]

2. **[Title]** - [Domain] - ⭐⭐⭐⭐
   - URL: [URL]
   - Notes: `[filename]`
   - Key finding: [1 sentence summary]

[Continue for all documented sources...]

#### Challenges Encountered
- [Any issues with access, paywalls, broken links]

#### Follow-Up Needed
- [ ] [Any additional searches or clarifications needed]
```

**G2. Update Research Tracker**

In `/progress_logs/research_tracker.md`:
- [x] Check off completed search query
- Update status if section completed
- Add any notes about findings

**G3. Session Quality Check**

Review entire session:
- [ ] All planned searches executed
- [ ] Minimum source requirements met (3-5 per query)
- [ ] At least 1 Tier 1-2 source if available
- [ ] All URLs verified working
- [ ] All screenshots properly named and saved
- [ ] All notes files created and complete
- [ ] Search log updated
- [ ] Research tracker updated

---

## Special Handling Scenarios

### Scenario 1: PDF Documents

If search result links to PDF:

```
Tool: mcp_playwright_browser_click (on PDF link)
[PDF may open in browser or download]

If PDF opens in browser:
Tool: mcp_playwright_browser_take_screenshot (capture PDF viewer)

If PDF downloads:
- Note filename and download location
- Open PDF separately to review
- Screenshot key pages manually
- Document as: "PDF downloaded - manual review required"
```

### Scenario 2: Paywalled Content

If source requires login/payment:

```
Document in notes:
**Access Status**: ⚠️ PAYWALLED
**Paywall Type**: [Login required / Subscription / Purchase]
**Snippet Available**: [What you can see from Google result]
**Alternative Access**: [Check for free version, author's page, institutional access]

Then:
- Try searching for free version: "[title] + filetype:pdf"
- Check if organization publishes free summary
- Note limitation in search log
- Flag for potential follow-up if critical
```

### Scenario 3: Non-English Content

If page is in Chinese or other language:

```
Document in notes:
**Language**: Traditional Chinese / Simplified Chinese / [Other]
**Translation Needed**: Yes/No
**Key Sections Identified**: [List sections even if not translated]

Strategy:
- Use browser translation if available
- Screenshot original language version
- Note key terms in original language
- Flag for professional translation if critical legal document
```

### Scenario 4: Broken Links or 404 Errors

If link doesn't work:

```
Document in search log:
**Issue**: ⚠️ BROKEN LINK / 404 ERROR
**URL Attempted**: [URL from search result]
**Error Message**: [What was displayed]

Recovery steps:
1. Try: mcp_playwright_browser_navigate to root domain
2. Use site search to find relocated content
3. Try Wayback Machine: web.archive.org
4. Search for updated version with same title
5. Document as "Source unavailable - [date]"
```

### Scenario 5: Redirected Content

If URL redirects:

```
Document both URLs:
**Original URL**: [From search result]
**Redirected URL**: [Where it actually goes]
**Redirect Type**: [Permanent / Temporary]
**Verification**: [Is redirect legitimate?]

For .gov.hk sources:
- Verify redirect stays within .gov.hk domain
- Check if it's organizational restructure (common)
- Use final URL as primary reference
```

---

## Critical Reminders

### Before Every Search
1. Know exactly what query you're executing
2. Have documentation templates ready
3. Browser is working correctly

### During Every Search
1. Document URL before clicking
2. Assess credibility immediately upon page load
3. Screenshot first, read second (in case page changes)
4. Extract exact quotes with context

### After Every Search
1. Test all URLs you documented
2. Verify screenshots are readable
3. Save notes file immediately
4. Update tracker checkbox

### Quality Mantras
- **"If it's not documented, it didn't happen"**
- **"URL accuracy is non-negotiable"**
- **".gov.hk = gold standard"**
- **"2 sources minimum for every key finding"**
- **"Screenshot everything, verify later"**

---

## Troubleshooting

### Browser Won't Load
```
Try: mcp_playwright_browser_close
Then: Restart browser session
Or: Check if Playwright MCP is installed
```

### Can't Find Element
```
Use: mcp_playwright_browser_snapshot first
Identify element reference from snapshot
Use exact ref in click/type commands
```

### Screenshot Failed
```
Check: Filename path is valid
Check: Filename has no special characters
Check: Screenshot folder exists
Retry: After page fully loads
```

### Lost Track of Tabs
```
Use: mcp_playwright_browser_tabs
Action: "list"
[Shows all open tabs with indices]
```

---

## End of Session Checklist

Before closing browser:
- [ ] All searches logged
- [ ] All sources documented
- [ ] All screenshots saved
- [ ] All notes files created
- [ ] All URLs tested
- [ ] Research tracker updated
- [ ] Search log complete
- [ ] Quality checks passed
- [ ] Follow-up items noted
- [ ] Session backed up (if applicable)

**CRITICAL**: Do not close browser until all documentation is complete and verified!
