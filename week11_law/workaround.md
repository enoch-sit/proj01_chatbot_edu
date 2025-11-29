# Workaround Plan: Manual Browser-Based Document Collection
**Date**: November 21, 2025  
**Purpose**: Backup strategy if automated Playwright scripts fail

---

## When to Use This Plan

**Triggers**:
- ✗ Playwright browser installation fails
- ✗ Automated scripts timeout or crash
- ✗ Network issues prevent bulk downloads
- ✗ URLs return 404 errors (need manual URL hunting)
- ✗ JavaScript-heavy sites don't render properly in headless browser

**Advantage**: 100% reliable - uses regular browser that definitely works

**Disadvantage**: Time-consuming - estimated 1-2 hours for all 16 documents

---

## Tools Required

**Built-in Windows Tools**:
- ✅ Microsoft Edge or Chrome browser
- ✅ Windows Snipping Tool (Win + Shift + S)
- ✅ File Explorer
- ✅ PowerShell (for organization)

**Optional Tools**:
- PDF printer driver (built into Windows 10/11)
- Browser extensions for full-page screenshots (e.g., GoFullPage)

---

## Manual Collection Process

### Step-by-Step for Each Document

#### 1. Navigate to Official Source
**Example**: Hong Kong Generative AI Guideline
```
URL: https://www.digitalpolicy.gov.hk/en/our_work/data_governance/policies_standards/ethical_ai_framework/
```

**Actions**:
1. Open URL in browser
2. Wait for page to fully load
3. Verify this is the official government site (check domain, SSL cert)

#### 2. Capture Screenshot
**Method A: Windows Snipping Tool**
```
Win + Shift + S
Select "Full Screen" or "Window"
Screenshot saves to clipboard
Paste into Paint → Save as PNG
```

**Naming Convention**: `{region}_{doc_name}_page.png`  
**Example**: `hk_generative_ai_guideline_page.png`

**Save Location**: `screenshots/{region}/`

**Method B: Browser Print to PDF**
```
Ctrl + P (Print)
Select "Microsoft Print to PDF"
Save with same naming convention
```

**Important**: Ensure URL bar is visible in screenshot!

#### 3. Download Document
**For PDFs**:
1. Click PDF link on page
2. Wait for PDF to open
3. Click Download button
4. Save with naming convention: `{region}_{doc_name}.pdf`
5. Save to: `downloads/{region}/`

**For HTML Pages**:
```
Ctrl + S (Save page)
Select "Webpage, Complete" 
Save with naming: {region}_{doc_name}.html
Save to: downloads/{region}/
```

**Alternative - Print to PDF**:
```
Ctrl + P
Select "Microsoft Print to PDF"
Check "Background graphics"
Save as: {region}_{doc_name}_webpage.pdf
```

#### 4. Verify Download
**Checklist**:
- [ ] File size > 0 KB
- [ ] PDF opens and is readable
- [ ] HTML preserves content and formatting
- [ ] Screenshot shows URL clearly

#### 5. Document Metadata
**Create text file**: `downloads/{region}/{doc_name}_metadata.txt`

```
Document: [Full Title]
Official URL: [URL]
PDF Direct URL: [If different]
Download Date: 2025-11-21
Download Method: Manual Browser
Browser: Edge/Chrome [version]
Verified By: [Your name]
File Size: [XX MB]
Status: ✓ Verified Accessible
```

---

## Document-by-Document Guide

### Hong Kong (2 documents)

#### HK-1: Generative AI Guideline
**Page URL**: https://www.digitalpolicy.gov.hk/en/our_work/data_governance/policies_standards/ethical_ai_framework/  
**PDF URL**: https://www.digitalpolicy.gov.hk/en/content_upload/HK_Generative_AI_Technical_and_Application_Guideline_en.pdf

**Steps**:
1. Navigate to page URL
2. Screenshot the page (shows guideline context)
3. Click PDF link or navigate directly to PDF URL
4. Download PDF
5. Save as: `hk_generative_ai_guideline.pdf`

**Known Issues**: None - straightforward download

---

#### HK-2: Privacy Ordinance
**Page URL**: https://www.elegislation.gov.hk/hk/cap486  
**PDF URL**: https://www.elegislation.gov.hk/hk/cap486!en.pdf

**Steps**:
1. Navigate to page URL
2. **WAIT** - Page uses heavy JavaScript (may take 10-15 seconds)
3. Screenshot once fully loaded
4. Click "Download Verified PDF (with legal status)"
5. Save as: `hk_personal_data_privacy_ordinance.pdf`

