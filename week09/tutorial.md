# Authentication and Authorization in LangChain, LangGraph, and FastAPI
## A Comprehensive Tutorial from Basics to Implementation

---

## Table of Contents
1. [Introduction to Authentication & Authorization](#1-introduction)
2. [Core Concepts for Beginners](#2-core-concepts)
   - 2.1 Authentication - "Who Are You?"
   - 2.2 Authorization - "What Can You Do?"
   - 2.3 The Authentication Flow
   - 2.4 Key Terminology
   - 2.5 Deep Dive: Authentication Concepts & History
     - OAuth 2.0 Explained
     - SSO (Single Sign-On)
     - Cookies
     - Sessions
     - Tokens
     - JWT (JSON Web Token)
3. [FastAPI Authentication & Authorization](#3-fastapi-authentication)
4. [LangChain Authentication Basics](#4-langchain-authentication)
5. [LangGraph Platform Authentication](#5-langgraph-authentication)
6. [Building a Secure Chatbot](#6-building-secure-chatbot)
7. [Hands-On Exercises](#7-hands-on-exercises)
8. [Best Practices & Security](#8-best-practices)
9. [LTI Authentication for LMS Integration](#9-lti-authentication)

---

## 1. Introduction to Authentication & Authorization {#1-introduction}

### 1.1 What Are We Learning Today?

Welcome! Today, we're learning about **authentication** and **authorization** - two essential concepts that keep your AI applications secure. Think of authentication as showing your ID to prove who you are, and authorization as the permissions you have once you're inside.

### 1.2 Why This Matters for Chatbots

Modern AI chatbots need to:
- Verify user identities (authentication)
- Control what users can do (authorization)
- Protect sensitive data
- Comply with privacy regulations
- Enable personalized experiences

### 1.3 Real-World Examples

| Scenario | Authentication | Authorization |
|----------|---------------|---------------|
| Banking Chatbot | User logs in with password | Can only view their own account |
| Support Bot | Employee uses company email | Admin can delete tickets, users can't |
| Health Assistant | Biometric or 2FA | Doctor sees all records, patient sees only theirs |

---

## 2. Core Concepts for Beginners {#2-core-concepts}

### 2.1 Authentication (AuthN) - "Who Are You?"

**Definition**: The process of verifying someone's identity.

**Everyday Analogy**: 
Imagine entering a hotel. Authentication is like showing your ID at the front desk to prove you're a registered guest.

**Common Methods**:

1. **Password-Based**
   - What it is: Username + password
   - Pros: Simple, familiar
   - Cons: Can be stolen or guessed
   ```
   User enters: username="alice", password="secret123"
   System checks: Does this match our records?
   ```

2. **Token-Based (JWT)**
   - What it is: A digital "ticket" that proves you logged in
   - Pros: No need to re-enter password
   - Cons: Can expire
   ```
   After login, you get: token="eyJhbGc..."
   Use this token for future requests
   ```

3. **OAuth2**
   - What it is: "Sign in with Google/Facebook"
   - Pros: No need to create new password
   - Cons: Depends on third-party service

4. **Multi-Factor Authentication (MFA)**
   - What it is: Password + code from phone
   - Pros: Much more secure
   - Cons: Extra step for users

### 2.2 Authorization (AuthZ) - "What Can You Do?"

**Definition**: Determining what an authenticated user is allowed to do.

**Everyday Analogy**: 
After showing your hotel ID, you receive a keycard. Authorization is like that keycard - it only opens your room, not others. If you have a premium plan, it might also open the gym.

**Common Approaches**:

1. **Role-Based Access Control (RBAC)**
   ```
   Roles:
   - Guest: Can read public data
   - User: Can read and create their own data
   - Admin: Can do everything
   
   Example:
   Alice is a "User" → She can create posts but not delete others' posts
   Bob is an "Admin" → He can delete any post
   ```

2. **Attribute-Based Access Control (ABAC)**
   ```
   Rules based on attributes:
   - Time: Only allow access during business hours
   - Location: Only from approved countries
   - Age: Only users over 18 can access certain features
   
   Example:
   Allow if user.age >= 18 AND user.country == "US" AND time.hour < 22
   ```

3. **Permission-Based**
   ```
   Permissions:
   - threads:read
   - threads:write
   - messages:delete
   
   Example:
   User has ["threads:read", "threads:write"]
   → Can read and create threads, but NOT delete messages
   ```

### 2.3 The Authentication Flow

```mermaid
sequenceDiagram
    participant User as 👤 User/Client
    participant App as 🌐 Your Application
    participant Auth as 🔐 Auth System
    participant DB as 💾 Database

    rect rgb(200, 220, 255)
        Note over User,App: Login Phase
        User->>App: 1. Request access (username/password)
        App->>Auth: 2. Validate credentials
        Auth->>DB: 3. Check user database
        DB-->>Auth: 4. User found ✓
        Auth-->>App: 5. Generate token
        App-->>User: 6. Return token
    end
    
    rect rgb(220, 255, 220)
        Note over User,DB: Authenticated Request Phase
        User->>App: 7. Request data (with token)
        App->>Auth: 8. Verify token
        Auth-->>App: 9. Token valid ✓
        App->>DB: 10. Check permissions
        DB-->>App: 11. User has access ✓
        App-->>User: 12. Return data
    end
```

### 2.4 Key Terminology

| Term | Simple Explanation | Example |
|------|-------------------|---------|
| **Credentials** | Information used to prove identity | Username + password, or API key |
| **Token** | A digital proof that you're logged in | Like a movie ticket - proves you paid |
| **Session** | How long you stay logged in | "Remember me for 30 days" |
| **Scope** | Specific permissions granted | "Can read files" vs "Can delete files" |
| **Principal** | The entity (user/system) being authenticated | "alice@example.com" or "service-bot-123" |
| **Claims** | Information about the authenticated user | Name, email, roles, permissions |

---

## 2.5 Deep Dive: Authentication Concepts & History

### 2.5.1 What is OAuth 2.0?

**OAuth 2.0** is an **authorization framework** (not authentication!) that allows third-party applications to access user data without exposing passwords.

**The Problem It Solves**:
Imagine you want a photo printing app to access your Google Photos. Before OAuth 2.0, you'd have to give the printing app your Google password - scary! 😱

**How OAuth 2.0 Works**:
Instead of sharing your password, OAuth 2.0 lets Google give the printing app a special **access token** that only works for accessing your photos.

```mermaid
sequenceDiagram
    participant User as 👤 You
    participant App as 📱 Photo Printing App
    participant Google as 🔐 Google (Resource Owner)
    participant Photos as 📸 Google Photos API

    rect rgb(255, 230, 230)
        Note over User,Google: Authorization Phase
        User->>App: 1. "I want to print my Google Photos"
        App->>Google: 2. "This user wants to share their photos with me"
        Google->>User: 3. "Do you authorize Photo App to access your photos?"
        User->>Google: 4. "Yes, I authorize it" ✓
        Google->>App: 5. Here's your access token! 🎟️
    end

    rect rgb(230, 255, 230)
        Note over App,Photos: Access Phase
        App->>Photos: 6. "Get photos" (with access token)
        Photos->>Photos: 7. Validate token
        Photos-->>App: 8. Here are the photos! 📸
        App->>User: 9. "Select photos to print"
    end
```

**OAuth 2.0 History**:
- **2006**: OAuth 1.0 discussions began (Twitter and Magnolia wanted better API access)
- **2010**: OAuth 1.0 became official (RFC 5849)
- **2012**: OAuth 2.0 released (RFC 6749) - simpler but more flexible
- **Today**: Used by Google, Facebook, Microsoft, GitHub, and virtually all major platforms

**OAuth 2.0 Grant Types** (Methods of Getting Tokens):

```mermaid
graph TD
    A[OAuth 2.0 Grant Types] --> B[🔐 Authorization Code]
    A --> C[🔑 Client Credentials]
    A --> D[🔒 Password Grant]
    A --> E[⚡ Implicit Flow]
    A --> F[🔄 Refresh Token]
    
    B --> B1[For web apps with backend<br/>Most secure]
    C --> C1[For server-to-server<br/>No user involved]
    D --> D1[For trusted apps<br/>Legacy, avoid if possible]
    E --> E1[For browser-only apps<br/>Deprecated in OAuth 2.1]
    F --> F1[Get new access token<br/>Without re-authenticating]
    
    style A fill:#4CAF50,color:#fff
    style B fill:#2196F3,color:#fff
    style C fill:#FF9800,color:#fff
    style D fill:#F44336,color:#fff
    style E fill:#9C27B0,color:#fff
    style F fill:#00BCD4,color:#fff
```

**Key Difference**: 
- **OAuth 2.0** = Authorization ("What can this app do?")
- **NOT** authentication ("Who is this user?")
- For authentication, you need **OpenID Connect** (built on top of OAuth 2.0)

---

### 2.5.2 What is SSO (Single Sign-On)?

**SSO** means logging in once and getting access to multiple applications without logging in again.

**Everyday Example**:
Think of your school or work email. Once you log in to your email, you can also access:
- Calendar
- File storage (Google Drive, OneDrive)
- Chat (Google Chat, Teams)
- Learning Management System

You only logged in ONCE, but you're authenticated everywhere! That's SSO.

```mermaid
graph LR
    A[👤 User] -->|1. Login Once| B[🔐 Identity Provider<br/>Google/Microsoft/Okta]
    B -->|2. Authenticated!| C[✅ Trust Established]
    C -->|3. Access| D[📧 Email]
    C -->|3. Access| E[📅 Calendar]
    C -->|3. Access| F[📁 Drive]
    C -->|3. Access| G[💬 Chat]
    C -->|3. Access| H[🎓 LMS]
    
    style A fill:#FF6B6B,color:#fff
    style B fill:#4ECDC4,color:#fff
    style C fill:#95E1D3,color:#000
    style D fill:#F7DC6F,color:#000
    style E fill:#F8B4D9,color:#000
    style F fill:#BB8FCE,color:#fff
    style G fill:#85C1E2,color:#000
    style H fill:#F8C471,color:#000
```

**How SSO Works**:

```mermaid
sequenceDiagram
    participant User as 👤 User
    participant App1 as 📧 Email App
    participant IDP as 🔐 Identity Provider<br/>(SSO Server)
    participant App2 as 📅 Calendar App

    rect rgb(255, 240, 245)
        Note over User,IDP: First Login
        User->>App1: 1. Access Email
        App1->>IDP: 2. Not authenticated, redirect to login
        IDP->>User: 3. Show login page
        User->>IDP: 4. Enter credentials
        IDP->>IDP: 5. Validate & create session
        IDP->>App1: 6. Authenticated! Here's a token
        App1->>User: 7. Show email inbox
    end

    rect rgb(240, 255, 245)
        Note over User,App2: Accessing Another App (No Re-login!)
        User->>App2: 8. Access Calendar
        App2->>IDP: 9. Is user authenticated?
        IDP->>App2: 10. Yes! Same user, here's their info
        App2->>User: 11. Show calendar (no login needed!)
    end
```

**SSO History**:
- **1990s**: Kerberos (MIT) - early SSO for networks
- **2001**: Microsoft Passport (now Microsoft Account)
- **2005**: SAML 2.0 becomes standard for enterprise SSO
- **2014**: OpenID Connect becomes modern SSO standard
- **Today**: Used everywhere - schools, companies, cloud services

**Benefits of SSO**:
- ✅ Users remember only ONE password
- ✅ Better security (fewer passwords to manage)
- ✅ Easier IT management
- ✅ Better user experience

---

### 2.5.3 What are Cookies?

**Cookies** are small pieces of data that websites store in your browser to "remember" you.

**Everyday Analogy**:
A cookie is like a **claim ticket** at a coat check. When you arrive at a restaurant and check your coat, they give you a ticket (cookie). When you want your coat back, you show the ticket, and they know which coat is yours.

```mermaid
graph TB
    A[👤 User Visits Website] -->|1. First Visit| B[🌐 Server]
    B -->|2. Set Cookie| C[🍪 Browser Stores Cookie]
    C -->|3. User Returns| D[🌐 Server]
    C -.->|Cookie Sent Automatically| D
    D -->|4. Reads Cookie| E[💭 Server Remembers:<br/>✓ Login status<br/>✓ Shopping cart<br/>✓ Preferences]
    
    style A fill:#FF6B6B,color:#fff
    style B fill:#4ECDC4,color:#fff
    style C fill:#FFE66D,color:#000
    style D fill:#4ECDC4,color:#fff
    style E fill:#95E1D3,color:#000
```

**What's Inside a Cookie?**

```
Set-Cookie: session_id=abc123xyz; 
            Expires=Wed, 09 Jun 2025 10:18:14 GMT; 
            HttpOnly; 
            Secure; 
            SameSite=Strict
```

| Part | What It Means |
|------|---------------|
| `session_id=abc123xyz` | The actual data (key=value) |
| `Expires=...` | When the cookie should be deleted |
| `HttpOnly` | JavaScript can't access it (security!) |
| `Secure` | Only sent over HTTPS |
| `SameSite=Strict` | Only sent to same website (CSRF protection) |

**Cookie Types**:

```mermaid
graph TD
    A[🍪 Cookies] --> B[Session Cookies]
    A --> C[Persistent Cookies]
    A --> D[First-Party Cookies]
    A --> E[Third-Party Cookies]
    
    B --> B1[Deleted when browser closes<br/>Used for temporary logins]
    C --> C1[Stored for days/months/years<br/>Remember me feature]
    D --> D1[From the website you visit<br/>Generally safe]
    E --> E1[From other domains ads, trackers<br/>Privacy concerns]
    
    style A fill:#FF6B6B,color:#fff
    style B fill:#4ECDC4,color:#fff
    style C fill:#95E1D3,color:#000
    style D fill:#F8B4D9,color:#000
    style E fill:#F44336,color:#fff
```

**Cookie History**:
- **1994**: Lou Montulli (Netscape) invented cookies for e-commerce shopping carts
- **1996**: Cookies became part of HTTP specification
- **2000s**: Privacy concerns emerged (tracking, ads)
- **2018**: GDPR requires cookie consent in Europe
- **2020s**: Browsers start blocking third-party cookies

**Security Concerns**:
- ❌ Can be stolen (XSS attacks)
- ❌ Can be intercepted (if not using HTTPS)
- ❌ Privacy tracking
- ✅ Solution: Use `HttpOnly`, `Secure`, `SameSite` flags

---

### 2.5.4 What are Sessions?

**Sessions** are a way for servers to remember information about a user across multiple requests.

**Key Difference from Cookies**:
- **Cookie**: Data stored in the browser
- **Session**: Data stored on the server, browser only gets a session ID

**Analogy**:
Think of a hotel:
- **Session ID** (in cookie) = Your room key card number
- **Session Data** (on server) = Hotel's database with your name, check-in date, room preferences

```mermaid
sequenceDiagram
    participant Browser as 🌐 Browser
    participant Server as 🖥️ Server
    participant SessionStore as 💾 Session Storage<br/>(Server Memory/Redis)

    rect rgb(255, 240, 245)
        Note over Browser,SessionStore: Login & Session Creation
        Browser->>Server: 1. POST /login (username, password)
        Server->>Server: 2. Validate credentials ✓
        Server->>SessionStore: 3. Create session data<br/>{user_id: 123, name: "Alice", role: "admin"}
        SessionStore-->>Server: 4. Session ID: "sess_abc123"
        Server->>Browser: 5. Set-Cookie: session_id=sess_abc123
    end

    rect rgb(240, 255, 240)
        Note over Browser,SessionStore: Subsequent Requests
        Browser->>Server: 6. GET /profile<br/>(Cookie: session_id=sess_abc123)
        Server->>SessionStore: 7. Get session data for "sess_abc123"
        SessionStore-->>Server: 8. {user_id: 123, name: "Alice", role: "admin"}
        Server->>Browser: 9. "Welcome back, Alice!"
    end

    rect rgb(240, 245, 255)
        Note over Browser,SessionStore: Logout
        Browser->>Server: 10. POST /logout
        Server->>SessionStore: 11. Delete session "sess_abc123"
        Server->>Browser: 12. Clear cookie
    end
```

**Session Storage Options**:

```mermaid
graph LR
    A[📊 Session Storage] --> B[💾 In-Memory]
    A --> C[💿 Database]
    A --> D[⚡ Redis/Memcached]
    A --> E[🍪 Client-Side]
    
    B --> B1[✅ Fast<br/>❌ Lost on restart<br/>❌ Doesn't scale]
    C --> C1[✅ Persistent<br/>❌ Slower<br/>✅ Scales well]
    D --> D1[✅ Fast<br/>✅ Persistent<br/>✅ Scalable<br/>⭐ Best for production]
    E --> E1[✅ No server storage<br/>❌ Security risk<br/>❌ Size limits]
    
    style A fill:#673AB7,color:#fff
    style B fill:#4CAF50,color:#fff
    style C fill:#2196F3,color:#fff
    style D fill:#FF9800,color:#fff
    style E fill:#F44336,color:#fff
```

**Session vs Cookie Comparison**:

| Feature | Cookie | Session |
|---------|--------|---------|
| **Storage Location** | Browser | Server |
| **Storage Capacity** | ~4KB limit | Unlimited (server memory) |
| **Security** | Can be stolen/modified | More secure (only ID in browser) |
| **Speed** | Faster (no server lookup) | Slower (server lookup required) |
| **Expiration** | Set by server | Server decides |
| **Use Case** | Small preferences, theme | User data, shopping cart, auth |

**Session History**:
- **Early Web (1990s)**: Stateless HTTP, no sessions
- **Late 1990s**: Sessions introduced using cookies to track users
- **2000s**: Session fixation attacks discovered
- **2010s**: Redis/Memcached become standard for session storage
- **Modern**: JWT tokens often replace traditional sessions

---

### 2.5.5 What are Tokens?

**Tokens** are digital proof that you're authenticated. Unlike sessions, they're **self-contained** - meaning all the information needed to verify them is inside the token itself.

**Analogy**:
A token is like a **driver's license**:
- It proves who you are
- It has an expiration date
- Police can verify it without calling the DMV
- It contains your information (name, photo, address)

```mermaid
graph TB
    A[🎫 Token Types] --> B[Opaque Tokens]
    A --> C[JWT JSON Web Tokens]
    
    B --> B1[🔐 Random String<br/>Example: xK7mP9qR2vN8<br/>Server must look up in database]
    
    C --> C1[📦 Self-Contained<br/>Has all user info inside<br/>No database lookup needed]
    
    style A fill:#9C27B0,color:#fff
    style B fill:#FF5722,color:#fff
    style B1 fill:#FFCCBC,color:#000
    style C fill:#4CAF50,color:#fff
    style C1 fill:#C8E6C9,color:#000
```

**Token-Based Authentication Flow**:

```mermaid
sequenceDiagram
    participant Client as 📱 Client App
    participant Server as 🔐 Auth Server
    participant API as 🌐 API Server

    rect rgb(255, 235, 238)
        Note over Client,Server: 1. Authentication
        Client->>Server: POST /login<br/>(username, password)
        Server->>Server: Validate credentials ✓
        Server->>Server: Create token with user info
        Server->>Client: Return token 🎟️<br/>(store in localStorage/memory)
    end

    rect rgb(232, 245, 233)
        Note over Client,API: 2. Using the Token
        Client->>API: GET /api/data<br/>Header: Authorization: Bearer {token}
        API->>API: Verify token signature ✓
        API->>API: Extract user info from token
        API->>Client: Return data
    end

    rect rgb(227, 242, 253)
        Note over Client,API: 3. All Subsequent Requests
        Client->>API: Any request with token
        API->>API: Verify token (no database!)
        API->>Client: Response
    end
```

**Advantages of Tokens**:
- ✅ **Stateless**: Server doesn't need to store session data
- ✅ **Scalable**: Works across multiple servers
- ✅ **Mobile-Friendly**: Easy to use in mobile apps
- ✅ **Cross-Domain**: Can be used across different domains
- ✅ **Performance**: No database lookup for every request

**Token History**:
- **2000s**: SAML tokens for enterprise (XML-based, complex)
- **2010**: OAuth 2.0 introduces access tokens
- **2015**: JWT becomes popular for web APIs
- **2018**: PASETO proposed as JWT alternative
- **Today**: JWT is the de facto standard

---

### 2.5.6 What is JWT (JSON Web Token)?

**JWT** is a specific type of token that's become the industry standard. It's a compact, URL-safe way to represent claims between two parties.

**Structure of a JWT**:

```mermaid
graph LR
    A[🎫 Complete JWT Token] --> B[📋 Header]
    A --> C[📦 Payload]
    A --> D[🔏 Signature]
    
    B --> B1[Algorithm: RS256<br/>Type: JWT]
    C --> C1[user_id: 123<br/>name: Alice<br/>role: admin<br/>exp: 1735689600]
    D --> D1[Cryptographic signature<br/>to verify integrity]
    
    style A fill:#FF6B6B,color:#fff
    style B fill:#4ECDC4,color:#fff
    style C fill:#95E1D3,color:#000
    style D fill:#F8B4D9,color:#000
```

**Visual Breakdown**:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsaWNlIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
└─────────────── HEADER ───────────┘ └─────────────────────── PAYLOAD ────────────────────────────────────┘ └────────────── SIGNATURE ────────────────┘
```

**What's in Each Part?**

**1. Header** (Base64 encoded):
```json
{
  "alg": "HS256",  // Algorithm used
  "typ": "JWT"     // Type of token
}
```

**2. Payload** (Base64 encoded):
```json
{
  "sub": "1234567890",      // Subject (user ID)
  "name": "Alice",          // Custom claim
  "role": "admin",          // Custom claim
  "iat": 1516239022,        // Issued at (timestamp)
  "exp": 1735689600         // Expiration (timestamp)
}
```

**3. Signature** (Encrypted):
```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret_key
)
```

**How JWT Verification Works**:

```mermaid
sequenceDiagram
    participant Client as 📱 Client
    participant API as 🌐 API Server
    participant Verify as 🔍 JWT Verifier

    Client->>API: Request + JWT Token
    API->>Verify: 1. Decode header & payload
    
    rect rgb(255, 243, 224)
        Note over Verify: 2. Verification Steps
        Verify->>Verify: ✓ Check signature is valid
        Verify->>Verify: ✓ Check token hasn't expired
        Verify->>Verify: ✓ Check issuer is trusted
        Verify->>Verify: ✓ Check audience matches
    end
    
    alt Token is Valid
        rect rgb(232, 245, 233)
            Verify-->>API: ✅ Token Valid + User Data
            API->>Client: 200 OK + Response
        end
    else Token is Invalid
        rect rgb(255, 235, 238)
            Verify-->>API: ❌ Token Invalid
            API->>Client: 401 Unauthorized
        end
    end
```

**JWT Standard Claims** (Reserved Names):

| Claim | Name | Purpose | Example |
|-------|------|---------|---------|
| `iss` | Issuer | Who created the token | "https://auth.example.com" |
| `sub` | Subject | Who the token is about | "user123" |
| `aud` | Audience | Who should accept the token | "https://api.example.com" |
| `exp` | Expiration | When token expires | 1735689600 (Unix timestamp) |
| `nbf` | Not Before | Token not valid before this time | 1735603200 |
| `iat` | Issued At | When token was created | 1735603200 |
| `jti` | JWT ID | Unique identifier for token | "abc-123-xyz" |

**JWT vs Session Comparison**:

```mermaid
graph TB
    subgraph "🍪 Traditional Session"
        A1[Client] -->|1. Login| B1[Server]
        B1 -->|2. Create session in DB| C1[(Session DB)]
        B1 -->|3. Return session ID| A1
        A1 -->|4. Request + Session ID| B1
        B1 -->|5. Lookup session| C1
        C1 -->|6. Return user data| B1
        B1 -->|7. Response| A1
    end
    
    subgraph "🎫 JWT Token"
        A2[Client] -->|1. Login| B2[Server]
        B2 -->|2. Create JWT no DB!| B2
        B2 -->|3. Return JWT| A2
        A2 -->|4. Request + JWT| B2
        B2 -->|5. Verify signature no DB!| B2
        B2 -->|6. Response| A2
    end
    
    style C1 fill:#FF6B6B,color:#fff
    style B2 fill:#4CAF50,color:#fff
```

**JWT Security Best Practices**:

```mermaid
graph TD
    A[🔐 JWT Security] --> B[✅ DO]
    A --> C[❌ DON'T]
    
    B --> B1[Use HTTPS always]
    B --> B2[Set short expiration 15-30 min]
    B --> B3[Use strong algorithms RS256, HS256]
    B --> B4[Validate all claims]
    B --> B5[Store securely httpOnly cookies or memory]
    
    C --> C1[Store sensitive data in payload]
    C --> C2[Use algorithm: none]
    C --> C3[Skip signature verification]
    C --> C4[Store in localStorage XSS risk]
    C --> C5[Use long expiration days/weeks]
    
    style A fill:#9C27B0,color:#fff
    style B fill:#4CAF50,color:#fff
    style C fill:#F44336,color:#fff
    style B1 fill:#C8E6C9,color:#000
    style B2 fill:#C8E6C9,color:#000
    style B3 fill:#C8E6C9,color:#000
    style B4 fill:#C8E6C9,color:#000
    style B5 fill:#C8E6C9,color:#000
    style C1 fill:#FFCDD2,color:#000
    style C2 fill:#FFCDD2,color:#000
    style C3 fill:#FFCDD2,color:#000
    style C4 fill:#FFCDD2,color:#000
    style C5 fill:#FFCDD2,color:#000
```

**JWT Timeline & Evolution**:

```mermaid
timeline
    title Evolution of JWT and Web Authentication
    2001 : XML-based SAML tokens
         : Complex, enterprise-focused
    2010 : OAuth 2.0 released
         : Access tokens introduced
    2012 : JWT draft specification (RFC 7519)
         : Simple JSON-based tokens
    2015 : JWT becomes IETF standard
         : Rapid adoption in web APIs
    2018 : Security vulnerabilities discovered
         : Algorithm confusion attacks
         : Better practices established
    2019 : PASETO alternative proposed
         : Addresses JWT security issues
    2020 : JWT still dominates
         : Used by Auth0, Firebase, AWS
    2025 : JWT everywhere
         : Mobile apps, SPAs, microservices
         : Best practices well-established
```

**Real-World JWT Example**:

```python
# Creating a JWT
import jwt
from datetime import datetime, timedelta

# User logs in successfully
user_data = {
    "sub": "user_12345",           # Subject (user ID)
    "name": "Alice Johnson",        # Name
    "email": "alice@example.com",   # Email
    "role": "student",              # Role
    "iat": datetime.utcnow(),       # Issued at
    "exp": datetime.utcnow() + timedelta(minutes=30)  # Expires in 30 min
}

# Create JWT token
token = jwt.encode(user_data, "your-secret-key", algorithm="HS256")
# Result: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWI...

# Later: Verify JWT token
try:
    decoded = jwt.decode(token, "your-secret-key", algorithms=["HS256"])
    print(f"Welcome back, {decoded['name']}!")  # Welcome back, Alice Johnson!
except jwt.ExpiredSignatureError:
    print("Token expired, please login again")
except jwt.InvalidTokenError:
    print("Invalid token!")
```

**When to Use Each Authentication Method**:

```mermaid
graph TD
    A[Choose Authentication Method] --> B{What are you building?}
    
    B -->|Traditional Web App<br/>with Server| C[🍪 Sessions + Cookies]
    B -->|Modern SPA<br/>Single Page App| D[🎫 JWT Tokens]
    B -->|Mobile App<br/>iOS/Android| E[🎫 JWT Tokens]
    B -->|Microservices<br/>API Gateway| F[🎫 JWT Tokens]
    B -->|Enterprise SSO<br/>Multiple Apps| G[🔐 SAML or OpenID Connect]
    B -->|Third-party Integration<br/>Allow app access| H[🔑 OAuth 2.0]
    
    C --> C1[✅ Simple setup<br/>✅ Secure by default<br/>❌ Hard to scale]
    D --> D1[✅ Stateless<br/>✅ Cross-domain<br/>⚠️ XSS vulnerable]
    E --> E1[✅ Easy to implement<br/>✅ Works offline<br/>✅ Standard practice]
    F --> F1[✅ No shared session storage<br/>✅ Easy to validate<br/>✅ Scales infinitely]
    G --> G1[✅ Enterprise standard<br/>✅ Very secure<br/>❌ Complex setup]
    H --> H1[✅ No password sharing<br/>✅ Granular permissions<br/>✅ Industry standard]
    
    style A fill:#9C27B0,color:#fff
    style C fill:#4CAF50,color:#fff
    style D fill:#2196F3,color:#fff
    style E fill:#FF9800,color:#fff
    style F fill:#00BCD4,color:#fff
    style G fill:#795548,color:#fff
    style H fill:#E91E63,color:#fff
```

---

## 3. FastAPI Authentication & Authorization {#3-fastapi-authentication}

### 3.1 Why FastAPI for Chatbots?

FastAPI is perfect for building chatbot backends because:
- ✅ Fast and asynchronous (handles many users at once)
- ✅ Built-in security tools
- ✅ Automatic API documentation
- ✅ Type checking prevents bugs
- ✅ Easy to integrate with AI frameworks

### 3.2 Setting Up Your First Secure Endpoint

#### Step 1: Install Dependencies

```bash
pip install fastapi uvicorn python-jose[cryptography] passlib[argon2] python-multipart
```

**What each package does**:
- `fastapi`: Web framework
- `uvicorn`: Server to run FastAPI
- `python-jose`: For creating and validating JWT tokens
- `passlib`: For hashing passwords securely
- `python-multipart`: For handling form data

#### Step 2: Basic API Key Authentication

This is the simplest form of authentication - like a secret password for your API.

```python
# main.py
from fastapi import FastAPI, HTTPException, Security
from fastapi.security import APIKeyHeader

app = FastAPI()

# Define where to look for the API key
api_key_header = APIKeyHeader(name="X-API-Key")

# Our "database" of valid API keys
VALID_API_KEYS = {
    "user1-key-abc123": {"user_id": "user1", "name": "Alice"},
    "user2-key-xyz789": {"user_id": "user2", "name": "Bob"}
}

# Authentication function
async def verify_api_key(api_key: str = Security(api_key_header)):
    """
    This function runs before your endpoint to check if the API key is valid.
    If invalid, it raises an error. If valid, it returns user info.
    """
    if api_key not in VALID_API_KEYS:
        raise HTTPException(
            status_code=401,  # 401 = Unauthorized
            detail="Invalid API Key"
        )
    return VALID_API_KEYS[api_key]

# Protected endpoint
@app.get("/chatbot/ask")
async def ask_chatbot(
    question: str,
    user_info: dict = Security(verify_api_key)
):
    """
    This endpoint requires a valid API key.
    The user_info parameter automatically gets the user's information.
    """
    return {
        "user": user_info["name"],
        "question": question,
        "answer": f"Hello {user_info['name']}, you asked: {question}"
    }

# Public endpoint (no authentication required)
@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

**How to use it**:
```bash
# Run the server
uvicorn main:app --reload

# Test WITHOUT API key (will fail)
curl http://localhost:8000/chatbot/ask?question=Hello

# Test WITH valid API key (will work)
curl -H "X-API-Key: user1-key-abc123" \
     http://localhost:8000/chatbot/ask?question=Hello

# Test public endpoint (no key needed)
curl http://localhost:8000/health
```

### 3.3 OAuth2 with Password Flow (Username + Password)

This is more sophisticated - users log in with username/password and receive a token.

```python
# auth.py
from datetime import datetime, timedelta, timezone
from typing import Annotated
import jwt
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext
from pydantic import BaseModel

# Configuration
SECRET_KEY = "your-secret-key-change-this-in-production"  # ⚠️ Use environment variable in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# OAuth2 scheme - tells FastAPI where to find the token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Models
class User(BaseModel):
    username: str
    email: str | None = None
    full_name: str | None = None
    disabled: bool | None = False

class UserInDB(User):
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# "Database" - In production, use a real database
fake_users_db = {
    "alice": {
        "username": "alice",
        "full_name": "Alice Wonderland",
        "email": "alice@example.com",
        # Password is "secret123" - hashed
        "hashed_password": "$argon2id$v=19$m=65536,t=3,p=4$...",
        "disabled": False,
    }
}

# Helper functions
def verify_password(plain_password: str, hashed_password: str):
    """Check if password matches the hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str):
    """Hash a password for storing"""
    return pwd_context.hash(password)

def get_user(db, username: str):
    """Get user from database"""
    if username in db:
        user_dict = db[username]
        return UserInDB(**user_dict)

def authenticate_user(db, username: str, password: str):
    """Verify username and password"""
    user = get_user(db, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    """Create a JWT token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    """Get current user from token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Decode the JWT token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except jwt.InvalidTokenError:
        raise credentials_exception
    
    user = get_user(fake_users_db, username=username)
    if user is None:
        raise credentials_exception
    return user

# Create app
app = FastAPI()

@app.post("/token", response_model=Token)
async def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    """
    Login endpoint - exchanges username/password for a token
    """
    user = authenticate_user(fake_users_db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer")

@app.get("/users/me", response_model=User)
async def read_users_me(current_user: Annotated[User, Depends(get_current_user)]):
    """
    Get current user's information
    """
    return current_user

@app.get("/chatbot/message")
async def send_message(
    message: str,
    current_user: Annotated[User, Depends(get_current_user)]
):
    """
    Send a message to the chatbot (requires authentication)
    """
    return {
        "user": current_user.username,
        "message": message,
        "response": f"Hello {current_user.full_name}, I received your message: {message}"
    }
```

**How to use it**:

```bash
# 1. Get a token by logging in
curl -X POST "http://localhost:8000/token" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "username=alice&password=secret123"

# Response: {"access_token":"eyJhbGc...", "token_type":"bearer"}

# 2. Use the token to access protected endpoints
curl -H "Authorization: Bearer eyJhbGc..." \
     http://localhost:8000/users/me

# 3. Send chatbot message with authentication
curl -H "Authorization: Bearer eyJhbGc..." \
     "http://localhost:8000/chatbot/message?message=Hello"
```

### 3.4 OAuth2 with Scopes (Permissions)

Scopes let you define fine-grained permissions.

```python
# auth_scopes.py
from fastapi import Security
from fastapi.security import OAuth2PasswordBearer, SecurityScopes

# Define available scopes (permissions)
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="token",
    scopes={
        "chatbot:read": "Read chatbot messages",
        "chatbot:write": "Send messages to chatbot",
        "admin": "Admin access"
    }
)

async def get_current_user(
    security_scopes: SecurityScopes,
    token: Annotated[str, Depends(oauth2_scheme)]
):
    """
    Verify the token has required scopes
    """
    # If specific scopes are required
    if security_scopes.scopes:
        authenticate_value = f'Bearer scope="{security_scopes.scope_str}"'
    else:
        authenticate_value = "Bearer"
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": authenticate_value},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        # Get scopes from token
        token_scopes = payload.get("scopes", [])
        
        # Check if user has required scopes
        for scope in security_scopes.scopes:
            if scope not in token_scopes:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not enough permissions",
                    headers={"WWW-Authenticate": authenticate_value},
                )
    except jwt.InvalidTokenError:
        raise credentials_exception
    
    user = get_user(fake_users_db, username=username)
    if user is None:
        raise credentials_exception
    return user

# Use scopes in endpoints
@app.get("/chatbot/read")
async def read_messages(
    current_user: Annotated[User, Security(get_current_user, scopes=["chatbot:read"])]
):
    """Only users with 'chatbot:read' scope can access this"""
    return {"messages": ["Message 1", "Message 2"]}

@app.post("/chatbot/send")
async def send_message(
    message: str,
    current_user: Annotated[User, Security(get_current_user, scopes=["chatbot:write"])]
):
    """Only users with 'chatbot:write' scope can send messages"""
    return {"status": "Message sent", "message": message}

@app.delete("/admin/delete")
async def delete_data(
    current_user: Annotated[User, Security(get_current_user, scopes=["admin"])]
):
    """Only admins can delete data"""
    return {"status": "Data deleted"}
```

---

## 4. LangChain Authentication Basics {#4-langchain-authentication}

### 4.1 Understanding LangChain Security

LangChain is a framework for building LLM applications. Authentication in LangChain typically involves:
- **API Key Management**: Securing keys for OpenAI, Anthropic, etc.
- **Environment Variables**: Safe storage of credentials
- **Custom Authentication**: For your application's users

### 4.2 Securing API Keys

**❌ WRONG** - Never hardcode API keys:
```python
# DON'T DO THIS!
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(api_key="sk-proj-abc123...")  # ❌ Exposed in code
```

**✅ CORRECT** - Use environment variables:

```python
# .env file
OPENAI_API_KEY=sk-proj-abc123...
ANTHROPIC_API_KEY=sk-ant-abc123...

# app.py
import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

# Load environment variables
load_dotenv()

# LangChain automatically reads from environment
llm = ChatOpenAI()  # ✅ Reads OPENAI_API_KEY from environment

# Or explicitly
llm = ChatOpenAI(api_key=os.getenv("OPENAI_API_KEY"))  # ✅ Good
```

### 4.3 User Authentication with LangChain

Here's how to build a chatbot that authenticates users:

```python
# langchain_auth_chatbot.py
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate
from fastapi import FastAPI, Depends
from typing import Annotated

app = FastAPI()

# Initialize LLM
llm = ChatOpenAI(model="gpt-4", temperature=0.7)

# Create prompt template
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant for {user_name}. Answer their questions politely."),
    ("human", "{input}")
])

# Combine into a chain
chain = prompt | llm

@app.post("/chat")
async def chat(
    message: str,
    current_user: Annotated[User, Depends(get_current_user)]  # From FastAPI auth
):
    """
    Authenticated chat endpoint
    """
    # Invoke the chain with user context
    response = chain.invoke({
        "user_name": current_user.full_name,
        "input": message
    })
    
    return {
        "user": current_user.username,
        "message": message,
        "response": response.content,
        "model": "gpt-4"
    }
```

### 4.4 Personalizing Responses Based on User

```python
# User-specific chatbot memory
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain

# Dictionary to store each user's conversation history
user_memories = {}

@app.post("/chat/personalized")
async def personalized_chat(
    message: str,
    current_user: Annotated[User, Depends(get_current_user)]
):
    """
    Each user gets their own conversation history
    """
    user_id = current_user.username
    
    # Get or create memory for this user
    if user_id not in user_memories:
        user_memories[user_id] = ConversationBufferMemory()
    
    # Create conversation chain with user's memory
    conversation = ConversationChain(
        llm=llm,
        memory=user_memories[user_id],
        verbose=True
    )
    
    response = conversation.predict(input=message)
    
    return {
        "user": user_id,
        "message": message,
        "response": response
    }
```

---

## 5. LangGraph Platform Authentication {#5-langgraph-authentication}

### 5.1 What is LangGraph?

LangGraph extends LangChain to create stateful, multi-actor applications. It's perfect for complex chatbots that need:
- Multiple conversation steps
- State management
- Authentication and authorization
- Resource access control

### 5.2 LangGraph Authentication Architecture

```mermaid
sequenceDiagram
    participant Client as Client App
    participant AuthProvider as Auth Provider
    participant LangGraph as LangGraph Backend
    participant LLM as AI Model

    Client->>AuthProvider: 1. Login (username/password)
    AuthProvider-->>Client: 2. Return token
    Client->>LangGraph: 3. Request with token
    Note over LangGraph: 4. Validate token (@auth.authenticate)
    LangGraph->>AuthProvider: 5. Verify user
    AuthProvider-->>LangGraph: 6. User confirmed
    Note over LangGraph: 7. Apply permissions (@auth.on)
    LangGraph->>LLM: 8. Call AI with user context
    LLM-->>LangGraph: 9. AI response
    LangGraph-->>Client: 10. Return response
```

### 5.3 Setting Up LangGraph Authentication

#### Step 1: Create Authentication Handler

```python
# src/security/auth.py
from langgraph_sdk import Auth

# Simple token database (use a real database in production)
VALID_TOKENS = {
    "user1-token": {"id": "user1", "name": "Alice", "role": "user"},
    "user2-token": {"id": "user2", "name": "Bob", "role": "admin"}
}

# Create Auth instance
auth = Auth()

@auth.authenticate
async def authenticate(authorization: str | None) -> Auth.types.MinimalUserDict:
    """
    This function runs on EVERY request to verify the user.
    
    Args:
        authorization: The Authorization header (e.g., "Bearer user1-token")
    
    Returns:
        User information dict with at least an 'identity' field
    
    Raises:
        HTTPException: If authentication fails
    """
    # Check if authorization header exists
    if not authorization:
        raise Auth.exceptions.HTTPException(
            status_code=401,
            detail="Missing authorization header"
        )
    
    # Parse "Bearer <token>" format
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise ValueError("Invalid scheme")
    except ValueError:
        raise Auth.exceptions.HTTPException(
            status_code=401,
            detail="Invalid authorization format. Use: Bearer <token>"
        )
    
    # Verify token
    if token not in VALID_TOKENS:
        raise Auth.exceptions.HTTPException(
            status_code=401,
            detail="Invalid token"
        )
    
    # Return user information
    user_data = VALID_TOKENS[token]
    return {
        "identity": user_data["id"],  # Required field
        "display_name": user_data["name"],
        "is_authenticated": True,
        "permissions": ["chatbot:read", "chatbot:write"] if user_data["role"] == "user" else ["admin"]
    }
```

#### Step 2: Add Authorization (Resource Control)

```python
# Continue in src/security/auth.py

@auth.on
async def add_owner(
    ctx: Auth.types.AuthContext,
    value: dict
) -> dict:
    """
    This function runs when users access resources (threads, messages, etc.)
    It controls WHO can access WHAT.
    
    Args:
        ctx: Contains user info, permissions, path, etc.
        value: The resource being accessed/created
    
    Returns:
        A filter dict that restricts access to resources
    """
    # Create a filter to restrict access to user's own resources
    filters = {"owner": ctx.user.identity}
    
    # If creating/updating a resource, add owner to metadata
    metadata = value.setdefault("metadata", {})
    metadata.update(filters)
    
    # Return the filter - only show resources matching this filter
    return filters

# More specific handlers for different resources

@auth.on.threads.create
async def authorize_thread_create(
    ctx: Auth.types.AuthContext,
    value: Auth.types.threads.create.value
):
    """
    Control who can create threads (conversations)
    """
    # Check if user has permission
    if "chatbot:write" not in ctx.permissions:
        raise Auth.exceptions.HTTPException(
            status_code=403,
            detail="You don't have permission to create threads"
        )
    
    # Add owner metadata
    metadata = value.setdefault("metadata", {})
    metadata["owner"] = ctx.user.identity
    metadata["created_by"] = ctx.user.display_name
    
    return {"owner": ctx.user.identity}

@auth.on.threads.read
async def authorize_thread_read(
    ctx: Auth.types.AuthContext,
    value: Auth.types.threads.read.value
):
    """
    Control who can read threads
    Admins can see all threads, users can only see their own
    """
    if "admin" in ctx.permissions:
        return True  # Admins see everything
    else:
        return {"owner": ctx.user.identity}  # Users see only their threads
```

#### Step 3: Configure LangGraph

```json
{
  "dependencies": ["."],
  "graphs": {
    "chatbot": "./src/graph.py:graph"
  },
  "env": ".env",
  "auth": {
    "path": "./src/security/auth.py:auth"
  }
}
```

#### Step 4: Access User Info in Your Graph

```python
# src/graph.py
from langgraph.graph import StateGraph
from langchain_openai import ChatOpenAI
from typing import TypedDict, Annotated

class State(TypedDict):
    messages: list
    user_info: dict

def chatbot_node(state: State, config: dict):
    """
    Your chatbot logic - now with user context!
    """
    # Get authenticated user from config
    user = config["configurable"].get("langgraph_auth_user", {})
    
    llm = ChatOpenAI()
    
    # Personalize the response based on user
    system_message = f"You are assisting {user.get('display_name', 'User')}. Be helpful and friendly."
    
    response = llm.invoke([
        {"role": "system", "content": system_message},
        *state["messages"]
    ])
    
    return {
        "messages": state["messages"] + [response],
        "user_info": user
    }

# Build graph
workflow = StateGraph(State)
workflow.add_node("chatbot", chatbot_node)
workflow.set_entry_point("chatbot")
graph = workflow.compile()
```

### 5.4 Permission-Based Access

```python
# Advanced authorization with different permission levels

@auth.on.threads.delete
async def authorize_thread_delete(
    ctx: Auth.types.AuthContext,
    value: dict
):
    """
    Only admins can delete threads
    """
    if "admin" not in ctx.permissions:
        raise Auth.exceptions.HTTPException(
            status_code=403,
            detail="Only administrators can delete threads"
        )
    return True  # Allow all deletions for admins

@auth.on.store.put
async def authorize_store_put(
    ctx: Auth.types.AuthContext,
    value: Auth.types.store.put.value
):
    """
    Control access to the data store
    Users can only write to their own namespace
    """
    namespace = value.get("namespace", [])
    
    # Namespace should start with user ID
    if not namespace or namespace[0] != ctx.user.identity:
        raise Auth.exceptions.HTTPException(
            status_code=403,
            detail="You can only write to your own namespace"
        )
    
    return True
```

---

## 6. Building a Secure Chatbot {#6-building-secure-chatbot}

### 6.1 Complete Example: Secure Multi-User Chatbot

Let's put it all together - a chatbot with FastAPI backend, LangChain for AI, and proper authentication.

#### Project Structure
```
chatbot_project/
├── .env                    # Environment variables
├── requirements.txt        # Dependencies
├── main.py                # FastAPI app
├── auth.py                # Authentication logic
├── models.py              # Data models
└── chatbot.py             # LangChain chatbot
```

#### requirements.txt
```txt
fastapi==0.104.1
uvicorn==0.24.0
python-jose[cryptography]==3.3.0
passlib[argon2]==1.7.4
python-multipart==0.0.6
python-dotenv==1.0.0
langchain==0.1.0
langchain-openai==0.0.2
pydantic==2.5.0
```

#### .env
```bash
# OpenAI API Key
OPENAI_API_KEY=sk-proj-your-key-here

# JWT Settings
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Database (for production)
# DATABASE_URL=postgresql://user:password@localhost/chatbot
```

#### models.py
```python
# models.py
from pydantic import BaseModel
from datetime import datetime

class User(BaseModel):
    username: str
    email: str | None = None
    full_name: str | None = None
    disabled: bool = False

class UserInDB(User):
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class ChatMessage(BaseModel):
    message: str
    timestamp: datetime = datetime.now()

class ChatResponse(BaseModel):
    user: str
    message: str
    response: str
    timestamp: datetime
    conversation_id: str
```

#### auth.py
```python
# auth.py
from datetime import datetime, timedelta, timezone
from typing import Annotated
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from models import User, UserInDB
import os

# Configuration from environment
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# Password hashing
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Simulated user database (replace with real database)
fake_users_db = {
    "alice": {
        "username": "alice",
        "full_name": "Alice Johnson",
        "email": "alice@example.com",
        "hashed_password": pwd_context.hash("alicepass"),
        "disabled": False,
    },
    "bob": {
        "username": "bob",
        "full_name": "Bob Smith",
        "email": "bob@example.com",
        "hashed_password": pwd_context.hash("bobpass"),
        "disabled": False,
    }
}

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def get_user(db: dict, username: str) -> UserInDB | None:
    if username in db:
        user_dict = db[username]
        return UserInDB(**user_dict)
    return None

def authenticate_user(db: dict, username: str, password: str) -> UserInDB | bool:
    user = get_user(db, username)
    if not user or not verify_password(password, user.hashed_password):
        return False
    return user

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except jwt.InvalidTokenError:
        raise credentials_exception
    
    user = get_user(fake_users_db, username=username)
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)]
) -> User:
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user
```

#### chatbot.py
```python
# chatbot.py
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain
import uuid

class SecureChatbot:
    """
    A chatbot that maintains separate conversations for each user
    """
    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0.7)
        # Store conversations per user
        self.user_conversations = {}
    
    def get_or_create_conversation(self, user_id: str, user_name: str) -> ConversationChain:
        """
        Get existing conversation or create a new one for the user
        """
        if user_id not in self.user_conversations:
            # Create memory for this user
            memory = ConversationBufferMemory(return_messages=True)
            
            # Create personalized prompt
            prompt = ChatPromptTemplate.from_messages([
                ("system", f"You are a helpful AI assistant for {user_name}. "
                          "You remember previous messages in this conversation. "
                          "Be friendly, helpful, and professional."),
                MessagesPlaceholder(variable_name="history"),
                ("human", "{input}")
            ])
            
            # Create conversation chain
            conversation = ConversationChain(
                llm=self.llm,
                memory=memory,
                prompt=prompt,
                verbose=False
            )
            
            self.user_conversations[user_id] = {
                "conversation": conversation,
                "conversation_id": str(uuid.uuid4()),
                "message_count": 0
            }
        
        return self.user_conversations[user_id]
    
    async def chat(self, user_id: str, user_name: str, message: str) -> dict:
        """
        Process a chat message for a specific user
        """
        conv_data = self.get_or_create_conversation(user_id, user_name)
        conversation = conv_data["conversation"]
        
        # Get response
        response = conversation.predict(input=message)
        
        # Update count
        conv_data["message_count"] += 1
        
        return {
            "response": response,
            "conversation_id": conv_data["conversation_id"],
            "message_count": conv_data["message_count"]
        }
    
    def clear_conversation(self, user_id: str):
        """
        Clear a user's conversation history
        """
        if user_id in self.user_conversations:
            del self.user_conversations[user_id]
```

#### main.py
```python
# main.py
from datetime import timedelta
from typing import Annotated
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from auth import (
    authenticate_user,
    create_access_token,
    get_current_active_user,
    fake_users_db,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from models import Token, User, ChatMessage, ChatResponse
from chatbot import SecureChatbot
from datetime import datetime

# Create FastAPI app
app = FastAPI(
    title="Secure Chatbot API",
    description="A chatbot with authentication and user-specific conversations",
    version="1.0.0"
)

# Initialize chatbot
chatbot = SecureChatbot()

@app.post("/token", response_model=Token)
async def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    """
    OAuth2 compatible token login endpoint
    
    Test with:
    - username: alice, password: alicepass
    - username: bob, password: bobpass
    """
    user = authenticate_user(fake_users_db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer")

@app.get("/users/me", response_model=User)
async def read_users_me(current_user: Annotated[User, Depends(get_current_active_user)]):
    """
    Get current user information
    """
    return current_user

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(
    chat_message: ChatMessage,
    current_user: Annotated[User, Depends(get_current_active_user)]
):
    """
    Send a message to your personal chatbot
    
    Each user has their own conversation history that persists
    across multiple messages until cleared.
    """
    # Process the message
    result = await chatbot.chat(
        user_id=current_user.username,
        user_name=current_user.full_name or current_user.username,
        message=chat_message.message
    )
    
    return ChatResponse(
        user=current_user.username,
        message=chat_message.message,
        response=result["response"],
        timestamp=datetime.now(),
        conversation_id=result["conversation_id"]
    )

@app.post("/chat/clear")
async def clear_conversation(
    current_user: Annotated[User, Depends(get_current_active_user)]
):
    """
    Clear your conversation history and start fresh
    """
    chatbot.clear_conversation(current_user.username)
    return {
        "status": "success",
        "message": "Conversation history cleared"
    }

@app.get("/")
async def root():
    """
    Public endpoint - no authentication required
    """
    return {
        "message": "Welcome to the Secure Chatbot API",
        "docs": "/docs",
        "endpoints": {
            "login": "POST /token",
            "chat": "POST /chat (requires auth)",
            "profile": "GET /users/me (requires auth)"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### 6.2 Testing the Secure Chatbot

#### Using cURL

```bash
# 1. Login as Alice
curl -X POST "http://localhost:8000/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=alice&password=alicepass"

# Response: {"access_token":"eyJhbGciOi...", "token_type":"bearer"}

# 2. Save the token
TOKEN="eyJhbGciOi..."

# 3. Get user info
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/users/me

# 4. Chat with the bot
curl -X POST "http://localhost:8000/chat" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello! What can you help me with?"}'

# 5. Continue the conversation
curl -X POST "http://localhost:8000/chat" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Tell me a joke"}'

# 6. Clear conversation history
curl -X POST "http://localhost:8000/chat/clear" \
  -H "Authorization: Bearer $TOKEN"
```

#### Using Python Requests

```python
# test_chatbot.py
import requests

BASE_URL = "http://localhost:8000"

# 1. Login
response = requests.post(
    f"{BASE_URL}/token",
    data={"username": "alice", "password": "alicepass"}
)
token = response.json()["access_token"]

# 2. Set up headers
headers = {"Authorization": f"Bearer {token}"}

# 3. Get user info
user_info = requests.get(f"{BASE_URL}/users/me", headers=headers).json()
print(f"Logged in as: {user_info['full_name']}")

# 4. Chat
def chat(message):
    response = requests.post(
        f"{BASE_URL}/chat",
        headers=headers,
        json={"message": message}
    )
    return response.json()

# Have a conversation
messages = [
    "Hello! Who are you?",
    "Can you help me learn about Python?",
    "What's the difference between a list and a tuple?"
]

for msg in messages:
    print(f"\n👤 User: {msg}")
    result = chat(msg)
    print(f"🤖 Bot: {result['response']}")
    print(f"📊 Conversation ID: {result['conversation_id']}")
```

---

## 7. Hands-On Exercises {#7-hands-on-exercises}

### Exercise 1: Add Registration (Beginner)

**Task**: Add a `/register` endpoint that creates new users.

**Starter Code**:
```python
@app.post("/register")
async def register(username: str, password: str, full_name: str):
    # TODO:
    # 1. Check if username already exists
    # 2. Hash the password
    # 3. Add user to database
    # 4. Return success message
    pass
```

**Solution**:
```python
@app.post("/register")
async def register(username: str, password: str, full_name: str):
    # Check if user exists
    if username in fake_users_db:
        raise HTTPException(
            status_code=400,
            detail="Username already registered"
        )
    
    # Create new user
    fake_users_db[username] = {
        "username": username,
        "full_name": full_name,
        "email": f"{username}@example.com",
        "hashed_password": get_password_hash(password),
        "disabled": False
    }
    
    return {"message": "User created successfully", "username": username}
```

### Exercise 2: Add Role-Based Access (Intermediate)

**Task**: Add an `admin` role that can view all conversations.

**Steps**:
1. Add `role` field to User model
2. Create `/admin/conversations` endpoint
3. Check if user has admin role

**Solution**:
```python
# In models.py
class User(BaseModel):
    username: str
    email: str | None = None
    full_name: str | None = None
    disabled: bool = False
    role: str = "user"  # New field

# In auth.py - update database
fake_users_db = {
    "alice": {
        # ... existing fields
        "role": "admin"  # Alice is admin
    },
    "bob": {
        # ... existing fields
        "role": "user"
    }
}

# In main.py
@app.get("/admin/conversations")
async def view_all_conversations(
    current_user: Annotated[User, Depends(get_current_active_user)]
):
    """Admin only: View all user conversations"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )
    
    # Return all conversations
    stats = {}
    for user_id, conv_data in chatbot.user_conversations.items():
        stats[user_id] = {
            "conversation_id": conv_data["conversation_id"],
            "message_count": conv_data["message_count"]
        }
    
    return stats
```

### Exercise 3: Rate Limiting (Advanced)

**Task**: Limit users to 10 messages per minute.

**Solution**:
```python
from collections import defaultdict
from datetime import datetime, timedelta

# Rate limiting storage
user_message_timestamps = defaultdict(list)

def check_rate_limit(user_id: str, max_messages: int = 10, window_minutes: int = 1):
    """Check if user exceeds rate limit"""
    now = datetime.now()
    cutoff = now - timedelta(minutes=window_minutes)
    
    # Clean old timestamps
    user_message_timestamps[user_id] = [
        ts for ts in user_message_timestamps[user_id] if ts > cutoff
    ]
    
    # Check limit
    if len(user_message_timestamps[user_id]) >= max_messages:
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded. Max {max_messages} messages per {window_minutes} minute(s)"
        )
    
    # Add current timestamp
    user_message_timestamps[user_id].append(now)

# In chat endpoint
@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(
    chat_message: ChatMessage,
    current_user: Annotated[User, Depends(get_current_active_user)]
):
    # Check rate limit first
    check_rate_limit(current_user.username)
    
    # ... rest of chat logic
```

---

## 8. Best Practices & Security {#8-best-practices}

### 8.1 Security Checklist

#### ✅ DO's

1. **Always Use HTTPS in Production**
   ```python
   # In production, ensure your app uses HTTPS
   # This encrypts all data between client and server
   ```

2. **Store Secrets in Environment Variables**
   ```python
   # ✅ Good
   import os
   SECRET_KEY = os.getenv("SECRET_KEY")
   
   # ❌ Bad
   SECRET_KEY = "hardcoded-secret-123"
   ```

3. **Hash Passwords**
   ```python
   # ✅ Good - using argon2
   from passlib.context import CryptContext
   pwd_context = CryptContext(schemes=["argon2"])
   hashed = pwd_context.hash("password")
   
   # ❌ Bad - plain text
   password = "password123"  # Never store like this!
   ```

4. **Use Token Expiration**
   ```python
   # Tokens should expire
   ACCESS_TOKEN_EXPIRE_MINUTES = 30
   ```

5. **Validate All Input**
   ```python
   from pydantic import BaseModel, validator
   
   class ChatMessage(BaseModel):
       message: str
       
       @validator('message')
       def message_not_empty(cls, v):
           if not v or not v.strip():
               raise ValueError('Message cannot be empty')
           return v
   ```

#### ❌ DON'Ts

1. **Never Log Sensitive Data**
   ```python
   # ❌ Bad
   logger.info(f"User password: {password}")
   
   # ✅ Good
   logger.info(f"User logged in: {username}")
   ```

2. **Don't Use Weak Secrets**
   ```python
   # ❌ Bad
   SECRET_KEY = "secret"
   
   # ✅ Good - generate strong random key
   import secrets
   SECRET_KEY = secrets.token_urlsafe(32)
   ```

3. **Don't Expose Internal Errors**
   ```python
   # ❌ Bad - reveals too much
   raise HTTPException(500, detail=str(database_error))
   
   # ✅ Good - generic message
   raise HTTPException(500, detail="Internal server error")
   ```

### 8.2 Common Vulnerabilities

#### SQL Injection (if using database)

```python
# ❌ VULNERABLE
query = f"SELECT * FROM users WHERE username = '{username}'"

# ✅ SAFE - use parameterized queries
query = "SELECT * FROM users WHERE username = %s"
cursor.execute(query, (username,))
```

#### Prompt Injection (for AI chatbots)

```python
# ❌ VULNERABLE
prompt = f"You are a helpful assistant. User says: {user_input}"

# ✅ SAFER - validate and sanitize input
def sanitize_input(text: str) -> str:
    # Remove potential prompt injection attempts
    dangerous_patterns = ["ignore previous", "system:", "admin:"]
    for pattern in dangerous_patterns:
        if pattern in text.lower():
            raise ValueError("Invalid input detected")
    return text

safe_input = sanitize_input(user_input)
```

#### Token Theft

```python
# Protect against token theft:

# 1. Use short expiration times
ACCESS_TOKEN_EXPIRE_MINUTES = 15  # Not days!

# 2. Implement token refresh
REFRESH_TOKEN_EXPIRE_DAYS = 7

# 3. Store tokens securely on client (httpOnly cookies)
response.set_cookie(
    key="access_token",
    value=token,
    httponly=True,  # Prevents JavaScript access
    secure=True,     # HTTPS only
    samesite="strict"  # CSRF protection
)
```

### 8.3 Production Deployment Checklist

```python
# production_config.py

import os
from functools import lru_cache
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # App
    app_name: str = "Secure Chatbot"
    debug: bool = False
    
    # Security
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Database
    database_url: str
    
    # AI
    openai_api_key: str
    
    # CORS
    allowed_origins: list[str] = ["https://yourdomain.com"]
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()

# Usage
settings = get_settings()
```

### 8.4 Monitoring and Logging

```python
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Log important events (but NOT sensitive data)
@app.post("/chat")
async def chat_endpoint(...):
    logger.info(f"Chat request from user: {current_user.username}")
    
    try:
        result = await chatbot.chat(...)
        logger.info(f"Chat response sent to user: {current_user.username}")
        return result
    except Exception as e:
        logger.error(f"Chat error for user {current_user.username}: {type(e).__name__}")
        raise
```

### 8.5 Privacy Considerations

```python
# Implement data retention policies
from datetime import timedelta

class ConversationManager:
    def cleanup_old_conversations(self, days: int = 30):
        """Delete conversations older than specified days"""
        cutoff = datetime.now() - timedelta(days=days)
        
        for user_id in list(self.user_conversations.keys()):
            conv = self.user_conversations[user_id]
            if conv["last_activity"] < cutoff:
                del self.user_conversations[user_id]
                logger.info(f"Deleted old conversation for user: {user_id}")

# Allow users to delete their data
@app.delete("/users/me/data")
async def delete_my_data(
    current_user: Annotated[User, Depends(get_current_active_user)]
):
    """GDPR compliance - allow users to delete their data"""
    # Delete conversation history
    chatbot.clear_conversation(current_user.username)
    
    # In production, also delete from database
    # db.delete_user_data(current_user.username)
    
    return {"message": "All your data has been deleted"}
```

---

## 9. LTI Authentication for LMS Integration {#9-lti-authentication}

### 9.1 What is LTI?

**LTI (Learning Tools Interoperability)** is a standard protocol that allows external educational tools to integrate securely with Learning Management Systems (LMS) like Moodle, Canvas, Blackboard, etc.

**Everyday Analogy**: 
Think of LTI as a **secure guest pass system** for your school or university. Instead of creating a new account for every online learning tool (quiz app, video platform, chatbot), you use your school login once, and the LMS gives you a special "pass" that works everywhere.

**Real-World Use Cases**:
- Embedding a chatbot tutor inside Moodle courses
- Integrating quiz tools into Canvas
- Adding virtual labs to Blackboard courses
- Single sign-on (SSO) for all educational apps

### 9.2 LTI Versions Comparison

| Feature | LTI 1.1 (Legacy) | LTI 1.3 (Current) |
|---------|------------------|-------------------|
| Authentication | OAuth 1.0 | OpenID Connect |
| Security | HMAC-SHA1 signing | JWT with RSA signatures |
| Token Format | Form parameters | JSON Web Tokens |
| Status | Deprecated but still used | Current standard |

**Important**: We'll focus on **LTI 1.3** since it's the modern standard, but many systems still support LTI 1.1 for backward compatibility.

### 9.3 LTI 1.3 Authentication Flow

LTI 1.3 uses **OpenID Connect (OIDC)** with a three-step authentication flow:

```mermaid
sequenceDiagram
    participant User as 👤 User (Alice)
    participant LMS as 🎓 LMS (Moodle)
    participant Tool as 🤖 Tool (Chatbot)

    rect rgb(255, 243, 224)
        Note over User,LMS: Step 1: User Initiates Launch
        User->>LMS: 1. Click "Launch Chatbot" in course
        Note over LMS: User is already logged<br/>into Moodle
    end

    rect rgb(227, 242, 253)
        Note over LMS,Tool: Step 2: Login Initiation (OIDC)
        LMS->>Tool: 2. POST /lti/login<br/>iss, login_hint, target_link_uri
        Tool->>Tool: 3. Generate state & nonce
        Tool-->>LMS: 4. Redirect to auth endpoint<br/>with OIDC parameters
    end

    rect rgb(232, 245, 233)
        Note over LMS,Tool: Step 3: Authentication
        LMS->>LMS: 5. Authenticate user (already logged in)
        LMS->>LMS: 6. Create JWT ID Token<br/>with user & course data
        LMS->>Tool: 7. POST /lti/callback<br/>id_token (JWT)
    end

    rect rgb(243, 229, 245)
        Note over Tool: Step 4: Token Validation
        Tool->>Tool: 8. Fetch public keys (JWKS)
        Tool->>Tool: 9. Verify JWT signature
        Tool->>Tool: 10. Validate claims<br/>(exp, nonce, iss, aud)
        Tool->>Tool: 11. Extract user info<br/>(name, email, roles, course)
    end

    rect rgb(255, 248, 225)
        Note over Tool,User: Step 5: Display Tool
        Tool-->>User: 12. Show chatbot interface<br/>personalized for Alice
    end
```

**Step-by-Step Explanation**:

**Step 1: User Action**
- Alice clicks "Launch Chatbot" inside her Moodle course
- This triggers the LTI launch process

**Step 2: Login Initiation (Third-Party Initiated Login)**
- LMS sends a login request to the Tool with:
  - `iss`: Issuer (e.g., "https://moodle.school.edu")
  - `login_hint`: User identifier (opaque to the tool)
  - `target_link_uri`: Where to launch (e.g., "https://chatbot.app/launch")
  - `lti_message_hint`: Optional data about the launch
  - `client_id`: Tool's OAuth client ID

**Step 3: Authentication Request**
- Tool redirects user back to LMS's authentication endpoint with OIDC parameters:
  - `scope`: "openid" (required)
  - `response_type`: "id_token"
  - `client_id`: Tool's registered client ID
  - `redirect_uri`: Tool's callback URL
  - `login_hint`: From Step 2
  - `state`: Random value for CSRF protection
  - `nonce`: Random value for replay attack prevention
  - `response_mode`: "form_post"

**Step 4: Authentication Response**
- LMS authenticates the user (if not already logged in)
- LMS creates a **JWT ID Token** with user and course information
- LMS POSTs the ID token back to the tool's `redirect_uri`

**Step 5: Tool Display**
- Tool validates the JWT ID token
- Tool extracts user information (name, roles, course context)
- Tool displays the chatbot interface to Alice

### 9.4 JWT ID Token Structure

The JWT ID token contains three parts: Header, Payload, and Signature.

**Header**:
```json
{
  "alg": "RS256",
  "typ": "JWT",
  "kid": "key-id-123"
}
```

**Payload (Claims)**:
```json
{
  "iss": "https://moodle.school.edu",
  "sub": "user-12345",
  "aud": ["chatbot-client-id"],
  "exp": 1699999999,
  "iat": 1699996399,
  "nonce": "random-nonce-abc123",
  
  "https://purl.imsglobal.org/spec/lti/claim/deployment_id": "deployment-1",
  "https://purl.imsglobal.org/spec/lti/claim/message_type": "LtiResourceLinkRequest",
  "https://purl.imsglobal.org/spec/lti/claim/version": "1.3.0",
  "https://purl.imsglobal.org/spec/lti/claim/target_link_uri": "https://chatbot.app/launch",
  
  "https://purl.imsglobal.org/spec/lti/claim/resource_link": {
    "id": "resource-456",
    "title": "AI Chatbot Tutor"
  },
  
  "https://purl.imsglobal.org/spec/lti/claim/context": {
    "id": "course-789",
    "label": "CS101",
    "title": "Introduction to Computer Science"
  },
  
  "https://purl.imsglobal.org/spec/lti/claim/roles": [
    "http://purl.imsglobal.org/vocab/lis/v2/membership#Learner"
  ],
  
  "name": "Alice Johnson",
  "email": "alice@school.edu",
  "given_name": "Alice",
  "family_name": "Johnson"
}
```

**Key Claims Explained**:

| Claim | Description | Example |
|-------|-------------|---------|
| `iss` | Issuer (LMS URL) | "https://moodle.school.edu" |
| `sub` | Subject (user ID) | "user-12345" |
| `aud` | Audience (tool client ID) | ["chatbot-client-id"] |
| `exp` | Token expiration time | 1699999999 (Unix timestamp) |
| `iat` | Token issued at time | 1699996399 |
| `nonce` | Replay attack prevention | "random-nonce-abc123" |
| `deployment_id` | Specific tool deployment | "deployment-1" |
| `message_type` | Type of LTI message | "LtiResourceLinkRequest" |
| `resource_link.id` | Specific resource ID | "resource-456" |
| `context.id` | Course/context ID | "course-789" |
| `roles` | User's roles in the course | ["Learner", "Instructor"] |

### 9.5 Implementing LTI 1.3 in FastAPI

Let's build a complete LTI 1.3 integration for our chatbot!

**Step 1: Install Dependencies**

```bash
pip install fastapi pyjwt cryptography httpx
```

**Step 2: LTI Configuration**

```python
# lti_config.py
from pydantic import BaseModel
from typing import List

class LTIPlatformConfig(BaseModel):
    """Configuration for an LMS platform"""
    issuer: str  # e.g., "https://moodle.school.edu"
    client_id: str
    auth_login_url: str
    auth_token_url: str
    key_set_url: str  # JWKS endpoint
    deployment_ids: List[str]

# Store configurations for multiple platforms
LTI_PLATFORMS = {
    "https://moodle.school.edu": LTIPlatformConfig(
        issuer="https://moodle.school.edu",
        client_id="chatbot-abc123",
        auth_login_url="https://moodle.school.edu/mod/lti/auth.php",
        auth_token_url="https://moodle.school.edu/mod/lti/token.php",
        key_set_url="https://moodle.school.edu/mod/lti/certs.php",
        deployment_ids=["deployment-1"]
    )
}
```

**Step 3: OIDC Login Initiation Endpoint**

```python
# lti_auth.py
from fastapi import FastAPI, Request, Form, HTTPException
from fastapi.responses import RedirectResponse, HTMLResponse
import secrets
from typing import Optional

app = FastAPI()

# Store nonces and states temporarily (in production, use Redis)
nonce_store = {}
state_store = {}

@app.post("/lti/login")
async def lti_login_initiation(
    iss: str = Form(...),
    login_hint: str = Form(...),
    target_link_uri: str = Form(...),
    lti_message_hint: Optional[str] = Form(None),
    client_id: Optional[str] = Form(None),
    lti_deployment_id: Optional[str] = Form(None)
):
    """
    Step 2: Handle OIDC third-party initiated login
    
    This is where the LMS redirects the user to initiate authentication.
    """
    
    # Validate issuer
    if iss not in LTI_PLATFORMS:
        raise HTTPException(status_code=400, detail=f"Unknown issuer: {iss}")
    
    platform = LTI_PLATFORMS[iss]
    
    # Validate client_id if provided
    if client_id and client_id != platform.client_id:
        raise HTTPException(status_code=400, detail="Invalid client_id")
    
    # Generate state and nonce for security
    state = secrets.token_urlsafe(32)
    nonce = secrets.token_urlsafe(32)
    
    # Store nonce and state (for later validation)
    nonce_store[nonce] = {
        "created_at": datetime.now(),
        "login_hint": login_hint
    }
    state_store[state] = {
        "created_at": datetime.now(),
        "target_link_uri": target_link_uri
    }
    
    # Build OIDC authentication request parameters
    auth_params = {
        "scope": "openid",
        "response_type": "id_token",
        "client_id": platform.client_id,
        "redirect_uri": "https://chatbot.app/lti/callback",  # Your tool's callback URL
        "login_hint": login_hint,
        "state": state,
        "nonce": nonce,
        "response_mode": "form_post",
        "prompt": "none"  # Don't prompt user if already authenticated
    }
    
    if lti_message_hint:
        auth_params["lti_message_hint"] = lti_message_hint
    
    # Build authentication URL
    from urllib.parse import urlencode
    auth_url = f"{platform.auth_login_url}?{urlencode(auth_params)}"
    
    # Redirect user to LMS for authentication
    return RedirectResponse(url=auth_url, status_code=302)
```

**Step 4: JWT Validation**

```python
# lti_jwt.py
import jwt
import httpx
from datetime import datetime, timedelta

async def get_platform_public_keys(key_set_url: str):
    """Fetch public keys from LMS JWKS endpoint"""
    async with httpx.AsyncClient() as client:
        response = await client.get(key_set_url)
        response.raise_for_status()
        return response.json()

async def validate_lti_token(id_token: str, platform: LTIPlatformConfig, expected_nonce: str):
    """
    Validate JWT ID token from LMS
    
    Security checks:
    1. Signature verification
    2. Issuer validation
    3. Audience validation
    4. Expiration check
    5. Nonce validation (replay attack prevention)
    6. Required claims presence
    """
    
    try:
        # Get public keys from platform
        jwks = await get_platform_public_keys(platform.key_set_url)
        
        # Decode token header to get key ID
        unverified_header = jwt.get_unverified_header(id_token)
        kid = unverified_header.get("kid")
        
        # Find matching public key
        public_key = None
        for key in jwks.get("keys", []):
            if key.get("kid") == kid:
                public_key = jwt.algorithms.RSAAlgorithm.from_jwk(key)
                break
        
        if not public_key:
            raise ValueError(f"Public key not found for kid: {kid}")
        
        # Decode and validate JWT
        decoded = jwt.decode(
            id_token,
            public_key,
            algorithms=["RS256"],
            audience=platform.client_id,
            issuer=platform.issuer
        )
        
        # Validate nonce
        if decoded.get("nonce") != expected_nonce:
            raise ValueError("Nonce mismatch - possible replay attack")
        
        # Validate expiration
        exp = decoded.get("exp")
        if not exp or datetime.fromtimestamp(exp) < datetime.now():
            raise ValueError("Token expired")
        
        # Validate deployment_id
        deployment_id = decoded.get("https://purl.imsglobal.org/spec/lti/claim/deployment_id")
        if deployment_id not in platform.deployment_ids:
            raise ValueError(f"Invalid deployment_id: {deployment_id}")
        
        # Validate message type
        message_type = decoded.get("https://purl.imsglobal.org/spec/lti/claim/message_type")
        if message_type != "LtiResourceLinkRequest":
            raise ValueError(f"Unsupported message type: {message_type}")
        
        return decoded
        
    except jwt.InvalidTokenError as e:
        raise ValueError(f"Invalid JWT: {str(e)}")
```

**Step 5: Authentication Callback Endpoint**

```python
# lti_auth.py (continued)
from lti_jwt import validate_lti_token

@app.post("/lti/callback")
async def lti_callback(
    id_token: str = Form(...),
    state: str = Form(...)
):
    """
    Step 4: Handle authentication response from LMS
    
    This receives the JWT ID token after successful authentication.
    """
    
    # Validate state (CSRF protection)
    if state not in state_store:
        raise HTTPException(status_code=400, detail="Invalid state parameter")
    
    state_data = state_store[state]
    target_link_uri = state_data["target_link_uri"]
    
    # Remove used state
    del state_store[state]
    
    try:
        # Decode JWT header to get issuer
        unverified = jwt.decode(id_token, options={"verify_signature": False})
        issuer = unverified.get("iss")
        
        if issuer not in LTI_PLATFORMS:
            raise HTTPException(status_code=400, detail=f"Unknown issuer: {issuer}")
        
        platform = LTI_PLATFORMS[issuer]
        
        # Get expected nonce
        nonce = unverified.get("nonce")
        if nonce not in nonce_store:
            raise HTTPException(status_code=400, detail="Invalid or expired nonce")
        
        # Validate JWT
        decoded_token = await validate_lti_token(id_token, platform, nonce)
        
        # Remove used nonce
        del nonce_store[nonce]
        
        # Extract user and course information
        user_info = {
            "user_id": decoded_token.get("sub"),
            "name": decoded_token.get("name"),
            "email": decoded_token.get("email"),
            "roles": decoded_token.get("https://purl.imsglobal.org/spec/lti/claim/roles", []),
            "context": decoded_token.get("https://purl.imsglobal.org/spec/lti/claim/context", {}),
            "resource_link": decoded_token.get("https://purl.imsglobal.org/spec/lti/claim/resource_link", {})
        }
        
        # Check if user is an instructor
        is_instructor = any(
            "Instructor" in role or "Teacher" in role 
            for role in user_info["roles"]
        )
        
        # Create session for the user
        session_token = create_user_session(user_info)
        
        # Render the chatbot interface
        return HTMLResponse(content=f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>AI Chatbot Tutor</title>
        </head>
        <body>
            <h1>Welcome to the AI Chatbot, {user_info['name']}!</h1>
            <p>Course: {user_info['context'].get('title', 'N/A')}</p>
            <p>Your role: {'Instructor' if is_instructor else 'Student'}</p>
            
            <div id="chatbot">
                <!-- Chatbot interface goes here -->
                <input type="hidden" id="session_token" value="{session_token}">
                <script>
                    // Initialize chatbot with session token
                    const sessionToken = document.getElementById('session_token').value;
                    // ... chatbot initialization code
                </script>
            </div>
        </body>
        </html>
        """)
        
    except ValueError as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")

def create_user_session(user_info: dict) -> str:
    """Create a session token for the authenticated user"""
    session_data = {
        "user_id": user_info["user_id"],
        "name": user_info["name"],
        "email": user_info["email"],
        "roles": user_info["roles"],
        "exp": datetime.now() + timedelta(hours=2)
    }
    
    # Create JWT session token (use your own secret key!)
    session_token = jwt.encode(session_data, "your-secret-key", algorithm="HS256")
    return session_token
```

### 9.6 Complete LTI Integration Example

Here's a full working example combining everything:

```python
# complete_lti_app.py
from fastapi import FastAPI, Request, Form, HTTPException, Depends
from fastapi.responses import RedirectResponse, HTMLResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, Annotated
import jwt
import httpx
import secrets
from datetime import datetime, timedelta
from pydantic import BaseModel

app = FastAPI(title="LTI 1.3 Chatbot Integration")

# Security scheme for API endpoints
security = HTTPBearer()

# In-memory stores (use Redis in production!)
nonce_store = {}
state_store = {}
user_sessions = {}

# LTI Configuration
class LTIPlatformConfig(BaseModel):
    issuer: str
    client_id: str
    auth_login_url: str
    auth_token_url: str
    key_set_url: str
    deployment_ids: list[str]

LTI_PLATFORMS = {
    "https://moodle.school.edu": LTIPlatformConfig(
        issuer="https://moodle.school.edu",
        client_id="chatbot-abc123",
        auth_login_url="https://moodle.school.edu/mod/lti/auth.php",
        auth_token_url="https://moodle.school.edu/mod/lti/token.php",
        key_set_url="https://moodle.school.edu/mod/lti/certs.php",
        deployment_ids=["deployment-1"]
    )
}

# ==================== OIDC Login ====================

@app.get("/lti/config/{issuer}")
async def lti_config(issuer: str):
    """Return OIDC configuration for registration"""
    return {
        "issuer": f"https://chatbot.app",
        "authorization_endpoint": f"https://chatbot.app/lti/login",
        "token_endpoint": None,  # Not used in LTI 1.3
        "jwks_uri": f"https://chatbot.app/lti/jwks",
        "registration_endpoint": f"https://chatbot.app/lti/register",
        "scopes_supported": ["openid"],
        "response_types_supported": ["id_token"],
        "subject_types_supported": ["public"],
        "id_token_signing_alg_values_supported": ["RS256"],
        "claims_supported": ["sub", "iss", "name", "email"],
        "https://purl.imsglobal.org/spec/lti-platform-configuration": {
            "messages_supported": [
                {"type": "LtiResourceLinkRequest"}
            ],
            "variables": ["User.id", "User.username", "CourseSection.id"]
        }
    }

@app.post("/lti/login")
async def lti_login(
    iss: str = Form(...),
    login_hint: str = Form(...),
    target_link_uri: str = Form(...),
    lti_message_hint: Optional[str] = Form(None),
    client_id: Optional[str] = Form(None)
):
    """OIDC third-party initiated login"""
    
    if iss not in LTI_PLATFORMS:
        raise HTTPException(400, detail=f"Unknown issuer: {iss}")
    
    platform = LTI_PLATFORMS[iss]
    
    # Generate security tokens
    state = secrets.token_urlsafe(32)
    nonce = secrets.token_urlsafe(32)
    
    # Store for validation
    nonce_store[nonce] = {"created_at": datetime.now(), "login_hint": login_hint}
    state_store[state] = {"created_at": datetime.now(), "target_link_uri": target_link_uri}
    
    # Build auth request
    from urllib.parse import urlencode
    params = {
        "scope": "openid",
        "response_type": "id_token",
        "client_id": platform.client_id,
        "redirect_uri": "https://chatbot.app/lti/callback",
        "login_hint": login_hint,
        "state": state,
        "nonce": nonce,
        "response_mode": "form_post",
        "prompt": "none"
    }
    if lti_message_hint:
        params["lti_message_hint"] = lti_message_hint
    
    auth_url = f"{platform.auth_login_url}?{urlencode(params)}"
    return RedirectResponse(auth_url, status_code=302)

# ==================== JWT Validation ====================

async def get_jwks(url: str):
    """Fetch JSON Web Key Set from platform"""
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, timeout=10.0)
        resp.raise_for_status()
        return resp.json()

async def validate_id_token(id_token: str, platform: LTIPlatformConfig, nonce: str):
    """Validate LTI JWT ID token"""
    
    # Get public keys
    jwks = await get_jwks(platform.key_set_url)
    
    # Get key ID from token header
    header = jwt.get_unverified_header(id_token)
    kid = header.get("kid")
    
    # Find matching public key
    public_key = None
    for key in jwks.get("keys", []):
        if key.get("kid") == kid:
            public_key = jwt.algorithms.RSAAlgorithm.from_jwk(key)
            break
    
    if not public_key:
        raise ValueError(f"No public key found for kid: {kid}")
    
    # Decode and validate
    decoded = jwt.decode(
        id_token,
        public_key,
        algorithms=["RS256"],
        audience=platform.client_id,
        issuer=platform.issuer
    )
    
    # Validate nonce
    if decoded.get("nonce") != nonce:
        raise ValueError("Nonce mismatch")
    
    # Validate deployment
    deployment_id = decoded.get("https://purl.imsglobal.org/spec/lti/claim/deployment_id")
    if deployment_id not in platform.deployment_ids:
        raise ValueError(f"Invalid deployment: {deployment_id}")
    
    return decoded

# ==================== Callback ====================

@app.post("/lti/callback")
async def lti_callback(
    id_token: str = Form(...),
    state: str = Form(...)
):
    """Handle authentication response"""
    
    # Validate state
    if state not in state_store:
        raise HTTPException(400, detail="Invalid state")
    
    del state_store[state]
    
    # Decode to get issuer and nonce
    unverified = jwt.decode(id_token, options={"verify_signature": False})
    issuer = unverified.get("iss")
    nonce = unverified.get("nonce")
    
    if issuer not in LTI_PLATFORMS:
        raise HTTPException(400, detail=f"Unknown issuer: {issuer}")
    
    if nonce not in nonce_store:
        raise HTTPException(400, detail="Invalid nonce")
    
    platform = LTI_PLATFORMS[issuer]
    
    # Validate token
    try:
        decoded = await validate_id_token(id_token, platform, nonce)
        del nonce_store[nonce]
    except Exception as e:
        raise HTTPException(401, detail=f"Token validation failed: {str(e)}")
    
    # Extract user info
    user_data = {
        "user_id": decoded.get("sub"),
        "name": decoded.get("name", "Unknown User"),
        "email": decoded.get("email"),
        "roles": decoded.get("https://purl.imsglobal.org/spec/lti/claim/roles", []),
        "context": decoded.get("https://purl.imsglobal.org/spec/lti/claim/context", {}),
        "resource_link": decoded.get("https://purl.imsglobal.org/spec/lti/claim/resource_link", {})
    }
    
    # Create session
    session_id = secrets.token_urlsafe(32)
    user_sessions[session_id] = {
        "user_data": user_data,
        "created_at": datetime.now(),
        "expires_at": datetime.now() + timedelta(hours=2)
    }
    
    # Check roles
    is_instructor = any("Instructor" in r or "Teacher" in r for r in user_data["roles"])
    
    # Return chatbot interface
    return HTMLResponse(f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>AI Chatbot - {user_data['context'].get('title', 'Course')}</title>
        <style>
            body {{ font-family: Arial, sans-serif; margin: 20px; }}
            .header {{ background: #4CAF50; color: white; padding: 15px; border-radius: 5px; }}
            .chat-container {{ border: 1px solid #ddd; padding: 20px; margin-top: 20px; }}
            .role-badge {{ display: inline-block; padding: 5px 10px; background: #2196F3; 
                          color: white; border-radius: 3px; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🤖 AI Chatbot Tutor</h1>
            <p>Welcome, {user_data['name']}! 
               <span class="role-badge">{'👨‍🏫 Instructor' if is_instructor else '👨‍🎓 Student'}</span>
            </p>
            <p>Course: {user_data['context'].get('title', 'N/A')}</p>
        </div>
        
        <div class="chat-container">
            <div id="messages"></div>
            <input type="text" id="user-input" placeholder="Ask a question..." style="width: 80%; padding: 10px;">
            <button onclick="sendMessage()" style="padding: 10px 20px;">Send</button>
        </div>
        
        <script>
            const sessionId = '{session_id}';
            
            async function sendMessage() {{
                const input = document.getElementById('user-input');
                const message = input.value;
                
                const response = await fetch('/chat', {{
                    method: 'POST',
                    headers: {{
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + sessionId
                    }},
                    body: JSON.stringify({{ message: message }})
                }});
                
                const data = await response.json();
                displayMessage('User', message);
                displayMessage('Bot', data.response);
                input.value = '';
            }}
            
            function displayMessage(sender, text) {{
                const messagesDiv = document.getElementById('messages');
                const msgDiv = document.createElement('div');
                msgDiv.innerHTML = '<strong>' + sender + ':</strong> ' + text;
                msgagesDiv.appendChild(msgDiv);
            }}
        </script>
    </body>
    </html>
    """)

# ==================== Chat Endpoint ====================

def get_current_user(credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)]):
    """Validate session token"""
    session_id = credentials.credentials
    
    if session_id not in user_sessions:
        raise HTTPException(401, detail="Invalid session")
    
    session = user_sessions[session_id]
    
    if session["expires_at"] < datetime.now():
        del user_sessions[session_id]
        raise HTTPException(401, detail="Session expired")
    
    return session["user_data"]

@app.post("/chat")
async def chat(
    request: Request,
    current_user: Annotated[dict, Depends(get_current_user)]
):
    """Protected chat endpoint"""
    body = await request.json()
    message = body.get("message", "")
    
    # Here you would integrate with your LangChain chatbot
    # For now, simple echo response
    response = f"Hi {current_user['name']}! You said: {message}"
    
    # Check if instructor for special features
    is_instructor = any("Instructor" in r for r in current_user["roles"])
    if is_instructor:
        response += " (Instructor features enabled)"
    
    return {"response": response, "user": current_user["name"]}

# ==================== Cleanup ====================

@app.on_event("startup")
async def startup_cleanup():
    """Clean up expired nonces and states periodically"""
    import asyncio
    
    async def cleanup():
        while True:
            await asyncio.sleep(300)  # Every 5 minutes
            
            cutoff = datetime.now() - timedelta(minutes=10)
            
            # Clean nonces
            expired_nonces = [k for k, v in nonce_store.items() if v["created_at"] < cutoff]
            for k in expired_nonces:
                del nonce_store[k]
            
            # Clean states
            expired_states = [k for k, v in state_store.items() if v["created_at"] < cutoff]
            for k in expired_states:
                del state_store[k]
            
            # Clean sessions
            expired_sessions = [k for k, v in user_sessions.items() if v["expires_at"] < datetime.now()]
            for k in expired_sessions:
                del user_sessions[k]
    
    asyncio.create_task(cleanup())
```

### 9.7 LTI Security Best Practices

**1. Nonce Management**

```python
# Use Redis for production nonce storage
import redis

redis_client = redis.Redis(host='localhost', port=6379, db=0)

def store_nonce(nonce: str, data: dict, ttl_seconds: int = 600):
    """Store nonce with automatic expiration"""
    redis_client.setex(
        f"lti:nonce:{nonce}",
        ttl_seconds,
        json.dumps(data)
    )

def validate_and_consume_nonce(nonce: str) -> dict:
    """Validate nonce and delete it (one-time use)"""
    key = f"lti:nonce:{nonce}"
    data = redis_client.get(key)
    
    if not data:
        raise ValueError("Invalid or expired nonce")
    
    # Delete immediately (prevent replay)
    redis_client.delete(key)
    
    return json.loads(data)
```

**2. Public Key Caching**

```python
# Cache JWKS to avoid fetching on every request
from cachetools import TTLCache

jwks_cache = TTLCache(maxsize=100, ttl=3600)  # 1 hour cache

async def get_cached_jwks(url: str):
    """Fetch and cache JWKS"""
    if url in jwks_cache:
        return jwks_cache[url]
    
    jwks = await get_jwks(url)
    jwks_cache[url] = jwks
    return jwks
```

**3. Deployment Validation**

```python
def validate_deployment(decoded_token: dict, platform: LTIPlatformConfig):
    """Strict deployment_id validation"""
    deployment_id = decoded_token.get(
        "https://purl.imsglobal.org/spec/lti/claim/deployment_id"
    )
    
    if not deployment_id:
        raise ValueError("Missing deployment_id claim")
    
    if deployment_id not in platform.deployment_ids:
        raise ValueError(f"Unauthorized deployment: {deployment_id}")
    
    return deployment_id
```

**4. Role-Based Access Control**

```python
def check_instructor_role(user_data: dict) -> bool:
    """Check if user has instructor role"""
    roles = user_data.get("roles", [])
    
    instructor_roles = [
        "http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor",
        "http://purl.imsglobal.org/vocab/lis/v2/institution/person#Instructor",
        "Instructor",
        "Teacher",
        "TeachingAssistant"
    ]
    
    return any(role in instructor_roles for role in roles)

@app.delete("/admin/clear-history")
async def clear_all_history(current_user: Annotated[dict, Depends(get_current_user)]):
    """Admin-only endpoint"""
    if not check_instructor_role(current_user):
        raise HTTPException(403, detail="Instructors only")
    
    # Clear all conversation history
    # ...
    return {"message": "History cleared"}
```

**5. HTTPS Enforcement**

```python
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware

# Force HTTPS in production
if os.getenv("ENVIRONMENT") == "production":
    app.add_middleware(HTTPSRedirectMiddleware)
```

### 9.8 Connecting LTI with LangChain

Now let's integrate LTI authentication with our LangChain chatbot:

```python
from langchain_openai import ChatOpenAI
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain

# User-specific conversation storage
user_conversations = {}

def get_user_chatbot(user_id: str, context: dict):
    """Get or create a chatbot for a specific user and course"""
    
    conversation_key = f"{user_id}:{context.get('id', 'default')}"
    
    if conversation_key not in user_conversations:
        # Create new conversation for this user + course
        llm = ChatOpenAI(temperature=0.7)
        
        memory = ConversationBufferMemory()
        
        # Add course context to system message
        course_title = context.get('title', 'this course')
        system_message = f"""You are an AI tutor helping students in {course_title}. 
        Be helpful, encouraging, and educational."""
        
        chain = ConversationChain(
            llm=llm,
            memory=memory,
            verbose=False
        )
        
        # Set system context
        chain.predict(input=system_message)
        
        user_conversations[conversation_key] = chain
    
    return user_conversations[conversation_key]

@app.post("/chat")
async def lti_chat(
    request: Request,
    current_user: Annotated[dict, Depends(get_current_user)]
):
    """LTI-authenticated chat endpoint"""
    body = await request.json()
    message = body.get("message", "")
    
    # Get user-specific chatbot
    context = current_user.get("context", {})
    chatbot = get_user_chatbot(current_user["user_id"], context)
    
    # Generate response
    response = chatbot.predict(input=message)
    
    # Log for instructors (optional)
    if check_instructor_role(current_user):
        log_conversation(current_user, message, response)
    
    return {
        "response": response,
        "user": current_user["name"],
        "course": context.get("title")
    }
```

### 9.9 Testing LTI Integration

**Testing with LTI Advantage Tool Platform**

You can test your LTI tool using the official IMS Global test platform:

1. Visit: https://lti-ri.imsglobal.org/platforms
2. Create a test platform
3. Register your tool with:
   - Login URL: `https://your-app.com/lti/login`
   - Redirect URI: `https://your-app.com/lti/callback`
   - JWKS URL: `https://your-app.com/lti/jwks`
4. Launch your tool from the platform

**Manual Testing**

```python
# test_lti.py
import pytest
import jwt
from fastapi.testclient import TestClient
from complete_lti_app import app

client = TestClient(app)

def test_lti_login():
    """Test OIDC login initiation"""
    response = client.post(
        "/lti/login",
        data={
            "iss": "https://moodle.school.edu",
            "login_hint": "user123",
            "target_link_uri": "https://chatbot.app/launch"
        }
    )
    
    assert response.status_code == 302  # Redirect
    assert "state=" in response.headers["location"]
    assert "nonce=" in response.headers["location"]

def test_invalid_issuer():
    """Test with unknown issuer"""
    response = client.post(
        "/lti/login",
        data={
            "iss": "https://unknown.edu",
            "login_hint": "user123",
            "target_link_uri": "https://chatbot.app/launch"
        }
    )
    
    assert response.status_code == 400
```

### 9.10 Summary

**What We Learned**:

1. **LTI Overview**
   - LTI is the standard for LMS-tool integration
   - LTI 1.3 uses OpenID Connect + OAuth 2.0 + JWT

2. **Three-Step Authentication Flow**
   - Login initiation (third-party initiated)
   - Authentication request (OIDC redirect)
   - Authentication response (JWT ID token)

3. **Security Requirements**
   - RSA signature validation
   - Nonce for replay prevention
   - State for CSRF protection
   - Deployment ID validation

4. **Implementation with FastAPI**
   - `/lti/login` endpoint for OIDC initiation
   - `/lti/callback` endpoint for token validation
   - User session management
   - Role-based access control

5. **Integration with LangChain**
   - User-specific conversation memory
   - Course-contextualized chatbots
   - Instructor analytics (optional)

**Key Differences from Regular OAuth2**:

| Aspect | OAuth 2.0 | LTI 1.3 |
|--------|-----------|---------|
| Use Case | General API access | Educational tool launch |
| Flow | Various grants | Third-party initiated OIDC |
| Token Type | Access token | ID token (JWT) |
| Context | None | Course, roles, resource link |
| Replay Protection | Optional | Required (nonce) |

**When to Use LTI**:
- ✅ Integrating with LMS platforms (Moodle, Canvas, Blackboard)
- ✅ Need course context and student roles
- ✅ Single sign-on from educational institutions
- ✅ Grade passback to LMS
- ❌ General web applications (use OAuth 2.0 instead)
- ❌ Mobile apps without LMS (use standard auth)

---

## Summary

### What We Learned

1. **Authentication vs Authorization**
   - Authentication = proving who you are (ID check)
   - Authorization = what you're allowed to do (permissions)

2. **FastAPI Security**
   - API Keys for simple authentication
   - OAuth2 with JWT for robust auth
   - Scopes for fine-grained permissions

3. **LangChain Integration**
   - Securing API keys
   - User-specific chat histories
   - Personalized AI responses

4. **LangGraph Platform**
   - Enterprise-grade authentication
   - Resource-level authorization
   - Multi-user chatbot management

5. **Best Practices**
   - Always use HTTPS
   - Hash passwords
   - Validate input
   - Log security events
   - Respect user privacy

### Next Steps

1. **Practice**: Build your own authenticated chatbot
2. **Explore**: Try different authentication methods
3. **Secure**: Implement the security checklist
4. **Deploy**: Take your chatbot to production with proper security

### Resources

- [FastAPI Security Documentation](https://fastapi.tiangolo.com/tutorial/security/)
- [LangChain Security Guide](https://python.langchain.com/docs/security)
- [LangGraph Authentication Docs](https://langchain-ai.github.io/langgraph/concepts/auth/)
- [OAuth 2.0 Simplified](https://www.oauth.com/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

**Remember**: Security is not a feature you add at the end - it's a fundamental part of your application from day one! 🔐

