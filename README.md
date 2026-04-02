# Authentication System - Multi-Method Implementation

A production-ready authentication system demonstrating three industry-standard authentication methods: password-based, token-based, and session-based authentication. Built with pure Node.js using no external dependencies.

    Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Security Features](#security-features)

## Overview

This project provides a comprehensive, educational implementation of modern authentication mechanisms. It focuses on security best practices while maintaining code clarity and demonstrating how authentication works at the protocol level without relying on third-party libraries.

## Key Features

- **Multiple Authentication Methods** - Support for passwords, tokens, and sessions
- **Zero Dependencies** - Pure Node.js implementation using built-in modules
- **Secure Cryptography** - Industry-standard algorithms (PBKDF2, HMAC-SHA256)
- **Session Management** - HttpOnly cookie support with automatic expiration
- **Token-Based Authentication** - JWT-like signed tokens with expiration
- **Password Security** - Salted hashing with PBKDF2

## Technology Stack

| Component | Technology |
|-----------|-----------|
| Runtime | Node.js (v14+) |
| HTTP Server | Native `http` module |
| Cryptography | Native `crypto` module |
| Data Storage | In-memory JavaScript Maps |

## Project Structure

```
src/
├── server.js                 # Main server entry point
└── auth/
    ├── password.js          # Password authentication logic
    ├── session.js           # Session management
    └── token.js             # Token-based authentication
└── utils/
    ├── crypto.js            # Cryptographic utilities
    └── storage.js           # Data storage layer
```

## Getting Started

### Installation

1. Clone the repository and navigate to the project directory:

```bash
cd authentication-project-4
```

2. Start the server:

```bash
node src/server.js
```

The server will start on the default port (typically 3000).

## API Documentation

### Password Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/password/register` | POST | Register a new user with email and password |
| `/auth/password/login` | POST | Authenticate with credentials and receive a session |

### Token-Based Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/token/login` | POST | Authenticate and receive a signed token |
| `/auth/token/verify` | GET | Verify token validity using Bearer header |

### Session-Based Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/session/login` | POST | Create an authenticated session |
| `/auth/session/profile` | GET | Access protected user profile resource |
| `/auth/session/logout` | POST | Destroy the current session |

## Security Features

- **Password Hashing** - PBKDF2 with random salt generation
- **Token Signing** - HMAC-SHA256 for token integrity verification
- **Token Expiration** - Automatic expiration enforcement
- **Session Expiration** - Configurable session timeout
- **HttpOnly Cookies** - Prevents XSS attacks by restricting cookie access
- **Secure Storage** - Sensitive data isolation and protection

# 1. Register a user
curl -X POST http://localhost:3000/auth/password/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john","password":"mypassword123"}'

# 2. Password Login
curl -X POST http://localhost:3000/auth/password/login \
  -H "Content-Type: application/json" \
  -d '{"username":"john","password":"mypassword123"}'

# 3. Token Login
curl -X POST http://localhost:3000/auth/token/login \
  -H "Content-Type: application/json" \
  -d '{"username":"john","password":"mypassword123"}'

# 4. Verify Token (replace TOKEN)
curl -X GET http://localhost:3000/auth/token/verify \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# 5. Session Login
curl -X POST http://localhost:3000/auth/session/login \
  -H "Content-Type: application/json" \
  -d '{"username":"john","password":"mypassword123"}' \
  -c cookies.txt

# 6. Get Profile (using session)
curl -X GET http://localhost:3000/auth/session/profile -b cookies.txt

# 7. Logout
curl -X POST http://localhost:3000/auth/session/logout -b cookies.txt

**Learn more** - See [research/authentication-reserach.md](research/authentication-reserach.md) for detailed authentication concepts and implementation notes.

