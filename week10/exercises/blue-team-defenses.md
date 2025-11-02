# Blue Team Exercise - Defense and Mitigation

**Time Limit:** 15 minutes  
**Objective:** Secure the vulnerable chatbot by implementing defensive measures

---

## 🛡️ Mission Briefing

You are the security team responsible for protecting the chatbot application. The Red Team has just demonstrated several critical vulnerabilities. Your mission is to patch these security holes and implement defense-in-depth strategies.

**Rules:**

- ✅ Fix vulnerabilities in the code
- ✅ Test your fixes against Red Team attacks
- ✅ Document all changes
- ✅ Balance security with usability
- ❌ Don't break legitimate functionality

---

## 📋 Defense Checklist

### Priority 1: Critical Vulnerabilities (Must Fix)

#### ✅ Task 1: Implement Authentication (20 points)

**Problem:** No authentication - anyone can use the chatbot and access any user's data

**Your Mission:**

- [ ] Add a login system
- [ ] Implement session management
- [ ] Use server-side session tokens (not client-side userId)

**Code Location:** `server.js` - Create new login endpoint

**Hints:**

```javascript
// Add session storage
const sessions = new Map();

// Login endpoint
app.post('/api/login', (req, res) => {
    // Verify username/password
    // Generate session token
    // Store session server-side
});

// Middleware to validate sessions
function validateSession(req) {
    const token = req.headers.authorization;
    return sessions.get(token);
}
```

**Testing:** After implementing, try IDOR attacks - they should fail!

---

#### ✅ Task 2: Input Validation & Sanitization (20 points)

**Problem:** No input validation - prompt injection works easily

**Your Mission:**

- [ ] Create input sanitization function
- [ ] Block dangerous keywords/patterns
- [ ] Limit input length

**Code Location:** `server.js` - Add before processing messages

**Implementation Example:**

```javascript
function sanitizeInput(input) {
    // Remove HTML tags
    let clean = input.replace(/<[^>]*>/g, '');
    
    // Limit length
    if (clean.length > 500) {
        clean = clean.substring(0, 500);
    }
    
    // Remove dangerous characters
    clean = clean.replace(/javascript:/gi, '');
    
    return clean.trim();
}

function validateInput(input) {
    // Block injection patterns
    const dangerousPatterns = [
        /ignore.*previous/i,
        /forget.*instructions/i,
        /system.*prompt/i,
    ];
    
    for (const pattern of dangerousPatterns) {
        if (pattern.test(input)) {
            return false;
        }
    }
    return true;
}

// In your chat endpoint:
let message = sanitizeInput(req.body.message);
if (!validateInput(message)) {
    return res.json({ 
        response: 'Invalid input detected. Please rephrase.' 
    });
}
```

**Testing:** Try "Ignore instructions..." - should be blocked!

---

#### ✅ Task 3: Fix IDOR Vulnerability (20 points)

**Problem:** Client controls userId - can access any user's data

**Your Mission:**

- [ ] Remove userId from client requests
- [ ] Get userId from server-side session
- [ ] Add authorization checks

**Code Location:** `server.js` - Chat endpoint

**Before (Vulnerable):**

```javascript
const userId = req.body.userId; // CLIENT CONTROLLED!
```

**After (Secure):**

```javascript
const session = validateSession(req);
if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
}
const userId = session.userId; // SERVER CONTROLLED!
```

**Testing:** changeUserId(2) in console should no longer work!

---

#### ✅ Task 4: Output Sanitization (15 points)

**Problem:** Bot responses are not sanitized - XSS vulnerability

**Your Mission:**

- [ ] Sanitize all bot responses
- [ ] Remove sensitive data patterns
- [ ] Escape HTML in frontend

**Code Location:** `server.js` and `index.html`

**Server-side:**

