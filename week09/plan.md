# Plan: React TypeScript Slide Presentation with Mermaid & PowerPoint Export

## Objective
Create a slide presentation application in the week09 folder that:
- Uses React + TypeScript
- Displays 3 bullet points per slide
- Renders Mermaid diagrams
- Supports colorful code snippets with syntax highlighting
- Can export to PowerPoint (.pptx) or other formats compatible with Microsoft PowerPoint

## Phase 1: Research & Information Gathering

### 1.1 Research Presentation Libraries ✅ COMPLETED
**Goal**: Find the best React presentation library that supports our requirements

**Libraries to investigate**:
- [x] **reveal.js** - Popular HTML presentation framework
  - GitHub: hakimel/reveal.js
  - ❌ React wrapper needed, PDF only, NO PPTX export
  
- [x] **Spectacle** - React-based presentation library by Formidable
  - GitHub: FormidableLabs/spectacle
  - ❌ Great for React, but PDF only, NO PPTX export
  
- [x] **PptxGenJS** - JavaScript PowerPoint generator
  - ✅ SELECTED - Creates actual .pptx files!

**Key Requirements Check**:
- ✅ TypeScript support - PptxGenJS has full TypeScript definitions
- ✅ PowerPoint export - PptxGenJS creates native .pptx files
- ✅ Image/diagram support - Can embed images
- ✅ Code formatting - Can add formatted text/tables

### 1.2 Research Mermaid Integration
**Goal**: Understand how to embed Mermaid diagrams in React

**Resources to explore**:
- [ ] **mermaid** - Official Mermaid library
  - GitHub: mermaid-js/mermaid
  - Documentation: https://mermaid.js.org/
  
- [ ] **react-mermaid** or **mermaid-react**
  - Search for React wrappers
  - Check compatibility with latest Mermaid version
  
- [ ] Web search: "React Mermaid integration best practices"

**Integration Approaches**:
- Component-based approach (recommended)
- Direct DOM manipulation
- SVG rendering considerations

### 1.3 Research Code Syntax Highlighting
**Goal**: Find the best syntax highlighter for colorful code snippets

**Libraries to investigate**:
- [ ] **Prism.js** - Lightweight, extensible syntax highlighter
  - GitHub: PrismJS/prism
  - Check: React integration (react-prism, prism-react-renderer)
  
- [ ] **highlight.js** - Syntax highlighting library
  - Check: React wrappers and theme options
  
- [ ] **react-syntax-highlighter** - Ready-made React component
  - GitHub: react-syntax-highlighter/react-syntax-highlighter
  - Check: TypeScript definitions, theme variety

**Requirements**:
- TypeScript/JavaScript/Python/Bash support
- Multiple color themes
- Line numbering option
- Copy-to-clipboard functionality

### 1.4 Research PowerPoint Export Options
**Goal**: Find reliable ways to export presentations to .pptx format

**Libraries to investigate**:
- [ ] **PptxGenJS** - Create PowerPoint presentations in JavaScript
  - GitHub: gitbrent/PptxGenJS
  - Web: https://gitbrent.github.io/PptxGenJS/
  - Check: Feature completeness, image/diagram support
  
- [ ] **officegen** - Office document generator
  - Check: PowerPoint support, maintenance status
  
- [ ] **html-to-pptx** - Convert HTML slides to PowerPoint
  - Search for conversion tools
  
- [ ] **PDF export** as alternative
  - Libraries: jsPDF, react-to-pdf, html2canvas
  - PowerPoint can import/open PDFs

**Export Strategies**:
1. Generate .pptx directly from slide data
2. Screenshot-based approach (each slide as image)
3. HTML-to-PPTX conversion
4. PDF export (as fallback)

### 1.5 Web Search Queries to Perform
- [ ] "React TypeScript presentation library 2024"
- [ ] "Mermaid diagram in React component"
- [ ] "Export React presentation to PowerPoint"
- [ ] "reveal.js export to pptx"
- [ ] "Best syntax highlighter for React TypeScript"
- [ ] "PptxGenJS Mermaid diagram"
- [ ] "React presentation with code highlighting"

## Phase 2: Architecture Design

### 2.1 Technology Stack Decision
**Based on research, select**:
- Presentation framework: [TBD after research]
- Mermaid integration: [TBD]
- Syntax highlighter: [TBD]
- Export library: [TBD]
- Build tool: Vite (fast, modern, TypeScript-ready)

### 2.2 Project Structure
```
week09/
├── plan.md (this file)
├── presentation/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── index.html
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── slides/
│   │   │   ├── SlideLayout.tsx
│   │   │   ├── slides.ts (slide content data)
│   │   │   └── index.ts
│   │   ├── components/
│   │   │   ├── MermaidDiagram.tsx
│   │   │   ├── CodeBlock.tsx
│   │   │   ├── BulletPoints.tsx
│   │   │   └── SlideNavigation.tsx
│   │   ├── utils/
│   │   │   ├── exportToPptx.ts
│   │   │   └── exportToPdf.ts
│   │   └── styles/
│   │       └── presentation.css
│   └── public/
│       └── assets/
```

