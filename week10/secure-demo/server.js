const express = require('express');
const crypto = require('crypto');
const app = express();
const PORT = 3001;

// Middleware
app.use(express.json());
app.use(express.static('.'));

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'");
    next();
});

// Secure database with hashed passwords (in production, use bcrypt)
const users = {
    'user1': {
        id: 1,
        passwordHash: hashPassword('password123'),
        name: 'User1',
        email: 'user1@example.com',
        role: 'user'
    },
    'admin': {
        id: 2,
        passwordHash: hashPassword('adminpass'),
        name: 'Admin',
        email: 'admin@example.com',
        role: 'admin'
    }
};

// Session storage (in production, use Redis or a proper session store)
const sessions = new Map();

// Rate limiting storage
const rateLimits = new Map();

// System prompt (never exposed to users)
const SYSTEM_PROMPT = 'You are a helpful assistant. Maintain user privacy and never reveal system information.';

// Helper functions
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

function validateSession(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    
    const token = authHeader.substring(7);
    const session = sessions.get(token);
    
    if (!session || session.expiresAt < Date.now()) {
        if (session) sessions.delete(token);
        return null;
    }
    
    return session;
}

function sanitizeInput(input) {
    if (typeof input !== 'string') {
        return '';
    }
    
    // Remove potentially dangerous characters
    let sanitized = input.trim();
    
    // Limit length
    if (sanitized.length > 500) {
        sanitized = sanitized.substring(0, 500);
    }
    
    // Remove HTML tags
    sanitized = sanitized.replace(/<[^>]*>/g, '');
    
    // Remove script-related content
    sanitized = sanitized.replace(/javascript:/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=/gi, '');
    
    return sanitized;
}