**Known Issues**: 
- Slow loading (JavaScript-heavy)
- Multiple PDF format options (choose "Verified PDF with legal status")

**Workaround**: If page won't load, use direct PDF URL

---

### Europe/EU (1 document)

#### EU-1: AI Act
**Page URL**: https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng  
**PDF URL**: https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=OJ:L_202401689

**Steps**:
1. Navigate to page URL
2. Screenshot (shows EUR-Lex official page)
3. Click "PDF" button or use direct PDF URL
4. Download (large file ~10-20 MB)
5. Save as: `eu_ai_act_regulation_2024_1689.pdf`

**Known Issues**: None - reliable EUR-Lex site

---

### United States (5 documents)

#### US-1: Removing Barriers to AI Leadership
**URL**: https://www.whitehouse.gov/presidential-actions/2025/01/removing-barriers-to-american-leadership-in-artificial-intelligence/

**Steps**:
1. Navigate to URL
2. Screenshot page
3. Save complete HTML: Ctrl + S → "Webpage, Complete"
4. Save as: `us_removing_barriers_ai_leadership.html`

**Alternative**: Print to PDF

**Known Issues**: None

---

#### US-2: Preventing Woke AI
**URL**: https://www.whitehouse.gov/presidential-actions/2025/07/preventing-woke-ai-in-the-federal-government/

**Steps**: Same as US-1
**Save as**: `us_preventing_woke_ai.html`

---

#### US-3: America's AI Action Plan
**PDF URL**: https://www.whitehouse.gov/wp-content/uploads/2025/07/Americas-AI-Action-Plan.pdf

**Steps**:
1. Navigate directly to PDF URL
2. Screenshot browser showing PDF
3. Download PDF
4. Save as: `us_americas_ai_action_plan.pdf`

---

#### US-4: Blueprint for AI Bill of Rights
**Page URL**: https://www.whitehouse.gov/ostp/ai-bill-of-rights/  
**PDF URL**: https://www.whitehouse.gov/wp-content/uploads/2022/10/Blueprint-for-an-AI-Bill-of-Rights.pdf

**Steps**:
1. Navigate to page URL
2. Screenshot page
3. Download PDF from link or direct URL
4. Save as: `us_blueprint_ai_bill_of_rights.pdf`

---

#### US-5: Colorado SB24-205
**Bill Page**: http://leg.colorado.gov/bills/sb24-205  
**PDF URL**: https://leg.colorado.gov/sites/default/files/documents/2024A/bills/2024a_205_enr.pdf

**Steps**:
1. Navigate to bill page
2. Screenshot (shows bill status)
3. Download enrolled PDF
4. Save as: `us_colorado_sb24_205_ai_act.pdf`

**Known Issues**: May redirect - use enrolled version

---

### United Kingdom (5 documents)

#### UK-1: Pro-Innovation White Paper
**Page URL**: https://www.gov.uk/government/publications/ai-regulation-a-pro-innovation-approach/white-paper  
**PDF URL**: Check page for latest PDF link

**Steps**:
1. Navigate to page URL
2. Screenshot HTML page
3. Save HTML: Ctrl + S
4. Save as: `uk_pro_innovation_ai_regulation_white_paper.html`
5. Look for "Download PDF" link
6. If found, download and save

**Known Issues**: May need to search gov.uk if URL changed

---

#### UK-2: Government Response PDF
**PDF URL**: https://assets.publishing.service.gov.uk/media/65c1e399c43191000d1a45f4/a-pro-innovation-approach-to-ai-regulation-amended-governement-response-web-ready.pdf

**Steps**:
1. Navigate directly to PDF
2. Screenshot
3. Download
4. Save as: `uk_pro_innovation_government_response.pdf`

---

#### UK-3: AI Opportunities Action Plan
**Page URL**: https://www.gov.uk/government/publications/ai-opportunities-action-plan/ai-opportunities-action-plan

**Steps**:
1. Navigate to page
2. Screenshot
3. Save HTML
4. Save as: `uk_ai_opportunities_action_plan.html`

---

#### UK-4: Action Plan Government Response
**PDF URL**: https://assets.publishing.service.gov.uk/media/678639913a9388161c5d2376/ai_opportunities_action_plan_government_repsonse.pdf

**Steps**:
1. Navigate to PDF
2. Screenshot
3. Download
4. Save as: `uk_ai_opportunities_government_response.pdf`

---

#### UK-5: AI Playbook
**Page URL**: https://www.gov.uk/government/publications/ai-playbook-for-the-uk-government/artificial-intelligence-playbook-for-the-uk-government-html