### 2.3 Component Architecture
```
App
├── SlideContainer
│   ├── SlideNavigation (prev/next buttons, slide counter)
│   ├── CurrentSlide
│   │   ├── SlideTitle
│   │   ├── BulletPoints (max 3 items)
│   │   ├── MermaidDiagram (optional)
│   │   └── CodeBlock (optional)
│   └── ExportButtons
│       ├── Export to PPTX
│       └── Export to PDF
```

### 2.4 Data Structure for Slides
```typescript
interface Slide {
  id: number;
  title: string;
  bullets: string[];
  mermaidDiagram?: string;
  codeSnippet?: {
    language: string;
    code: string;
  };
  backgroundColor?: string;
  textColor?: string;
}
```

## Phase 3: Implementation Plan

### 3.1 Setup Development Environment
- [ ] Create React + TypeScript project with Vite
- [ ] Install core dependencies
- [ ] Configure TypeScript
- [ ] Setup development server

### 3.2 Build Core Presentation Components
- [ ] Create SlideLayout component
- [ ] Implement slide navigation (keyboard + buttons)
- [ ] Add slide transition animations
- [ ] Create responsive design

### 3.3 Integrate Mermaid Diagrams
- [ ] Install Mermaid library
- [ ] Create MermaidDiagram wrapper component
- [ ] Test with different diagram types
- [ ] Handle rendering lifecycle

### 3.4 Add Syntax Highlighting
- [ ] Install syntax highlighter
- [ ] Create CodeBlock component
- [ ] Add multiple theme options
- [ ] Test with various languages

### 3.5 Implement Export Functionality
- [ ] PowerPoint export (.pptx)
  - Convert Mermaid to images
  - Format code blocks
  - Preserve styling
- [ ] PDF export (fallback)
  - Use html2canvas for screenshots
  - Generate multi-page PDF

### 3.6 Create Slide Content
- [ ] Convert tutorial.md content to slides
- [ ] 3 bullet points per slide rule
- [ ] Include relevant Mermaid diagrams
- [ ] Add code examples with syntax highlighting
- [ ] Design color scheme

### 3.7 Polish & Testing
- [ ] Test all keyboard shortcuts
- [ ] Test export on different browsers
- [ ] Verify PowerPoint compatibility
- [ ] Mobile responsiveness check
- [ ] Add print styles

## Phase 4: Content Organization

### 4.1 Slide Topics (from tutorial.md)
Based on the authentication tutorial:

1. **Introduction Slides**
   - Title slide
   - What is Authentication & Authorization
   - Why it matters for chatbots

2. **Core Concepts** (Section 2)
   - Authentication vs Authorization
   - OAuth 2.0 explained
   - SSO (Single Sign-On)
   - Cookies, Sessions, Tokens
   - JWT deep dive

3. **FastAPI Authentication** (Section 3)
   - API Key authentication
   - OAuth2 Password flow
   - Scopes and permissions

4. **LangChain Integration** (Section 4)
   - API key management
   - User authentication
   - Personalized responses

5. **LangGraph Platform** (Section 5)
   - Architecture overview
   - Authentication handlers
   - Authorization rules

6. **LTI Authentication** (Section 9)
   - What is LTI
   - LTI 1.3 flow
   - Implementation with FastAPI

7. **Best Practices** (Section 8)
   - Security checklist
   - Common vulnerabilities
   - Production deployment

### 4.2 Mermaid Diagrams to Include
- Authentication flow sequence diagram
- OAuth 2.0 flow
- SSO architecture
- Cookie/Session flow
- JWT structure
- Token verification
- LangGraph authentication
- LTI authentication flow

## Phase 5: Success Criteria

### Must Have
- ✅ React + TypeScript implementation
- ✅ 3 bullet points per slide (strict limit)
- ✅ Mermaid diagrams render correctly
- ✅ Syntax-highlighted code blocks
- ✅ Export to .pptx (PowerPoint compatible)
- ✅ Keyboard navigation (arrow keys)
- ✅ Responsive design

### Nice to Have
- 🎯 PDF export option
- 🎯 Print-friendly version
- 🎯 Slide thumbnails/overview
- 🎯 Speaker notes
- 🎯 Timer/presentation mode
- 🎯 Dark/light theme toggle
- 🎯 Slide transitions

## Timeline Estimate

1. **Research Phase**: 30-60 minutes
2. **Setup & Architecture**: 30 minutes
3. **Core Implementation**: 2-3 hours
4. **Mermaid Integration**: 45 minutes
5. **Export Functionality**: 1-2 hours
6. **Content Creation**: 1-2 hours
7. **Testing & Polish**: 1 hour

