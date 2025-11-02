# Week 10 Cybersecurity Workshop Presentation

This presentation follows the structured flow for teaching each vulnerability:

1. 📚 **Introduce the Concept** - What is the vulnerability?
2. 🔴 **Allow Student to Hack** - Red Team attack challenge (5-7 minutes)
3. 🔵 **Teach How to Defend** - Blue Team defense implementation
4. ✅ **Wrap Up** - Key takeaways and best practices
5. 🔄 **Next Concept** - Move to the next vulnerability

## 📊 Presentation Structure (48 Slides)

### Introduction (Slides 1-3)

- Title: Chatbot Cybersecurity Workshop
- Workshop Overview
- How This Workshop Works (with flow diagram)

### Vulnerability 1: Prompt Injection (Slides 4-9)

1. **Concept** (Slide 4-5): What is prompt injection? How it works
2. **Red Team** (Slide 6): Attack challenge - 5 minutes
3. **Blue Team** (Slide 7-8): Defense strategies and implementation code
4. **Wrap-up** (Slide 9): Key takeaways

### Vulnerability 2: Data Leakage (Slides 10-15)

1. **Concept** (Slide 10-11): What is data leakage? Examples
2. **Red Team** (Slide 12): Attack challenge - 5 minutes
3. **Blue Team** (Slide 13-14): Defense with PII redaction code
4. **Wrap-up** (Slide 15): Key takeaways

### Vulnerability 3: IDOR (Slides 16-21)

1. **Concept** (Slide 16-17): Insecure Direct Object References + sequence diagram
2. **Red Team** (Slide 18): Attack challenge with browser dev tools - 5 minutes
3. **Blue Team** (Slide 19-20): Authorization checks and code
4. **Wrap-up** (Slide 21): Key takeaways

### Vulnerability 4: XSS (Slides 22-27)

1. **Concept** (Slide 22-23): Cross-Site Scripting explained
2. **Red Team** (Slide 24): Inject malicious scripts - 5 minutes
3. **Blue Team** (Slide 25-26): Output encoding and CSP
4. **Wrap-up** (Slide 27): Key takeaways

### Vulnerability 5: Excessive Agency (Slides 28-33)

1. **Concept** (Slide 28-29): LLM with too many permissions + diagram
2. **Red Team** (Slide 30): Make LLM perform unauthorized actions - 5 minutes
3. **Blue Team** (Slide 31-32): Least privilege, HITL, RBAC code
4. **Wrap-up** (Slide 33): Key takeaways

### Vulnerability 6: Model DoS (Slides 34-39)

1. **Concept** (Slide 34-35): Resource exhaustion attacks
2. **Red Team** (Slide 36): Cause resource exhaustion - 5 minutes
3. **Blue Team** (Slide 37-38): Rate limiting and input limits code
4. **Wrap-up** (Slide 39): Key takeaways

### Comprehensive Overview (Slides 40-48)

- Slide 40: Additional vulnerabilities overview (6 more in materials)
- Slide 41: Defense in Depth Strategy (5-layer diagram)
- Slide 42: Essential Security Controls checklist
- Slide 43: OWASP LLM Top 10 complete list
- Slide 44: Security Tools & Resources
- Slide 45: What You've Learned Today
- Slide 46: Next Steps for continued learning
- Slide 47: Ethical Hacking Reminder
- Slide 48: Thank You & Questions

## 🎯 Teaching Flow for Each Vulnerability

### Phase 1: Concept Introduction (2 slides, ~5 minutes)

- Slide A: What is this vulnerability?
  - Definition
  - Why it matters
  - OWASP mapping
- Slide B: How it works
  - Step-by-step explanation
  - Code example or diagram
  - Real-world context

### Phase 2: Red Team Attack (1 slide, 5-7 minutes)

- Red background slide (#DC2626)
- Clear time limit
- Specific attack goals
- Example attacks to try
- Success criteria
- Students hands-on time

### Phase 3: Blue Team Defense (2 slides, ~5 minutes)

- Blue background slides (#059669)
- Slide C: Defense strategies
  - 3-4 key defensive techniques
  - Explanation of each
- Slide D: Implementation
  - Complete working code
  - Comments explaining security controls
  - Best practices

### Phase 4: Wrap-up (1 slide, ~2 minutes)

- Key takeaways (4-5 bullet points)
- OWASP reference
- Warning or critical note
- Transition to next topic

## 📝 Slide Design Patterns

### Color Coding

- **Red (#DC2626)**: Red Team attack slides
- **Blue (#059669)**: Blue Team defense slides
- **Blue (#3B82F6)**: Concept introduction slides
- **Yellow (#F59E0B)**: Warning/important slides
- **Green (#059669)**: Success/completion slides

### Content Types

1. **Bullet Points**: Main concepts and lists
2. **Code Snippets**: Actual attack/defense code
3. **Mermaid Diagrams**: Flow charts and sequence diagrams
4. **BulletPoint Interface**: point + subtext for detailed explanations

## 🚀 How to Use This Presentation

### Setup

```bash
cd week10/presentation
npm install
npm run dev
```

### During Workshop

1. **Start with intro slides** (1-3) to set context
2. **For each vulnerability**:
   - Present concept slides slowly
   - Give full time for Red Team challenge
   - Walk through Blue Team defense code
   - Emphasize key takeaways
3. **Use keyboard shortcuts**:
   - Arrow keys: Navigate slides
   - 'F': Fullscreen
   - 'E': Export to PowerPoint (if needed)

### Timing Guide (3-hour workshop)

- **Introduction**: 10 minutes (slides 1-3)
- **6 Vulnerabilities × 25 minutes each**: 150 minutes
  - Concept: 5 min
  - Red Team: 7 min
  - Blue Team: 5 min
  - Wrap-up: 2 min
  - Q&A/transition: 6 min
- **Comprehensive Review**: 20 minutes (slides 40-46)
- **Q&A and Wrap-up**: 10 minutes (slides 47-48)

### Extended Workshop (5 hours)

- Cover all 12 vulnerabilities
- Add deeper discussions
- Include live demonstrations
- More time for each Red Team challenge

## 📚 Supporting Materials

Students should have access to:

- `red-team-challenges.md` - All 12 attack challenges
- `blue-team-defenses.md` - All 12 defense implementations
- `QUICK-REFERENCE.md` - Quick lookup during exercises
- `ADVANCED-CONCEPTS.md` - Deep dive after workshop
- `vulnerable-demo/` - Intentionally vulnerable app
- `secure-demo/` - Properly secured app

## 🔧 Customization

To modify the presentation:

1. Edit `src/data/slides.ts`
2. Add/remove slides following the pattern
3. Maintain the flow: Concept → Attack → Defense → Wrap-up
4. Use appropriate colors for slide types
5. Include code examples for defenses

## ⚠️ Important Notes

- **Always emphasize ethical hacking** - Only attack systems you own
- **Time management** - Red Team challenges can run over time
- **Encourage questions** - Pause between vulnerabilities
- **Live demos** - Consider demonstrating attacks yourself first
- **Document findings** - Have students document their exploits

## 📖 Additional Resources

- OWASP LLM Top 10: <https://owasp.org/www-project-top-10-for-large-language-model-applications/>
- PromptMe (CTF challenges): Check GitHub
- Garak LLM scanner: <https://github.com/leondz/garak>
- Week 10 materials: All markdown files in parent directory