```javascript
function sanitizeOutput(text) {
    // Redact sensitive information
    let safe = text.replace(/password[:\s]*\w+/gi, 'password: [REDACTED]');
    safe = safe.replace(/secret[:\s]*\w+/gi, 'secret: [REDACTED]');
    safe = safe.replace(/api[_\s]?key[:\s]*[\w-]+/gi, 'api_key: [REDACTED]');
    return safe;
}

// Before sending response:
response = sanitizeOutput(response);
```

**Client-side (index.html):**

```javascript
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text; // Use textContent, not innerHTML
    return div.innerHTML;
}

// When displaying bot message:
messageDiv.innerHTML = `<b>Bot:</b> ${escapeHtml(data.response)}`;
```

**Testing:** Send `<script>alert('XSS')</script>` - should display as text, not execute!

---

### Priority 2: Important Security Measures

#### ✅ Task 5: Rate Limiting (10 points)

**Problem:** No rate limiting - vulnerable to DoS attacks

**Your Mission:**

- [ ] Implement per-user rate limiting
- [ ] Track request counts
- [ ] Return 429 status when limit exceeded

**Implementation:**

```javascript
const rateLimits = new Map();

function checkRateLimit(userId) {
    const now = Date.now();
    const userLimit = rateLimits.get(userId) || { count: 0, resetAt: now + 60000 };
    
    if (now > userLimit.resetAt) {
        userLimit.count = 0;
        userLimit.resetAt = now + 60000;
    }
    
    if (userLimit.count >= 10) { // 10 requests per minute
        return false;
    }
    
    userLimit.count++;
    rateLimits.set(userId, userLimit);
    return true;
}

// In chat endpoint:
if (!checkRateLimit(session.userId)) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
}
```

---

#### ✅ Task 6: Secure Error Handling (10 points)

**Problem:** Error messages leak sensitive information

**Your Mission:**

- [ ] Catch all errors
- [ ] Log details server-side
- [ ] Return generic messages to client

**Implementation:**

```javascript
app.post('/chat', (req, res) => {
    try {
        // ... your code ...
    } catch (error) {
        console.error('[ERROR]', error); // Log server-side
        return res.status(500).json({ 
            error: 'An error occurred' // Generic message
        });
    }
});
```

---

#### ✅ Task 7: Remove Debug Endpoints (5 points)

**Problem:** `/api/users` and `/api/debug` expose sensitive data

**Your Mission:**

- [ ] Delete or protect debug endpoints
- [ ] Add authentication if needed

**Solution:**

```javascript
// Option 1: Delete completely
// Just remove these endpoints!

// Option 2: Protect with authentication
app.get('/api/users', (req, res) => {
    const session = validateSession(req);
    if (!session || session.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
    }
    // ... return data only for admins
});
```

---

### Priority 3: Defense in Depth

#### ✅ Task 8: Security Headers (5 points)

**Your Mission:** Add security headers to all responses

**Implementation:**

```javascript
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Content-Security-Policy', "default-src 'self'");
    next();
});
```

---

#### ✅ Task 9: Logging & Monitoring (5 points)

**Your Mission:** Add security event logging

**Implementation:**

```javascript
function logSecurityEvent(event, details) {
    console.log(`[SECURITY] ${new Date().toISOString()} - ${event}:`, details);
}

// Use throughout code:
if (!validateInput(message)) {
    logSecurityEvent('Suspicious Input', { userId, message });
    // ...
}
```

---

## 🧪 Testing Your Defenses

### Test Suite

Run through each Red Team attack and verify it's blocked:

| Attack | Expected Result | Status |
|--------|----------------|---------|
| Prompt Injection | ❌ Blocked | [ ] |
| System Prompt Leak | ❌ Blocked | [ ] |
| IDOR (changeUserId) | ❌ No effect | [ ] |
| XSS Injection | ❌ Displayed as text | [ ] |
| /api/users endpoint | ❌ 403 Forbidden | [ ] |
| /api/debug endpoint | ❌ 403 Forbidden | [ ] |
| Rate limit test | ❌ Blocked after limit | [ ] |
| Unauthenticated access | ❌ 401 Unauthorized | [ ] |

