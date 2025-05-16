# Online Voting System

A secure and user-friendly web application for conducting online elections with voter authentication and result calculation.

## Architectural Diagram

```
graph TD
    A[Voter (Browser)]
    B[React Frontend]
    C[Express Backend]
    D[MongoDB Database]

    subgraph Security Layers
        E1[JWT Authentication]
        E2[Helmet Middleware]
        E3[Environment Variables]
        E4[bcrypt Password Hashing]
        E5[CORS Policy]
    end

    A -->|HTTPS, CORS Restricted| B
    B -->|API Calls (JWT Token)| C
    C -->|Mongoose ODM| D

    C --> E1
    C --> E2
    C --> E3
    C --> E4
    B --> E5
```

---

## ZAP Security Report: Before & After Mitigation (Plain Text)

### 1. Content Security Policy (CSP) Header Not Set / Failure to Define Directive with No Fallback
Risk: Medium
Before: No CSP header was set, so browsers would not restrict the sources of scripts, styles, etc. Vulnerable to XSS and other injection attacks.
After (Mitigation in Code):
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    objectSrc: ["'none'"],
    upgradeInsecureRequests: [],
  }
}));

### 2. Cross-Domain Misconfiguration
Risk: Medium
Before: CORS policy may have been too permissive, potentially allowing requests from any origin.
After (Mitigation in Code):
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

### 3. Hidden File Found
Risk: Medium
Before: Hidden files (e.g., .hg, .env) could be served by the static file server, exposing sensitive data.
After (Mitigation in Code):
app.use(express.static('public', { dotfiles: 'ignore' })); // Block hidden files

### 4. Missing Anti-clickjacking Header
Risk: Medium
Before: No X-Frame-Options header, making the app vulnerable to clickjacking.
After (Mitigation in Code):
app.use(helmet.frameguard({ action: 'deny' }));

### 5. Server Leaks Information via "X-Powered-By"
Risk: Low
Before: The X-Powered-By header revealed Express/Node.js usage.
After (Mitigation in Code):
app.use(helmet.hidePoweredBy());
app.disable('x-powered-by');

### 6. X-Content-Type-Options Header Missing
Risk: Low
Before: No X-Content-Type-Options: nosniff header, allowing browsers to MIME-sniff.
After (Mitigation in Code):
app.use(helmet()); // Helmet sets this header by default

### 7. Timestamp Disclosure - Unix
Risk: Low
Before: Build artifacts (e.g., JS bundles) exposed Unix timestamps.
After: This is a low-risk issue. No direct code change, but you can review your build process to avoid exposing timestamps.

### 8. Information Disclosure - Suspicious Comments
Risk: Informational
Before: Comments in HTML/JS could reveal sensitive information.
After: Review and remove sensitive comments before deploying.

---

## Features

- User Authentication and Authorization
- Secure Voting Process
- Real-time Results Display
- Admin Dashboard
- Voter Registration
- Election Management
- Responsive Design

## Technology Stack

### Frontend
- HTML5
- CSS3
- JavaScript
- Bootstrap 5
- React.js

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication

## Project Structure

```