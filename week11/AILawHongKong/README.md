# AI Law Hong Kong - Research Project

## Project Overview
Comprehensive legal research on risks related to personal data collection and generative AI deployment, with focus on Hong Kong jurisdiction.

**Primary Methodology**: Playwright MCP Browser Automation for Google Search
**Critical Requirement**: Complete traceability of all sources with credibility assessment

## 📚 Essential Documentation

**READ THESE FIRST BEFORE STARTING RESEARCH**:

1. **`research_plan.md`** - Master research plan with all 90+ search queries organized by phase
2. **`PLAYWRIGHT_MCP_GUIDE.md`** - Complete step-by-step workflow for conducting traceable research
3. **`SOURCE_CREDIBILITY_GUIDE.md`** - Quick reference for assessing source credibility (Tier 1-5 system)

## 🎯 Research Principles

### Traceability Requirements
Every source MUST have:
- ✅ Complete URL (exact, tested, working)
- ✅ Domain credibility assessment (.gov.hk = highest priority)
- ✅ Credibility tier (1-5 stars) with written justification
- ✅ Publication and access dates
- ✅ Screenshot evidence
- ✅ Source type categorization
- ✅ Verification status (corroborated by other sources)

### Source Credibility Hierarchy
- **Tier 1** ⭐⭐⭐⭐⭐ - Official (.gov.hk AND official .org.hk like pcpd.org.hk, regulatory bodies)
- **Tier 2** ⭐⭐⭐⭐ - Semi-official (universities, international bodies, industry .org.hk)
- **Tier 3** ⭐⭐⭐ - Professional (law firms, legal publishers)
- **Tier 4** ⭐⭐ - News/commentary (reputable outlets)
- **Tier 5** ⭐ - Unverified (requires corroboration)

**Note**: `.org.hk` can be Tier 1 (official regulatory like `pcpd.org.hk`) OR Tier 2-3 (industry associations) - verify!

### Quality Standards
- Minimum 2 sources for every key finding
- Prioritize .gov.hk and official .org.hk (e.g., pcpd.org.hk) Hong Kong sources
- Verify .org.hk sources are official regulatory bodies (not just industry groups)
- Always verify URLs before documenting
- Screenshot everything before analyzing
- Document search process, not just findings

## Folder Structure

### `/research_data/` - Main Research Data Repository
Organized by research phases with source tracking:

#### Phase 1: Personal Data Collection
- `phase1_personal_data/hong_kong_pdpo/` - Hong Kong PDPO research
- `phase1_personal_data/international_frameworks/` - GDPR, CPRA, PIPL, etc.
- `phase1_personal_data/sector_specific/` - Industry-specific regulations

#### Phase 2: AI & Chatbot Risks
- `phase2_ai_chatbot/ai_regulations/` - AI governance frameworks
- `phase2_ai_chatbot/intellectual_property/` - Copyright, training data IP
- `phase2_ai_chatbot/data_privacy_ai/` - AI-specific privacy issues
- `phase2_ai_chatbot/liability_accountability/` - Legal liability frameworks
- `phase2_ai_chatbot/bias_discrimination/` - Fairness and anti-discrimination

#### Phase 3: Operational Compliance
- `phase3_operational/consent_transparency/` - Consent and disclosure requirements
- `phase3_operational/security_breach/` - Data security and breach notification
- `phase3_operational/third_party_vendors/` - Vendor management and DPAs
- `phase3_operational/cross_border_transfers/` - International data transfers

#### Phase 4: Emerging Risks
- `phase4_emerging/deepfakes_synthetic/` - Deepfake and synthetic media
- `phase4_emerging/children_vulnerable/` - Children's data protection
- `phase4_emerging/workplace_employment/` - Employment and HR AI
- `phase4_emerging/content_moderation/` - Platform liability

#### Phase 5: Risk Mitigation
- `phase5_mitigation/governance_frameworks/` - Governance structures
- `phase5_mitigation/technical_safeguards/` - Technical compliance measures
- `phase5_mitigation/contracts_insurance/` - Contractual and insurance solutions

### `/screenshots/` - Visual Documentation
Browser screenshots from research sessions organized by date and topic

### `/case_law/` - Legal Precedents
Case summaries, court decisions, and enforcement actions

### `/reports/` - Research Outputs
Final deliverables, analysis documents, and synthesis reports

### `/progress_logs/` - Research Tracking
Daily logs, search logs, and progress tracking documents

## File Naming Convention

### Research Notes
Format: `YYYY-MM-DD_[topic]_[source-type]_notes.md`
- Example: `2025-11-11_pdpo_official-guidance_notes.md`

### Source Types
- `official` - Government/regulatory body
- `legislation` - Laws and regulations
- `case-law` - Court decisions
- `guidance` - Regulatory guidance documents
- `academic` - Academic papers
- `industry` - Industry reports
- `news` - News articles
- `lawfirm` - Legal analysis from law firms

### Screenshots
Format: `YYYY-MM-DD_[topic]_[source-name]_screenshot.png`
- Example: `2025-11-11_gdpr_eu-commission_screenshot.png`

### Search Logs
Format: `YYYY-MM-DD_search-log.md`

### Progress Logs
Format: `YYYY-MM-DD_progress.md`

## Research Workflow

1. **Execute Search** - Use Playwright MCP to conduct Google searches
2. **Capture Data** - Screenshot + extract text content
3. **Document Source** - Record URL, date, source type in notes file
4. **Log Progress** - Update daily progress log
5. **Cross-Reference** - Link related findings across phases
6. **Synthesize** - Weekly synthesis into reports folder

## Quality Standards

- **Source Verification**: Minimum 2 sources for each finding
- **Currency**: Prioritize 2023-2025 sources
- **Attribution**: Always include URL, date accessed, publication date
- **Completeness**: Check all planned searches completed
- **Updates**: Flag outdated information for re-research

## Status Tracking

See `/progress_logs/research_tracker.md` for current status of all research phases.