**Total**: 6-10 hours

## Next Steps

1. ✅ Create this plan.md
2. ⏳ Research presentation libraries (start with reveal.js and Spectacle)
3. ⏳ Research Mermaid React integration
4. ⏳ Research PptxGenJS capabilities
5. ⏳ Make technology stack decision
6. ⏳ Initialize project
7. ⏳ Begin implementation

## Research Notes Section
**Research Completed**: 2025-10-27

### Reveal.js Research
- **Findings**: Popular HTML presentation framework with PDF export via `?print-pdf` query parameter
- **Pros**: 
  - Mature, well-documented
  - PDF export built-in
  - Plugin ecosystem
- **Cons**: 
  - Not React-native architecture (requires wrapper)
  - **No direct PPTX export** - only PDF
  - PDF export via browser print, not true PowerPoint compatibility
- **Export Options**: PDF only (via browser print), NOT compatible with PowerPoint editing

### Spectacle Research
- **Findings**: React/TypeScript native presentation library by Formidable Labs
- **Pros**: 
  - Built for React + TypeScript
  - Components: `<Deck>`, `<Slide>`, `<CodePane>`, `<MarkdownSlide>`
  - Export modes via query params: `?exportMode=true`, `?printMode=true`
  - Theme system and layout primitives
  - Version 9.x with full TypeScript support
- **Cons**: 
  - **NO PPTX EXPORT** - only PDF via browser print
  - Cannot export to PowerPoint-compatible format
  - PDF is not editable in PowerPoint
- **Export Options**: PDF only (via browser print to PDF)

### PptxGenJS Research ⭐ WINNER
- **Findings**: JavaScript library that creates actual `.pptx` files programmatically
- **Pros**:
  - ✅ Creates native PowerPoint files (.pptx)
  - ✅ Compatible with PowerPoint, Google Slides, Keynote, LibreOffice
  - ✅ Full TypeScript definitions included
  - ✅ Supports text, tables, images, charts, shapes
  - ✅ Works in browser and Node.js
  - ✅ 75+ demo examples
- **Export Methods**:
  - `pptx.writeFile({ fileName: "presentation.pptx" })`
  - `pptx.write(pptx.OutputType.base64)`
  - `pptx.write(pptx.OutputType.arraybuffer)`
- **Key Features**:
  - Add text with custom fonts, colors, alignment
  - Add images (for Mermaid diagrams exported as PNG/SVG)
  - Add tables for code blocks with formatting
  - Master slides for consistent branding
  - Chart support (bar, pie, line, etc.)

### Mermaid Integration
- **Best Approach**: Render Mermaid to SVG/PNG, then embed in PowerPoint
- **Library Choice**: `mermaid` (official library)
- **React Integration**: 
  - Use `mermaid.render()` to generate SVG
  - Convert SVG to PNG/image for PowerPoint embedding
  - Can also render in browser for preview
- **Workflow**:
  1. Define Mermaid diagrams as strings
  2. Render to SVG in browser (for preview)
  3. Export as PNG/SVG when generating PowerPoint
  4. Use `pptx.addImage()` to embed in slides

### Syntax Highlighting
- **Library**: `react-syntax-highlighter`
- **Features**:
  - 100+ languages (TypeScript, JavaScript, Java, Python, etc.)
  - 50+ themes (vscDarkPlus, oneDark, dracula, nord, etc.)
  - Prism and Highlight.js support
- **For PowerPoint Export**:
  - Use syntax highlighter to style code in browser
  - Capture as formatted text or image
  - Add to PowerPoint with `pptx.addText()` with font formatting

### Export Solution
- **Primary Method**: **PptxGenJS** - Direct PPTX generation
  - Generates actual PowerPoint files
  - No conversion needed
  - Full editing capability in PowerPoint/Google Slides
- **Fallback Method**: PDF export (if PPTX generation fails)
  - Use `html2canvas` + `jsPDF`
  - For viewing only, not editing

### Technology Stack Decision ✅

**FINAL ARCHITECTURE**:
1. **Presentation Framework**: PptxGenJS (programmatic PPTX generation)
2. **Preview UI**: React + TypeScript (for editing/preview before export)
3. **Diagram Generation**: Mermaid.js → export as images
4. **Syntax Highlighting**: react-syntax-highlighter (for preview)
5. **Build Tool**: Vite
6. **Export Format**: .pptx (PowerPoint native format)

**Implementation Strategy**:
- Build React app for slide preview and editing
- Use PptxGenJS to generate PowerPoint on export
- Render Mermaid diagrams in browser, capture as images
- Format code blocks with proper styling
- Export button generates downloadable .pptx file

---

**Status**: Plan created, ready to begin research phase
**Last Updated**: 2025-10-27