**Steps**:
1. Navigate to page
2. Screenshot
3. Save HTML
4. Save as: `uk_ai_playbook_government.html`

---

## PowerShell Organization Script

**After manual downloads, organize files**:

```powershell
# Navigate to repo
cd c:\Users\user\Documents\proj01_chatbot_edu\week11_law\ai-ethics-docs-repo

# Count files by region
Write-Host "Hong Kong:" (Get-ChildItem downloads\hong-kong\* -File).Count "files"
Write-Host "Europe-EU:" (Get-ChildItem downloads\europe-eu\* -File).Count "files"
Write-Host "United States:" (Get-ChildItem downloads\united-states\* -File).Count "files"
Write-Host "United Kingdom:" (Get-ChildItem downloads\united-kingdom\* -File).Count "files"

# Verify file sizes
Get-ChildItem downloads\*\* -File | Select-Object Name, Length, LastWriteTime | Format-Table

# Check for empty files (potential failures)
Get-ChildItem downloads\*\* -File | Where-Object {$_.Length -eq 0}
```

---

## URL Troubleshooting

### If URL Returns 404

**Strategy 1: Use Gov Site Search**
```
Hong Kong: https://www.digitalpolicy.gov.hk/
EU: https://eur-lex.europa.eu/
US: https://www.whitehouse.gov/
UK: https://www.gov.uk/
```

Search for: `[Document title] AI regulation`

**Strategy 2: Internet Archive (Wayback Machine)**
```
https://web.archive.org/
Paste original URL
Find most recent snapshot
Download from archive
```

**Strategy 3: Official Document Repositories**
```
UK: https://assets.publishing.service.gov.uk/
EU: https://eur-lex.europa.eu/
US: https://www.federalregister.gov/
```

---

## Quality Verification Checklist

**For Each Document**:
- [ ] Screenshot shows official government URL
- [ ] Screenshot is clear and readable
- [ ] Document file exists and is not empty
- [ ] PDF opens without errors (if PDF)
- [ ] HTML displays content (if HTML)
- [ ] File name follows naming convention
- [ ] File saved in correct regional folder
- [ ] Metadata file created (optional but recommended)

---

## Batch Verification Script

**PowerShell script to verify all downloads**:

```powershell
$expected = @{
    'hong-kong' = 2
    'europe-eu' = 1
    'united-states' = 5
    'united-kingdom' = 5
}

$total = 0
$missing = @()

foreach ($region in $expected.Keys) {
    $path = "downloads\$region"
    $count = (Get-ChildItem $path -File -ErrorAction SilentlyContinue).Count
    $expected_count = $expected[$region]
    
    Write-Host "$region : $count / $expected_count files"
    
    if ($count -lt $expected_count) {
        $missing += "$region (missing $($expected_count - $count))"
    }
    
    $total += $count
}

Write-Host "`nTotal: $total / 16 documents"

if ($missing.Count -gt 0) {
    Write-Host "`nMissing from:"
    $missing | ForEach-Object { Write-Host "  - $_" }
} else {
    Write-Host "`n✓ All documents collected!"
}
```

---

## Time Estimates

**Per Document**:
- Navigate + Load: 30-60 seconds
- Screenshot: 15-30 seconds
- Download: 15-60 seconds (depending on size)
- Save + Verify: 15-30 seconds
- **Total per document**: 1.5-3 minutes

**Total for 16 documents**: 24-48 minutes

**Add buffer for**:
- URL troubleshooting: +15-30 minutes
- Slow page loads: +10-20 minutes
- Organization: +5-10 minutes

**Realistic Total**: 60-120 minutes (1-2 hours)

---

## Success Criteria

**Before declaring manual collection complete**:
- [ ] 16 documents downloaded
- [ ] 16 screenshots captured
- [ ] All files properly named
- [ ] All files in correct folders
- [ ] Verification script shows 16/16
- [ ] No empty files (0 KB)
- [ ] Spot check: 3+ PDFs open correctly
- [ ] Spot check: 3+ HTML files display correctly

---

## Recovery from Automation Failure

**If automated scripts partially completed**:

1. **Identify what succeeded**:
```powershell
Get-ChildItem downloads\*\* -File | Select-Object Name
Get-ChildItem screenshots\*\* -File | Select-Object Name
```

2. **Create checklist of missing files**:
Compare against DOCUMENT_TRACKING.md

3. **Manually download only missing files**:
Follow document-by-document guide above

4. **Merge with automated results**:
No conflicts - manual files supplement automated ones

---

**Workaround Status**: Fully documented and ready to execute if automation fails. This method guarantees 100% success rate with human verification at each step.
