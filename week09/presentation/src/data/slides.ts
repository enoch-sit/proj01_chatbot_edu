// Slide data types and content
export interface Slide {
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

export const slides: Slide[] = [
  // Title Slide
  {
    id: 1,
    title: "Authentication & Authorization in AI Chatbots",
    bullets: [
      "Securing chatbot applications",
      "FastAPI, LangChain, LangGraph",
      "Best practices for AI systems"
    ],
    backgroundColor: "#1e3a8a",
    textColor: "#ffffff"
  },

  // Introduction
  {
    id: 2,
    title: "What is Authentication?",
    bullets: [
      "Verifying identity - 'Who are you?'",
      "Like showing ID at hotel check-in",
      "Methods: passwords, tokens, biometrics"
    ]
  },

  {
    id: 3,
    title: "What is Authorization?",
    bullets: [
      "Granting permissions - 'What can you do?'",
      "Like a keycard opening specific rooms",
      "Controls access after authentication"
    ]
  },

  {
    id: 4,
    title: "Why This Matters for Chatbots",
    bullets: [
      "Protect sensitive user data",
      "Enable personalized experiences",
      "Comply with privacy regulations"
    ],
    mermaidDiagram: `graph LR
    A[User] -->|1. Authenticate| B[Chatbot]
    B -->|2. Verify Identity| C[Auth System]
    C -->|3. Grant Access| B
    B -->|4. Personalized Response| A
    
    style A fill:#95E1D3,color:#000
    style B fill:#4ECDC4,color:#fff
    style C fill:#FF6B6B,color:#fff`
  },

  // Authentication Flow
  {
    id: 5,
    title: "The Authentication Flow",
    bullets: [
      "User provides credentials",
      "System validates and creates token",
      "Token used for subsequent requests"
    ],
    mermaidDiagram: `sequenceDiagram
    participant User
    participant App
    participant Auth
    
    User->>App: 1. Login (username/password)
    App->>Auth: 2. Validate credentials
    Auth-->>App: 3. Generate token
    App-->>User: 4. Return token
    User->>App: 5. Request data (with token)
    App->>Auth: 6. Verify token
    Auth-->>App: 7. Token valid ✓
    App-->>User: 8. Return data`
  },

  // OAuth 2.0
  {
    id: 6,
    title: "What is OAuth 2.0?",
    bullets: [
      "Authorization framework (not authentication)",
      "Third-party access without passwords",
      "Example: 'Sign in with Google'"
    ],
    mermaidDiagram: `sequenceDiagram
    participant User
    participant App
    participant Google
    
    User->>App: Want to use app
    App->>Google: Request authorization
    Google->>User: Do you authorize?
    User->>Google: Yes ✓
    Google->>App: Access token
    App->>User: Welcome!`
  },

  {
    id: 7,
    title: "OAuth 2.0 Grant Types",
    bullets: [
      "Authorization Code - web apps (most secure)",
      "Client Credentials - server-to-server",
      "Password Grant - trusted apps (legacy)"
    ]
  },

  // SSO
  {
    id: 8,
    title: "Single Sign-On (SSO)",
    bullets: [
      "Login once, access multiple apps",
      "Example: Google account for Gmail, Drive, Calendar",
      "Improves user experience and security"
    ],
    mermaidDiagram: `graph LR
    A[User Login Once] --> B[Identity Provider]
    B --> C[Email]
    B --> D[Calendar]
    B --> E[Drive]
    B --> F[Chatbot]
    
    style A fill:#FF6B6B,color:#fff
    style B fill:#4ECDC4,color:#fff`
  },

  // Cookies and Sessions
  {
    id: 9,
    title: "Cookies Explained",
    bullets: [
      "Small data stored in browser",
      "Like a claim ticket at coat check",
      "Automatically sent with requests"
    ],
    codeSnippet: {
      language: "http",
      code: `Set-Cookie: session_id=abc123xyz; 
            HttpOnly; 
            Secure; 
            SameSite=Strict`
    }
  },

  {
    id: 10,
    title: "Sessions vs Tokens",
    bullets: [
      "Sessions: Data stored on server",
      "Tokens: Self-contained, no server lookup",
      "Tokens scale better for APIs"
    ]
  },

  // JWT
  {
    id: 11,
    title: "JWT (JSON Web Token)",
    bullets: [
      "Industry standard for tokens",
      "Three parts: Header, Payload, Signature",
      "Self-contained user information"
    ],
    codeSnippet: {
      language: "javascript",
      code: `// JWT Structure
eyJhbGc... (Header)
.eyJzdWI... (Payload - user data)
.SflKxw... (Signature - verification)`
    }
  },

  {
    id: 12,
    title: "JWT Example",
    bullets: [
      "Contains user ID, name, expiration",
      "Cryptographically signed",
      "Verified without database lookup"
    ],
    codeSnippet: {
      language: "python",
      code: `import jwt

# Create token
token = jwt.encode({
  "sub": "user_123",
  "name": "Alice",
  "exp": datetime.now() + timedelta(minutes=30)
}, "secret-key", algorithm="HS256")

# Verify token
decoded = jwt.decode(token, "secret-key", 
                     algorithms=["HS256"])`
    }
  },

  // FastAPI Authentication
  {
    id: 13,
    title: "FastAPI Authentication",
    bullets: [
      "Built-in security tools",
      "OAuth2 password flow support",
      "Easy JWT integration"
    ],
    codeSnippet: {
      language: "python",
      code: `from fastapi import FastAPI, Depends
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@app.get("/users/me")
async def get_user(token: str = Depends(oauth2_scheme)):
    return verify_token(token)`
    }
  },

  {
    id: 14,
    title: "API Key Authentication",
    bullets: [
      "Simplest authentication method",
      "API key in request header",
      "Good for service-to-service"
    ],
    codeSnippet: {
      language: "python",
      code: `from fastapi.security import APIKeyHeader

api_key_header = APIKeyHeader(name="X-API-Key")

@app.get("/chatbot/ask")
async def ask(
    question: str,
    api_key: str = Security(api_key_header)
):
    if api_key not in VALID_KEYS:
        raise HTTPException(401, "Invalid API Key")
    return {"answer": "Hello!"}`
    }
  },

  // OAuth2 with Scopes
  {
    id: 15,
    title: "OAuth2 Scopes (Permissions)",
    bullets: [
      "Fine-grained access control",
      "Example: read vs write permissions",
      "Token contains allowed scopes"
    ],
    codeSnippet: {
      language: "python",
      code: `oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="token",
    scopes={
        "chatbot:read": "Read messages",
        "chatbot:write": "Send messages",
        "admin": "Admin access"
    }
)`
    }
  },

  // LangChain Security
  {
    id: 16,
    title: "LangChain Authentication",
    bullets: [
      "Secure API keys in environment variables",
      "Never hardcode credentials",
      "User-specific conversation history"
    ],
    codeSnippet: {
      language: "python",
      code: `# WRONG - Never do this!
llm = ChatOpenAI(api_key="sk-proj-abc123...")

# CORRECT - Use environment variables
from dotenv import load_dotenv
load_dotenv()

llm = ChatOpenAI()  # Reads from OPENAI_API_KEY`
    }
  },

  {
    id: 17,
    title: "Personalized Chatbot with LangChain",
    bullets: [
      "Each user gets own conversation memory",
      "Authentication identifies the user",
      "Responses tailored to user context"
    ],
    codeSnippet: {
      language: "python",
      code: `user_memories = {}

@app.post("/chat")
async def chat(message: str, user: User = Depends(get_current_user)):
    if user.id not in user_memories:
        user_memories[user.id] = ConversationBufferMemory()
    
    chain = ConversationChain(llm=llm, memory=user_memories[user.id])
    return chain.predict(input=message)`
    }
  },

  // LangGraph Platform
  {
    id: 18,
    title: "LangGraph Platform Authentication",
    bullets: [
      "Stateful multi-actor applications",
      "Built-in auth handlers",
      "Resource-level authorization"
    ],
    mermaidDiagram: `sequenceDiagram
    participant Client
    participant LangGraph
    participant Auth
    
    Client->>LangGraph: Request with token
    LangGraph->>Auth: @auth.authenticate
    Auth-->>LangGraph: User verified
    LangGraph->>Auth: @auth.on (check permissions)
    Auth-->>LangGraph: Authorized ✓
    LangGraph-->>Client: Response`
  },

  {
    id: 19,
    title: "LangGraph Auth Handler",
    bullets: [
      "@auth.authenticate - verify user identity",
      "@auth.on - control resource access",
      "Filter by user ownership"
    ],
    codeSnippet: {
      language: "python",
      code: `from langgraph_sdk import Auth

auth = Auth()

@auth.authenticate
async def authenticate(authorization: str):
    token = parse_bearer_token(authorization)
    if token not in VALID_TOKENS:
        raise HTTPException(401, "Invalid token")
    return {"identity": get_user_id(token)}`
    }
  },

  {
    id: 20,
    title: "LangGraph Authorization",
    bullets: [
      "Users only see their own threads",
      "Admins can access all resources",
      "Automatic metadata filtering"
    ],
    codeSnippet: {
      language: "python",
      code: `@auth.on.threads.read
async def authorize_read(ctx: AuthContext, value: dict):
    if "admin" in ctx.permissions:
        return True  # Admins see all
    else:
        # Users see only their threads
        return {"owner": ctx.user.identity}`
    }
  },

  // MCP Authentication
  {
    id: 21,
    title: "Model Context Protocol (MCP)",
    bullets: [
      "New standard for AI tool connections",
      "Secure bridge between chatbot and services",
      "OAuth 2.1 and API key support"
    ]
  },

  {
    id: 22,
    title: "MCP Architecture",
    bullets: [
      "AI Host (chatbot) initiates requests",
      "MCP Client handles authentication",
      "MCP Server performs actions securely"
    ],
    mermaidDiagram: `graph LR
    A[AI Chatbot] --> B[MCP Client]
    B -->|OAuth/API Key| C[MCP Server]
    C --> D[External Tools]
    
    style A fill:#4ECDC4,color:#fff
    style B fill:#95E1D3,color:#000
    style C fill:#FF6B6B,color:#fff
    style D fill:#F8B4D9,color:#000`
  },

  // Best Practices
  {
    id: 23,
    title: "Security Best Practices",
    bullets: [
      "Always use HTTPS in production",
      "Set short token expiration (15-30 min)",
      "Never store passwords in plain text"
    ]
  },

  {
    id: 24,
    title: "JWT Security Tips",
    bullets: [
      "Use strong algorithms (RS256, HS256)",
      "Validate all claims (exp, iss, aud)",
      "Store tokens securely (httpOnly cookies)"
    ],
    codeSnippet: {
      language: "python",
      code: `# Validate JWT properly
try:
    payload = jwt.decode(
        token, 
        SECRET_KEY, 
        algorithms=["HS256"]
    )
    if payload.get("exp") < time.time():
        raise TokenExpired()
except jwt.InvalidTokenError:
    raise HTTPException(401, "Invalid token")`
    }
  },

  {
    id: 25,
    title: "Common Vulnerabilities",
    bullets: [
      "XSS attacks - sanitize user input",
      "CSRF attacks - use SameSite cookies",
      "Token theft - secure storage and transmission"
    ]
  },

  // LTI Authentication
  {
    id: 26,
    title: "LTI Authentication for LMS",
    bullets: [
      "Learning Tools Interoperability standard",
      "Integrate chatbots with Moodle, Canvas",
      "Secure student data exchange"
    ]
  },

  {
    id: 27,
    title: "LTI 1.3 Flow",
    bullets: [
      "OIDC-based authentication",
      "JWT tokens for user identity",
      "Automatic grade passback support"
    ],
    mermaidDiagram: `sequenceDiagram
    participant LMS
    participant Tool
    
    LMS->>Tool: 1. OIDC Login
    Tool->>LMS: 2. Auth Request
    LMS->>Tool: 3. JWT Token
    Tool->>LMS: 4. Validate Token
    Tool-->>LMS: 5. Launch Tool`
  },

  // Real-World Example
  {
    id: 28,
    title: "Complete Secure Chatbot",
    bullets: [
      "FastAPI backend with JWT auth",
      "LangChain for AI responses",
      "User-specific conversation history"
    ],
    codeSnippet: {
      language: "python",
      code: `@app.post("/chat")
async def chat(
    message: str,
    user: User = Depends(get_current_user)
):
    # Get user's conversation
    conv = get_user_conversation(user.id)
    
    # Generate response
    response = conv.predict(input=message)
    
    return {
        "user": user.username,
        "response": response
    }`
    }
  },

  // Conclusion
  {
    id: 29,
    title: "Key Takeaways",
    bullets: [
      "Authentication verifies identity",
      "Authorization controls permissions",
      "Use tokens (JWT) for scalable APIs"
    ]
  },

  {
    id: 30,
    title: "Next Steps",
    bullets: [
      "Implement FastAPI authentication",
      "Secure your LangChain API keys",
      "Build user-specific chatbot features"
    ],
    backgroundColor: "#1e3a8a",
    textColor: "#ffffff"
  }
];