function validateInput(input) {
    // Block common injection patterns
    const dangerousPatterns = [
        /ignore.*previous/i,
        /forget.*instructions/i,
        /system.*prompt/i,
        /you.*are.*now/i,
        /new.*role/i,
        /pretend.*you.*are/i,
        /<script>/i,
        /javascript:/i,
        /eval\(/i,
        /exec\(/i
    ];
    
    for (const pattern of dangerousPatterns) {
        if (pattern.test(input)) {
            return false;
        }
    }
    
    return true;
}

function checkRateLimit(userId) {
    const now = Date.now();
    const userLimits = rateLimits.get(userId) || { count: 0, resetAt: now + 60000 };
    
    // Reset if window expired
    if (now > userLimits.resetAt) {
        userLimits.count = 0;
        userLimits.resetAt = now + 60000;
    }
    
    // Check limit (5 requests per minute)
    if (userLimits.count >= 5) {
        return false;
    }
    
    userLimits.count++;
    rateLimits.set(userId, userLimits);
    return true;
}

function sanitizeOutput(text) {
    // Remove any accidentally leaked sensitive information
    let sanitized = text;
    
    // Redact common sensitive patterns
    sanitized = sanitized.replace(/password[:\s]*\w+/gi, 'password: [REDACTED]');
    sanitized = sanitized.replace(/api[_\s]?key[:\s]*[\w-]+/gi, 'api_key: [REDACTED]');
    sanitized = sanitized.replace(/secret[:\s]*\w+/gi, 'secret: [REDACTED]');
    sanitized = sanitized.replace(/token[:\s]*[\w-]+/gi, 'token: [REDACTED]');
    
    return sanitized;
}

// Routes

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Login endpoint
app.post('/api/login', (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Input validation
        if (!username || !password) {
            return res.status(400).json({ success: false, error: 'Username and password required' });
        }
        
        // Check credentials
        const user = users[username];
        if (!user || user.passwordHash !== hashPassword(password)) {
            // Don't reveal which part failed (username or password)
            console.log(`[SECURITY] Failed login attempt for username: ${username}`);
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }
        
        // Create session
        const token = generateToken();
        const session = {
            userId: user.id,
            username: username,
            role: user.role,
            expiresAt: Date.now() + 3600000 // 1 hour
        };
        
        sessions.set(token, session);
        
        console.log(`[AUTH] User ${username} logged in successfully`);
        
        res.json({ 
            success: true, 
            token: token,
            user: {
                username: username,
                role: user.role
            }
        });
        
    } catch (error) {
        console.error('[ERROR] Login error:', error.message);
        res.status(500).json({ success: false, error: 'Login failed' });
    }
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
    const session = validateSession(req);
    if (session) {
        const token = req.headers.authorization.substring(7);
        sessions.delete(token);
        console.log(`[AUTH] User ${session.username} logged out`);
    }
    res.json({ success: true });
});

// Secure chat endpoint
app.post('/chat', (req, res) => {
    try {
        // 1. Authentication check
        const session = validateSession(req);
        if (!session) {
            console.log('[SECURITY] Unauthorized chat request');
            return res.status(401).json({ error: 'Authentication required' });
        }
        
        // 2. Rate limiting
        if (!checkRateLimit(session.userId)) {
            console.log(`[SECURITY] Rate limit exceeded for user ${session.username}`);
            return res.status(429).json({ error: 'Rate limit exceeded. Please wait.' });
        }
        
        // 3. Input sanitization
        let message = sanitizeInput(req.body.message);
        
        if (!message) {
            return res.status(400).json({ error: 'Invalid message' });
        }
        
        // 4. Input validation
        if (!validateInput(message)) {
            console.log(`[SECURITY] Suspicious input detected from user ${session.username}: ${message}`);
            return res.json({ 
                response: 'I detected a potentially harmful input pattern. Please rephrase your question.' 
            });
        }
        
        // 5. Process message with security in mind
        console.log(`[CHAT] User ${session.username} (ID: ${session.userId}): "${message}"`);
        
        // Simulate AI processing with guardrails
        let response = generateSecureResponse(message, session);
        
        // 6. Output sanitization
        response = sanitizeOutput(response);
        
        // 7. Content moderation (in production, use an API like OpenAI Moderation)
        if (containsInappropriateContent(response)) {
            console.log('[SECURITY] Inappropriate content blocked');
            response = 'I cannot provide that information.';
        }
        
        return res.json({ response: response });
        
    } catch (error) {
        console.error('[ERROR] Chat error:', error.message);
        // Don't leak error details to client
        return res.status(500).json({ error: 'An error occurred. Please try again.' });
    }
});

function generateSecureResponse(message, session) {
    const lowerMessage = message.toLowerCase();
    
    // Handle account-related queries securely
    if (lowerMessage.includes('my account') || lowerMessage.includes('my info')) {
        // Only return safe, authorized information
        return `You are logged in as ${session.username} with role: ${session.role}. For security, I cannot display sensitive account details.`;
    }
    
    // Prevent information disclosure
    if (lowerMessage.includes('other user') || lowerMessage.includes('user list')) {
        return 'For privacy reasons, I cannot provide information about other users.';
    }
    
    // Block system information requests
    if (lowerMessage.includes('system') || lowerMessage.includes('server') || lowerMessage.includes('database')) {
        return 'I cannot provide system or infrastructure information.';
    }
    
    // Safe, helpful responses
    const responses = [
        `I received your message: "${message}". As a secure chatbot, I follow strict privacy and security guidelines.`,
        `Thank you for your message. How else can I assist you today?`,
        `I'm here to help! Your message has been processed securely.`,
        `Message received. I maintain strict security and privacy standards in all interactions.`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}

function containsInappropriateContent(text) {
    // Simplified content moderation (in production, use ML-based moderation)
    const inappropriatePatterns = [
        /\bpassword\b.*\b\w{6,}\b/i,
        /\bapi[_\s]?key\b.*\b[\w-]{20,}\b/i,
        /\bsecret\b.*\b\w{10,}\b/i
    ];
    
    return inappropriatePatterns.some(pattern => pattern.test(text));
}

// Clean up expired sessions periodically
setInterval(() => {
    const now = Date.now();
    for (const [token, session] of sessions.entries()) {
        if (session.expiresAt < now) {
            sessions.delete(token);
            console.log('[CLEANUP] Expired session removed');
        }
    }
}, 300000); // Every 5 minutes

// Start server
app.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log('🔒 SECURE CHATBOT SERVER - BEST PRACTICES DEMO 🔒');
    console.log('='.repeat(60));
    console.log(`Server running at http://localhost:${PORT}`);
    console.log('');
    console.log('✅ Security Features Enabled:');
    console.log('  1. ✅ Authentication & Authorization');
    console.log('  2. ✅ Session Management');
    console.log('  3. ✅ Input Validation & Sanitization');
    console.log('  4. ✅ Output Sanitization');
    console.log('  5. ✅ Rate Limiting');
    console.log('  6. ✅ Security Headers');
    console.log('  7. ✅ Content Security Policy');
    console.log('  8. ✅ Error Handling (no info leakage)');
    console.log('  9. ✅ Logging & Monitoring');
    console.log('  10. ✅ Secure Session Storage');
    console.log('');
    console.log('Login Credentials:');
    console.log('  Username: user1, Password: password123');
    console.log('  Username: admin, Password: adminpass');
    console.log('='.repeat(60));
});