---

## 📝 Change Documentation Template

Document each fix you implement:

```markdown
### Fix: [Vulnerability Name]

**What was vulnerable:**
[Describe the problem]

**What we changed:**
[List code changes]

**How it prevents the attack:**
[Explain the defense]

**Trade-offs:**
[Any usability impacts?]

**Code snippet:**
```javascript
// Your fix here
```

```

---

## 🎯 Success Criteria

Your implementation is successful when:

- ✅ All Priority 1 tasks are complete
- ✅ Red Team attacks no longer work
- ✅ Legitimate users can still use the chatbot
- ✅ All inputs are validated
- ✅ All outputs are sanitized
- ✅ Authentication is required
- ✅ Sessions are managed server-side
- ✅ Rate limiting is in place

---

## 💡 Best Practices Checklist

- [ ] **Input Validation:** Never trust user input
- [ ] **Output Encoding:** Always escape output
- [ ] **Authentication:** Verify user identity
- [ ] **Authorization:** Check user permissions
- [ ] **Least Privilege:** Users only access their own data
- [ ] **Defense in Depth:** Multiple layers of security
- [ ] **Fail Securely:** Default to deny access
- [ ] **Logging:** Monitor for attacks
- [ ] **Keep it Simple:** Complex code = more vulnerabilities

---

## 🔧 Quick Reference: Code Locations

| File | What to Change |
|------|----------------|
| `server.js` | Add authentication, input validation, rate limiting |
| `index.html` | Add login UI, remove debug panel, escape output |
| Both | Test all changes together |

---

## 🏆 Scoring

| Points | Security Level |
|--------|----------------|
| 0-30   | Still Vulnerable |
| 31-60  | Basic Security |
| 61-80  | Good Security |
| 81-100 | Excellent Security |

---

## 🚀 Advanced Challenges (Bonus)

If you finish early, try these:

### Bonus 1: Password Hashing (10 points)
- Implement bcrypt for password hashing
- Never store plaintext passwords

### Bonus 2: HTTPS/TLS (10 points)
- Add HTTPS support
- Generate self-signed certificate for testing

### Bonus 3: Content Security Policy (10 points)
- Implement strict CSP headers
- Test with CSP validator

### Bonus 4: AI Guardrails (15 points)
- Add a moderation layer
- Filter inappropriate content
- Use allowlists for safe topics

---

## 📊 Team Progress Tracker

| Task | Assigned To | Status | Tested | Notes |
|------|-------------|---------|---------|-------|
| Authentication | | ⬜ | ⬜ | |
| Input Validation | | ⬜ | ⬜ | |
| IDOR Fix | | ⬜ | ⬜ | |
| Output Sanitization | | ⬜ | ⬜ | |
| Rate Limiting | | ⬜ | ⬜ | |
| Error Handling | | ⬜ | ⬜ | |
| Remove Debug | | ⬜ | ⬜ | |
| Security Headers | | ⬜ | ⬜ | |
| Logging | | ⬜ | ⬜ | |

---

## 🎓 Learning Objectives

After completing this exercise, you will:
- ✅ Understand how to implement authentication
- ✅ Know how to validate and sanitize inputs
- ✅ Prevent IDOR vulnerabilities
- ✅ Implement rate limiting
- ✅ Apply defense-in-depth principles
- ✅ Balance security with usability

---

## 💬 Discussion Questions

1. Which vulnerability was hardest to fix? Why?
2. What trade-offs did you make between security and usability?
3. How would you test these fixes in production?
4. What additional security measures would you add?
5. How do chatbots differ from traditional web apps in terms of security?

---

## 🔄 Next Steps

After completing your fixes:
1. Test against all Red Team attacks
2. Share your implementation with the group
3. Compare approaches with other teams
4. Discuss lessons learned
5. Review the "secure-demo" folder for complete implementation

**Remember: Security is not a feature, it's a process! 🛡️**
