// Slide data types and content
export interface BulletPoint {
  point: string;
  subtext?: string;
}

export interface Slide {
  id: number;
  title: string;
  bullets: (string | BulletPoint)[];
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
      {
        point: "Securing chatbot applications",
        subtext: "Learn how to protect sensitive user data and prevent unauthorized access to your AI-powered chatbot systems."
      },
      {
        point: "FastAPI, LangChain, LangGraph",
        subtext: "Explore authentication patterns across modern Python frameworks used for building production-ready chatbots."
      },
      {
        point: "Best practices for AI systems",
        subtext: "Discover industry-standard security practices specifically designed for AI and machine learning applications."
      }
    ],
    backgroundColor: "#1e3a8a",
    textColor: "#ffffff"
  },

  // Introduction
  {
    id: 2,
    title: "What is Authentication?",
    bullets: [
      {
        point: "Verifying identity - 'Who are you?'",
        subtext: "Authentication is the process of confirming that someone is who they claim to be, like checking a driver's license or passport."
      },
      {
        point: "Like showing ID at hotel check-in",
        subtext: "Just as hotels verify your reservation before giving you a room key, systems verify your credentials before granting access."
      },
      {
        point: "Methods: passwords, tokens, biometrics",
        subtext: "Common authentication methods include traditional passwords, secure tokens (like JWT), and biometric data such as fingerprints or facial recognition."
      }
    ]
  },

  {
    id: 3,
    title: "What is Authorization?",
    bullets: [
      {
        point: "Granting permissions - 'What can you do?'",
        subtext: "Authorization determines what actions an authenticated user is allowed to perform within the system, such as reading, writing, or deleting data."
      },
      {
        point: "Like a keycard opening specific rooms",
        subtext: "After authentication, authorization acts like a hotel keycard that only opens certain doors based on your room assignment and guest status."
      },
      {
        point: "Controls access after authentication",
        subtext: "Even if you prove who you are, authorization ensures you can only access resources and perform actions you're permitted to use."
      }
    ]
  },

  {
    id: 4,
    title: "Why This Matters for Chatbots",
    bullets: [
      {
        point: "Protect sensitive user data",
        subtext: "Chatbots often handle personal information, medical records, or financial data that must be kept secure from unauthorized access and breaches."
      },
      {
        point: "Enable personalized experiences",
        subtext: "Authentication allows chatbots to remember conversation history and user preferences, creating tailored responses for each individual user."
      },
      {
        point: "Comply with privacy regulations",
        subtext: "Proper authentication and authorization help meet legal requirements like GDPR, HIPAA, and other data protection laws."
      }
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
      {
        point: "User provides credentials",
        subtext: "The authentication process begins when a user submits their username and password or other identifying information to the system."
      },
      {
        point: "System validates and creates token",
        subtext: "The server verifies the credentials against stored records and generates a secure token (like JWT) that proves the user's identity."
      },
      {
        point: "Token used for subsequent requests",
        subtext: "Instead of sending credentials repeatedly, the user includes this token with each request, allowing the server to quickly verify identity without database lookups."
      }
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
      {
        point: "Authorization framework (not authentication)",
        subtext: "OAuth 2.0 is designed for granting access permissions rather than verifying identity - it lets apps access your data without sharing passwords."
      },
      {
        point: "Third-party access without passwords",
        subtext: "Allows external applications to access your resources (like Google Photos) without ever seeing or storing your actual password credentials."
      },
      {
        point: "Example: 'Sign in with Google'",
        subtext: "When you click 'Sign in with Google', OAuth 2.0 lets the application access specific information from your Google account with your permission."
      }
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
      {
        point: "Authorization Code - web apps (most secure)",
        subtext: "The recommended flow for web applications with a backend server, providing the highest security by never exposing tokens to the browser."
      },
      {
        point: "Client Credentials - server-to-server",
        subtext: "Used when applications need to authenticate themselves (not users) to access API resources, common in microservices architecture."
      },
      {
        point: "Password Grant - trusted apps (legacy)",
        subtext: "Allows apps to exchange username/password directly for tokens - now deprecated due to security concerns but still used in legacy systems."
      }
    ]
  },

  // SSO
  {
    id: 8,
    title: "Single Sign-On (SSO)",
    bullets: [
      {
        point: "Login once, access multiple apps",
        subtext: "SSO allows users to authenticate once with a central identity provider and gain access to all connected applications without re-entering credentials."
      },
      {
        point: "Example: Google account for Gmail, Drive, Calendar",
        subtext: "When you log into Gmail, you automatically get access to Google Drive, Calendar, and other Google services without logging in again."
      },
      {
        point: "Improves user experience and security",
        subtext: "Users manage fewer passwords (reducing password fatigue), while organizations gain centralized control over authentication and can enforce stronger security policies."
      }
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
      {
        point: "Small data stored in browser",
        subtext: "Cookies are tiny text files (typically under 4KB) that websites store on your computer to remember information between page visits."
      },
      {
        point: "Like a claim ticket at coat check",
        subtext: "Just as a coat check gives you a numbered ticket to retrieve your coat, cookies give your browser an identifier to retrieve your session data from the server."
      },
      {
        point: "Automatically sent with requests",
        subtext: "Your browser automatically includes relevant cookies with each HTTP request to the website, allowing the server to recognize you without manual input."
      }
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
      {
        point: "Sessions: Data stored on server",
        subtext: "Session-based authentication stores user data on the server and gives the browser only a session ID, requiring server lookups for each request."
      },
      {
        point: "Tokens: Self-contained, no server lookup",
        subtext: "Token-based authentication (like JWT) embeds all user information within the token itself, eliminating the need for server-side session storage."
      },
      {
        point: "Tokens scale better for APIs",
        subtext: "Tokens are stateless and can be verified independently by any server, making them ideal for distributed systems, microservices, and mobile applications."
      }
    ]
  },

  // JWT
  {
    id: 11,
    title: "JWT (JSON Web Token)",
    bullets: [
      {
        point: "Industry standard for tokens",
        subtext: "JWT has become the de facto standard for secure information exchange on the web, used by major platforms like Google, Facebook, and AWS."
      },
      {
        point: "Three parts: Header, Payload, Signature",
        subtext: "A JWT consists of a header (algorithm info), payload (claims/data), and signature (verification), all base64-encoded and joined by dots."
      },
      {
        point: "Self-contained user information",
        subtext: "The token payload contains all necessary user data (ID, roles, permissions), allowing servers to make authorization decisions without database queries."
      }
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
      {
        point: "Contains user ID, name, expiration",
        subtext: "A JWT payload includes essential claims like 'sub' (subject/user ID), 'name', and 'exp' (expiration timestamp) to identify users and enforce time limits."
      },
      {
        point: "Cryptographically signed",
        subtext: "The signature is created using a secret key and ensures the token hasn't been tampered with - any modification invalidates the signature."
      },
      {
        point: "Verified without database lookup",
        subtext: "Servers can validate the token's signature and extract user data instantly without querying a database, significantly improving performance."
      }
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
      {
        point: "Built-in security tools",
        subtext: "FastAPI provides ready-to-use security utilities like OAuth2PasswordBearer, APIKeyHeader, and HTTPBasic for implementing authentication with minimal code."
      },
      {
        point: "OAuth2 password flow support",
        subtext: "FastAPI has native support for the OAuth2 password flow, making it easy to implement username/password authentication with JWT tokens."
      },
      {
        point: "Easy JWT integration",
        subtext: "Works seamlessly with popular JWT libraries like python-jose, allowing you to create and verify tokens with just a few lines of code."
      }
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
      {
        point: "Simplest authentication method",
        subtext: "API keys provide a straightforward way to authenticate requests by including a secret key in the request header, ideal for server-to-server communication."
      },
      {
        point: "API key in request header",
        subtext: "The API key is typically sent as a custom HTTP header (like 'X-API-Key') with each request, keeping it separate from the URL for better security."
      },
      {
        point: "Good for service-to-service",
        subtext: "Perfect for backend services, microservices, and automated tools that need to authenticate without user interaction or complex OAuth flows."
      }
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
      {
        point: "Fine-grained access control",
        subtext: "Scopes allow you to define specific permissions (like 'read', 'write', 'delete') that can be granted independently, giving precise control over what each user can do."
      },
      {
        point: "Example: read vs write permissions",
        subtext: "A user might have 'chatbot:read' scope to view messages but not 'chatbot:write' scope to send messages, enabling role-based restrictions within your API."
      },
      {
        point: "Token contains allowed scopes",
        subtext: "The JWT token includes a list of approved scopes in its payload, allowing the server to enforce permissions without additional database queries."
      }
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
      {
        point: "Secure API keys in environment variables",
        subtext: "Store sensitive keys like OPENAI_API_KEY in .env files or environment variables to prevent accidental exposure in version control systems."
      },
      {
        point: "Never hardcode credentials",
        subtext: "Hardcoding API keys directly in code is a major security risk - they can be exposed through GitHub, logs, or error messages, leading to unauthorized access and billing issues."
      },
      {
        point: "User-specific conversation history",
        subtext: "Implement authentication to maintain separate conversation memories for each user, enabling personalized responses and protecting user privacy."
      }
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
      {
        point: "Each user gets own conversation memory",
        subtext: "By storing separate ConversationBufferMemory instances per user ID, the chatbot remembers previous exchanges for each individual user independently."
      },
      {
        point: "Authentication identifies the user",
        subtext: "FastAPI's Depends(get_current_user) middleware extracts and verifies the user from their JWT token, ensuring each request is properly authenticated."
      },
      {
        point: "Responses tailored to user context",
        subtext: "The AI can reference previous conversations, user preferences, and historical context to provide more relevant and personalized answers."
      }
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
      {
        point: "Stateful multi-actor applications",
        subtext: "LangGraph enables complex AI applications with multiple agents and persistent state, requiring robust authentication to manage user sessions and data access."
      },
      {
        point: "Built-in auth handlers",
        subtext: "LangGraph provides decorators like @auth.authenticate and @auth.on to implement authentication and authorization logic without custom middleware."
      },
      {
        point: "Resource-level authorization",
        subtext: "Control access to specific resources (threads, messages, runs) ensuring users can only access their own data or data they're explicitly authorized to view."
      }
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
      {
        point: "@auth.authenticate - verify user identity",
        subtext: "This decorator intercepts every request to validate the authorization token and extract user information before any endpoint logic executes."
      },
      {
        point: "@auth.on - control resource access",
        subtext: "The @auth.on decorator runs before accessing specific resources (like threads or messages) to enforce ownership rules and permission checks."
      },
      {
        point: "Filter by user ownership",
        subtext: "Automatically filter database queries to only return resources owned by the authenticated user, preventing unauthorized data access."
      }
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
      {
        point: "Users only see their own threads",
        subtext: "Authorization filters ensure that regular users can only view and interact with conversation threads they created, maintaining data privacy and isolation."
      },
      {
        point: "Admins can access all resources",
        subtext: "Users with admin permissions bypass ownership filters, allowing them to view all threads for moderation, support, or analytics purposes."
      },
      {
        point: "Automatic metadata filtering",
        subtext: "LangGraph automatically applies authorization filters to database queries based on user metadata, eliminating the need for manual permission checks in every endpoint."
      }
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
      {
        point: "New standard for AI tool connections",
        subtext: "MCP is an emerging protocol that standardizes how AI applications connect to external tools, databases, and services with consistent authentication patterns."
      },
      {
        point: "Secure bridge between chatbot and services",
        subtext: "Acts as a secure intermediary layer that handles authentication, authorization, and communication between your AI chatbot and third-party services."
      },
      {
        point: "OAuth 2.1 and API key support",
        subtext: "Supports modern authentication standards including OAuth 2.1 (the updated OAuth spec) and traditional API keys for backward compatibility."
      }
    ]
  },

  {
    id: 22,
    title: "MCP Architecture",
    bullets: [
      {
        point: "AI Host (chatbot) initiates requests",
        subtext: "Your chatbot application acts as the host, making requests to MCP clients when it needs to interact with external tools or data sources."
      },
      {
        point: "MCP Client handles authentication",
        subtext: "The MCP client manages all authentication logic, token refresh, and credential storage, abstracting complexity from the AI application."
      },
      {
        point: "MCP Server performs actions securely",
        subtext: "The MCP server validates credentials, enforces permissions, and executes requested actions on external systems while maintaining security boundaries."
      }
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
      {
        point: "Always use HTTPS in production",
        subtext: "HTTPS encrypts all data in transit, protecting sensitive information like passwords and tokens from interception by attackers using man-in-the-middle attacks."
      },
      {
        point: "Set short token expiration (15-30 min)",
        subtext: "Short-lived tokens minimize the damage if a token is stolen - attackers have a limited window to use it before it expires and becomes useless."
      },
      {
        point: "Never store passwords in plain text",
        subtext: "Always hash passwords using strong algorithms like bcrypt or argon2 before storing them, so even database breaches don't expose user passwords."
      }
    ]
  },

  {
    id: 24,
    title: "JWT Security Tips",
    bullets: [
      {
        point: "Use strong algorithms (RS256, HS256)",
        subtext: "RS256 (asymmetric) and HS256 (symmetric) are industry-standard algorithms for JWT signatures - avoid weak or deprecated algorithms like 'none'."
      },
      {
        point: "Validate all claims (exp, iss, aud)",
        subtext: "Always verify the token hasn't expired (exp), came from a trusted issuer (iss), and is intended for your application (aud) to prevent token replay and substitution attacks."
      },
      {
        point: "Store tokens securely (httpOnly cookies)",
        subtext: "Use httpOnly cookies to store tokens in the browser - this prevents JavaScript from accessing them, protecting against XSS (cross-site scripting) attacks."
      }
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
      {
        point: "XSS attacks - sanitize user input",
        subtext: "Cross-Site Scripting (XSS) occurs when malicious scripts are injected through user input - always sanitize and escape data before displaying it in web pages."
      },
      {
        point: "CSRF attacks - use SameSite cookies",
        subtext: "Cross-Site Request Forgery tricks users into executing unwanted actions - SameSite cookie attribute prevents browsers from sending cookies with cross-origin requests."
      },
      {
        point: "Token theft - secure storage and transmission",
        subtext: "Store tokens in httpOnly cookies (not localStorage), use HTTPS for transmission, and implement token rotation to minimize the impact of stolen tokens."
      }
    ]
  },

  // LTI Authentication
  {
    id: 26,
    title: "LTI Authentication for LMS",
    bullets: [
      {
        point: "Learning Tools Interoperability standard",
        subtext: "LTI is the industry standard protocol for integrating external educational tools (like chatbots) into Learning Management Systems like Moodle, Canvas, and Blackboard."
      },
      {
        point: "Integrate chatbots with Moodle, Canvas",
        subtext: "LTI enables seamless embedding of your chatbot directly within course pages, automatically passing student identity and course context for personalized learning experiences."
      },
      {
        point: "Secure student data exchange",
        subtext: "LTI 1.3 uses OpenID Connect and JWT tokens to securely transfer student information, roles, and course data while maintaining FERPA and privacy compliance."
      }
    ]
  },

  {
    id: 27,
    title: "LTI 1.3 Flow",
    bullets: [
      {
        point: "OIDC-based authentication",
        subtext: "LTI 1.3 leverages OpenID Connect (OIDC) for authentication, providing a modern, secure alternative to the HMAC-based signatures used in legacy LTI 1.1."
      },
      {
        point: "JWT tokens for user identity",
        subtext: "The LMS sends a cryptographically signed JWT token containing student ID, name, email, roles, and course context to your chatbot upon launch."
      },
      {
        point: "Automatic grade passback support",
        subtext: "LTI supports bidirectional communication, allowing your chatbot to send grades and completion status back to the LMS gradebook automatically."
      }
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
      {
        point: "FastAPI backend with JWT auth",
        subtext: "Combine FastAPI's OAuth2PasswordBearer with JWT tokens to create a secure API that authenticates users and protects chatbot endpoints from unauthorized access."
      },
      {
        point: "LangChain for AI responses",
        subtext: "Use LangChain's ChatOpenAI and ConversationChain to generate intelligent responses while maintaining conversation context and memory for each user."
      },
      {
        point: "User-specific conversation history",
        subtext: "Store separate conversation memories per user ID, ensuring privacy, personalization, and the ability to resume conversations across sessions."
      }
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
    title: "Summary: Authentication Methods",
    bullets: [
      {
        point: "Sessions: Server-side storage, traditional",
        subtext: "Session-based authentication stores user data on the server and works well for traditional server-rendered applications with sticky sessions."
      },
      {
        point: "Tokens (JWT): Self-contained, modern APIs",
        subtext: "JWT tokens carry user information within themselves, making them perfect for stateless REST APIs, microservices, and mobile applications."
      },
      {
        point: "OAuth 2.0: Third-party authorization",
        subtext: "OAuth 2.0 enables secure third-party access delegation, allowing users to grant limited permissions to apps without sharing passwords."
      }
    ]
  },

  // Tokens Deep Dive
  {
    id: 30,
    title: "What Are Tokens?",
    bullets: [
      {
        point: "Self-contained proof of authentication",
        subtext: "Tokens embed all necessary authentication data (user ID, roles, expiration) within themselves, eliminating the need for server-side session storage."
      },
      {
        point: "Like a driver's license with your info",
        subtext: "Just as a driver's license contains your photo, name, and expiration date for verification without calling the DMV, tokens contain verifiable user information."
      },
      {
        point: "No server lookup needed to verify",
        subtext: "Servers can validate tokens by checking their cryptographic signature, enabling fast authentication without database queries for every request."
      }
    ],
    mermaidDiagram: `graph TB
    A[🎫 Token Types] --> B[Opaque Tokens]
    A --> C[JWT Tokens]
    
    B --> B1[Random string<br/>Server must lookup]
    C --> C1[Self-contained<br/>All info inside]
    
    style A fill:#9C27B0,color:#fff
    style B fill:#FF5722,color:#fff
    style C fill:#4CAF50,color:#fff`
  },

  {
    id: 31,
    title: "Opaque vs JWT Tokens",
    bullets: [
      {
        point: "Opaque: Random string, requires database",
        subtext: "Opaque tokens are random identifiers that act as keys to look up user data in a database - the token itself contains no user information."
      },
      {
        point: "JWT: Contains user data, no database",
        subtext: "JWT tokens encode user data in base64 format within the token itself, allowing servers to extract user information without any database lookup."
      },
      {
        point: "JWT scales better for distributed systems",
        subtext: "Since JWTs are stateless and don't require database lookups, they excel in microservices architectures where multiple servers need to verify users independently."
      }
    ],
    codeSnippet: {
      language: "python",
      code: `# Opaque Token
token = "xK7mP9qR2vN8"  # Random string
user = db.lookup_token(token)  # Must query DB

# JWT Token
token = "eyJhbGc..."  # Contains user data
user = jwt.decode(token, verify=True)  # No DB needed!`
    }
  },

  // Sessions
  {
    id: 32,
    title: "Understanding Sessions",
    bullets: [
      {
        point: "Server stores user data, browser gets ID",
        subtext: "The server maintains a session store containing all user information while sending only a lightweight session identifier to the client's browser."
      },
      {
        point: "Like hotel keycard - card has ID, hotel has your info",
        subtext: "Your hotel keycard only contains a room number (session ID), but the hotel's system has all your personal information, reservation details, and preferences."
      },
      {
        point: "Session ID stored in cookie",
        subtext: "Browsers automatically store the session ID in a cookie and include it with every request, allowing the server to identify and retrieve the user's session data."
      }
    ],
    mermaidDiagram: `sequenceDiagram
    participant Browser
    participant Server
    participant DB
    
    Browser->>Server: Login
    Server->>DB: Store session data
    Server->>Browser: Session ID cookie
    Browser->>Server: Request (+ cookie)
    Server->>DB: Lookup session
    DB->>Server: User data
    Server->>Browser: Response`
  },

  {
    id: 33,
    title: "Sessions vs Tokens Comparison",
    bullets: [
      {
        point: "Sessions: Data on server, scalability issues",
        subtext: "Session-based authentication requires a centralized session store that all servers must access, creating a bottleneck and single point of failure in distributed systems."
      },
      {
        point: "Tokens (JWT): Data in token, scales infinitely",
        subtext: "JWT tokens enable horizontal scaling as any server can verify the token independently without shared state or database lookups, perfect for cloud-native architectures."
      },
      {
        point: "Choose based on your architecture needs",
        subtext: "Use sessions for traditional monolithic apps with sticky sessions, and JWTs for modern distributed systems, SPAs, mobile apps, and microservices."
      }
    ],
    mermaidDiagram: `graph LR
    subgraph "Session-Based"
        A[Client] -->|Cookie: sess_123| B[Server]
        B -->|Lookup| C[(Session DB)]
    end
    
    subgraph "Token-Based"
        D[Client] -->|JWT Token| E[Server]
        E -->|Verify| E
    end
    
    style C fill:#FF6B6B,color:#fff
    style E fill:#4CAF50,color:#fff`
  },

  // JWT Deep Dive
  {
    id: 34,
    title: "JWT Standard Claims",
    bullets: [
      {
        point: "iss: Who created the token",
        subtext: "The issuer claim identifies the authentication server that created this token, allowing clients to verify the token came from a trusted source."
      },
      {
        point: "sub: User ID, exp: Expiration time",
        subtext: "The subject identifies the user, while expiration provides built-in security by ensuring tokens become invalid after a specific timestamp."
      },
      {
        point: "aud: Who should accept it",
        subtext: "The audience claim specifies which applications or APIs should accept this token, preventing tokens from being used on unintended services."
      }
    ],
    codeSnippet: {
      language: "json",
      code: `{
  "iss": "https://auth.example.com",
  "sub": "user_12345",
  "aud": "https://api.example.com",
  "exp": 1735689600,
  "iat": 1735686000,
  "name": "Alice",
  "roles": ["user", "premium"]
}`
    }
  },

  {
    id: 35,
    title: "When to Use Each Method",
    bullets: [
      {
        point: "Traditional web app → Sessions + Cookies",
        subtext: "Server-rendered applications with monolithic architectures benefit from sessions as they already maintain server-side state and use sticky load balancing."
      },
      {
        point: "SPA/Mobile/API → JWT Tokens",
        subtext: "Single-page applications, mobile apps, and REST APIs need stateless authentication that works across distributed servers and doesn't rely on cookies."
      },
      {
        point: "Microservices → JWT for stateless auth",
        subtext: "Microservices architectures require each service to independently verify authentication without sharing session state or querying a central database."
      }
    ],
    mermaidDiagram: `graph TD
    A[Choose Auth Method] --> B{App Type?}
    
    B -->|Server-rendered<br/>Traditional| C[Sessions]
    B -->|SPA<br/>React/Vue| D[JWT]
    B -->|Mobile App<br/>iOS/Android| D
    B -->|Microservices<br/>API Gateway| D
    B -->|Enterprise<br/>Multiple Apps| E[SSO + JWT]
    
    style C fill:#4CAF50,color:#fff
    style D fill:#2196F3,color:#fff
    style E fill:#FF9800,color:#fff`
  },

  // Authorization Deep Dive
  {
    id: 36,
    title: "Authorization Models: RBAC vs ABAC",
    bullets: [
      {
        point: "RBAC: Role-based (admin, user, guest)",
        subtext: "Role-Based Access Control assigns users to roles with predefined permissions, making it simple to manage access for common user types like administrators and regular users."
      },
      {
        point: "ABAC: Attribute-based (time, location, age)",
        subtext: "Attribute-Based Access Control evaluates multiple user attributes and context (location, time of day, device type) to make dynamic access decisions."
      },
      {
        point: "Permissions: Granular control per action",
        subtext: "Permission-based systems grant specific capabilities (like 'chatbot:write' or 'data:delete') independent of roles, allowing fine-grained access control."
      }
    ],
    codeSnippet: {
      language: "python",
      code: `# RBAC - Role-Based
if user.role == "admin":
    allow_access()

# ABAC - Attribute-Based
if user.age >= 18 and user.country == "US":
    allow_access()

# Permissions
if "chatbot:write" in user.permissions:
    allow_send_message()`
    }
  },

  {
    id: 37,
    title: "Authorization in Practice",
    bullets: [
      {
        point: "Start simple with roles (admin, user)",
        subtext: "Begin with basic role-based access control to quickly establish access tiers - most applications only need 2-3 roles to start."
      },
      {
        point: "Add permissions for fine control",
        subtext: "Layer on specific permissions as your application grows, allowing nuanced control like separating 'read' from 'write' access within the same role."
      },
      {
        point: "Use ABAC for complex rules",
        subtext: "Implement attribute-based rules when you need context-aware decisions, such as allowing data access only during business hours or from specific locations."
      }
    ],
    codeSnippet: {
      language: "python",
      code: `@app.post("/admin/delete")
async def delete_data(user: User = Depends(get_user)):
    # Check role
    if user.role != "admin":
        raise HTTPException(403, "Admin only")
    
    # Check permission
    if "data:delete" not in user.permissions:
        raise HTTPException(403, "No delete permission")
    
    # Perform action
    delete_all_data()`
    }
  },

  // Security Best Practices
  {
    id: 38,
    title: "Security DO's ✅",
    bullets: [
      {
        point: "Always use HTTPS in production",
        subtext: "HTTPS encrypts all data in transit, preventing attackers from intercepting sensitive information like passwords, tokens, and personal data."
      },
      {
        point: "Hash passwords with bcrypt/argon2",
        subtext: "Never store plain text passwords - use industry-standard hashing algorithms that are designed to be slow and resistant to brute-force attacks."
      },
      {
        point: "Set short token expiration (15-30 min)",
        subtext: "Limiting token lifetime reduces the window of opportunity for attackers if a token is compromised, forcing periodic re-authentication."
      }
    ],
    codeSnippet: {
      language: "python",
      code: `# ✅ DO - Use environment variables
SECRET_KEY = os.getenv("SECRET_KEY")

# ✅ DO - Hash passwords
hashed = pwd_context.hash(password)

# ✅ DO - Short expiration
exp = datetime.now() + timedelta(minutes=30)`
    }
  },

  {
    id: 39,
    title: "Security DON'Ts ❌",
    bullets: [
      {
        point: "Never hardcode secrets in code",
        subtext: "Hardcoded secrets in source code will be exposed in version control, build artifacts, and to anyone with code access - always use environment variables."
      },
      {
        point: "Don't store passwords in plain text",
        subtext: "Storing unhashed passwords means a single database breach exposes all user credentials, allowing attackers to access user accounts across multiple sites."
      },
      {
        point: "Never skip token verification",
        subtext: "Disabling JWT signature verification allows attackers to forge tokens and impersonate any user - always verify tokens with your secret key."
      }
    ],
    codeSnippet: {
      language: "python",
      code: `# ❌ DON'T - Hardcode secrets
SECRET_KEY = "my-secret-123"  # NEVER!

# ❌ DON'T - Plain text passwords
user.password = "password123"  # NEVER!

# ❌ DON'T - Skip verification
payload = jwt.decode(token, verify=False)  # NEVER!`
    }
  },

  {
    id: 40,
    title: "Common Web Vulnerabilities",
    bullets: [
      {
        point: "SQL Injection: Use parameterized queries",
        subtext: "SQL injection occurs when user input is directly concatenated into SQL queries - always use parameterized queries or ORMs to prevent attackers from executing malicious SQL."
      },
      {
        point: "XSS: Sanitize user input always",
        subtext: "Cross-Site Scripting allows attackers to inject malicious scripts into web pages - escape and sanitize all user input before rendering it in HTML."
      },
      {
        point: "CSRF: Use SameSite cookies",
        subtext: "Cross-Site Request Forgery tricks browsers into making unwanted requests - set SameSite=Strict on cookies to prevent cross-origin cookie submission."
      }
    ],
    codeSnippet: {
      language: "python",
      code: `# SQL Injection Prevention
# ❌ BAD
query = f"SELECT * FROM users WHERE id = '{user_id}'"

# ✅ GOOD
query = "SELECT * FROM users WHERE id = %s"
cursor.execute(query, (user_id,))

# CSRF Prevention
response.set_cookie("token", value, samesite="strict")`
    }
  },

  {
    id: 41,
    title: "AI Chatbot Security",
    bullets: [
      {
        point: "Prompt injection: Validate/sanitize input",
        subtext: "Attackers can manipulate AI responses by injecting malicious prompts - validate user messages, use system prompts, and implement content filtering before sending to LLMs."
      },
      {
        point: "Rate limiting: Prevent API abuse",
        subtext: "Without rate limits, attackers can abuse your expensive AI API endpoints or overwhelm your system - implement per-user request throttling and quotas."
      },
      {
        point: "Token theft: Use httpOnly cookies",
        subtext: "JavaScript cannot access httpOnly cookies, protecting authentication tokens from XSS attacks that steal credentials to hijack user sessions."
      }
    ],
    codeSnippet: {
      language: "python",
      code: `# Prompt injection prevention
dangerous = ["ignore previous", "system:", "admin:"]
for pattern in dangerous:
    if pattern in user_input.lower():
        raise ValueError("Invalid input")

# Rate limiting
if request_count > MAX_REQUESTS_PER_MINUTE:
    raise HTTPException(429, "Too many requests")`
    }
  },

  // Conclusion
  {
    id: 42,
    title: "Key Takeaways",
    bullets: [
      {
        point: "Authentication verifies identity",
        subtext: "Authentication answers 'Who are you?' by validating credentials (password, biometric, token) to confirm a user is who they claim to be."
      },
      {
        point: "Authorization controls permissions",
        subtext: "Authorization answers 'What can you do?' by checking if an authenticated user has permission to access specific resources or perform certain actions."
      },
      {
        point: "Use tokens (JWT) for scalable APIs",
        subtext: "JWT tokens enable stateless authentication that scales horizontally without shared session storage, making them ideal for modern distributed systems and microservices."
      }
    ]
  },

  {
    id: 43,
    title: "Next Steps",
    bullets: [
      {
        point: "Implement FastAPI authentication",
        subtext: "Start building your secure API by implementing OAuth2 with password flow in FastAPI, using JWT tokens for stateless authentication across endpoints."
      },
      {
        point: "Secure your LangChain API keys",
        subtext: "Store OpenAI and other API keys in environment variables, use key rotation strategies, and implement rate limiting to protect against abuse."
      },
      {
        point: "Build user-specific chatbot features",
        subtext: "Create personalized experiences by storing per-user conversation history, preferences, and context using the authenticated user's ID."
      }
    ],
    backgroundColor: "#1e3a8a",
    textColor: "#ffffff"
  }
];
