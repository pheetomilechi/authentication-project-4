Project 4: Authentication SBTS

    Contents
1. [Password-Based Authentication](1-password-based-authentication)
2. [Multi-Factor Authentication (MFA)](2-multi-factor-authentication-mfa)
3. [Biometric Authentication](3-biometric-authentication)
4. [Token-Based Authentication](4-token-based-authentication-jwt-style)
5. [Session-Based Authentication](5-session-based-authentication)
6. [OAuth (Third-Party Authentication)](6-oauth-third-party-authentication)
7. [API Key Authentication](7-api-key-authentication)
8. [Bonus: Swagger / OpenAPI Docs](8-bonus-swagger--openapi-docs)
9. [Bonus: What Problem is React Node Framework Solving?](9-bonus-what-problem-is-react-node-framework-solving)



 1. Password-Based Authentication

 What is it?
Password-based authentication is the most traditional form of verification, where a user identifies themselves with a unique identifier (username or email) and proves their identity by submitting a secret string (password) that only they should know.

 When should it be used?
* As the baseline authentication method for traditional web applications.
* As the first factor in a Multi-Factor Authentication (MFA) flow.
* In scenarios where users do not have access to modern hardware tokens or biometric scanners.
* Internal enterprise tools where simplicity is prioritized over cutting-edge security.

 How does it work? (Technical Flow)
1. **Registration:** The user submits a plaintext password. The server generates a cryptographic salt, passes the password and salt through a Key Derivation Function (KDF) like PBKDF2, and stores the resulting hash and salt in the database.
2. **Login:** The user submits their plaintext password.
3. **Verification:** The server retrieves the user's stored salt and hash. It runs the submitted password through the same KDF with the stored salt.
4. **Comparison:** The server compares the newly generated hash with the stored hash. If they match, authentication is successful.

 Security Considerations
* **Never store plaintext passwords:** Always hash passwords before storage.
* **Use strong, slow hashing algorithms:** Algorithms like PBKDF2, bcrypt, or Argon2 are designed to be computationally expensive to deter brute-force attacks.
* **Always use a unique salt:** This prevents attackers from using pre-computed "rainbow tables" and ensures that two users with the same password have different hashes.
* **Implement rate limiting:** Prevent brute-force and credential-stuffing attacks by limiting the number of failed login attempts.
* **Enforce password policies:** Require minimum lengths and complexity, though modern NIST guidelines suggest prioritizing length over arbitrary complexity rules.

---

 2. Multi-Factor Authentication (MFA)

 What is it?
MFA is an authentication method that requires the user to present two or more verification factors to gain access. It combines two or more of the following categories: *Knowledge* (something you know, like a password), *Possession* (something you have, like a phone), and *Inherence* (something you are, like a fingerprint).

 When should it be used?
* When accessing highly sensitive data (e.g., banking, healthcare records, email accounts).
* For administrative panels and root access to systems.
* In enterprise environments to comply with security standards (like SOC 2 or HIPAA).
* As a mandatory step for remote workers accessing internal networks via VPN.

 How does it work? (Technical Flow)
1. **Primary Authentication:** The user successfully completes the standard password-based login.
2. **MFA Challenge Triggered:** The server flags the account as requiring a second factor and sends a challenge.
3. **Second Factor Generation:** 
   * *TOTP (Time-Based One-Time Password):* An app (like Google Authenticator) generates a 6-digit code based on a shared secret and the current time.
   * *SMS/Email:* The server sends a random code to the user's phone or email.
4. **Verification:** The user submits the code. The server verifies it against its expected value (or checks the HMAC-based calculation for TOTP).
5. **Access Granted:** If both factors succeed, a session or token is issued.

 Security Considerations
* **Avoid SMS-based MFA if possible:** SMS is susceptible to SIM-swapping and interception. TOTP is vastly superior.
* **Provide Backup Codes:** Users can lose access to their devices. Cryptographically generated backup codes allow account recovery.
* **Rate limiting on MFA attempts:** A 6-digit code has only 1 million combinations. Rate limiting is critical to prevent brute-forcing the second factor.
* **Re-prompting for sensitive actions:** Don't just verify MFA at login; ask for it again when changing passwords or making financial transactions.



 3. Biometric Authentication

 What is it?
Biometric authentication verifies a user's identity by analyzing unique biological characteristics, such as fingerprints, facial geometry, iris patterns, or voiceprints.

 When should it be used?
* Mobile applications where typing passwords is inconvenient.
* Devices equipped with specialized hardware (Touch ID, Face ID, Windows Hello).
* High-security physical access points combined with digital access (e.g., data centers).
* Passwordless authentication flows (WebAuthn/FIDO2 standards).

 How does it work? (Technical Flow)
1. **Enrollment:** The user provides a biometric sample. The hardware sensor captures the data and passes it to a secure enclave/processor.
2. **Template Creation:** The processor extracts unique mathematical features from the sample and creates a biometric "template." The actual image/voice recording is *not* stored.
3. **Authentication Attempt:** The user presents their biometric trait (e.g., touches the sensor).
4. **Comparison:** The new sample is converted into a template and mathematically compared to the stored template.
5. **Threshold Matching:** If the similarity score exceeds a predefined threshold, the hardware releases a cryptographic assertion to the application.

 Security Considerations
* **Biometrics are public:** You can change a password, but you cannot change your fingerprint. If a biometric is compromised, it is compromised forever.
* **Never store raw biometric data:** Only store encrypted mathematical templates.
* **Process locally:** Biometric matching should happen on a secure hardware chip (like a Trusted Platform Module or Secure Enclave), never send the biometric data over the network.
* **Implement Liveness Detection:** Prevent spoofing using photos, masks, or recorded audio by requiring movement or 3D depth mapping.



 4. Token-Based Authentication (JWT-style)

 What is it?
Token-based authentication is a stateless mechanism where the server authenticates a user once and issues a cryptographically signed string (a token). The client stores this token and sends it with every subsequent request to prove their identity, eliminating the need for the server to remember session state.

 When should it be used?
* Single Page Applications (SPAs) built with React, Angular, or Vue.
* Mobile applications (iOS/Android).
* Microservices architectures where services need to verify users without querying a central session database.
* APIs that will be consumed by third-party clients.

 How does it work? (Technical Flow)
1. **Login:** User sends credentials to the `/login` endpoint.
2. **Token Generation:** The server verifies the credentials and creates a token. A custom/JWT-style token typically consists of three Base64URL-encoded parts: `Header.Payload.Signature`. The signature is created using an algorithm like HMAC-SHA256.
3. **Client Storage:** The server sends the token to the client, which stores it (e.g., in memory or HttpOnly cookies).
4. **Resource Access:** For every protected request, the client sends the token in the HTTP header (`Authorization: Bearer <token>`).
5. **Verification:** The server reads the token, recalculates the signature using its secret key, and checks if it matches the sent signature. It also checks the `exp` (expiration) claim.

 Security Considerations
* **Use strong secrets:** The signing secret must be long and completely random.
* **Set short expiration times:** Tokens cannot be easily revoked. If stolen, they are valid until they expire. Use short lifespans (e.g., 15 minutes) paired with Refresh Tokens.
* **Do not store sensitive data in the payload:** The payload is merely Base64 encoded, not encrypted. Anyone who intercepts the token can read the payload.
* **Prevent token interception:** Always transmit tokens over HTTPS. Store them in HttpOnly cookies if possible to prevent XSS attacks from stealing them via JavaScript.



 5. Session-Based Authentication

 What is it?
Session-based authentication is a stateful mechanism where the server remembers the user's logged-in state. After a successful login, the server creates a record (the "session") in its memory or database and gives the client a unique ID to reference that record.

 When should it be used?
* Traditional server-rendered web applications (like those built with EJS, Pug, or PHP).
* Applications that require immediate, granular control over user sessions (e.g., instant logout, viewing all active devices).
* When you want to avoid the complexity and token-size overhead of JWTs.

 How does it work? (Technical Flow)
1. **Login:** User submits valid credentials.
2. **Session Creation:** The server generates a unique, unpredictable Session ID (e.g., a cryptographically secure random string).
3. **Server Storage:** The server stores a session object in memory/database mapped to this ID (e.g., `{ sessionId: "abc123", username: "john", expiresAt: ... }`).
4. **Cookie Setting:** The server sends a `Set-Cookie: sessionId=abc123; HttpOnly; Secure` header back to the client.
5. **Subsequent Requests:** The browser automatically attaches the cookie to every future request to that domain.
6. **Validation:** The server reads the Session ID from the cookie, looks up the session in its storage, and grants access if the session is valid and not expired.

 Security Considerations
* **Cookie Flags:** Always use `HttpOnly` (prevents JavaScript access) and `Secure` (only sends over HTTPS). Use `SameSite=Strict` or `Lax` to prevent Cross-Site Request Forgery (CSRF).
* **Session Expiration:** Implement both idle timeout (expires after X minutes of inactivity) and absolute timeout (expires X hours after creation).
* **Session Fixation Protection:** Always regenerate a new Session ID after a user logs in; do not accept session IDs from URL parameters.
* **Memory Leaks:** Since sessions are stored in memory, expired sessions must be regularly cleaned up to prevent memory exhaustion (especially in Node.js).



 6. OAuth (Third-Party Authentication)

 What is it?
OAuth 2.0 is an authorization framework (often used for authentication, colloquially called "Social Login") that allows an application to access a user's resources on another server without requiring them to share their password. For example, logging into a new app using your Google or GitHub account.

 When should it be used?
* To reduce friction during user onboarding (users don't want to fill out registration forms).
* When you want to offload the security burden of password storage to a trusted provider (Google, Microsoft, Apple).
* When your application needs to interact with third-party APIs on behalf of the user (e.g., posting to Twitter, reading Google Drive files).

 How does it work? (Technical Flow - Authorization Code Flow)
1. **Redirect:** The user clicks "Login with Google". The app redirects the browser to Google's OAuth URL with its `client_id` and a `redirect_uri`.
2. **Consent:** The user logs into Google (if not already) and grants the app permission to access their profile.
3. **Callback:** Google redirects the user back to the app's `redirect_uri` with an `authorization_code` in the URL.
4. **Token Exchange:** The app's backend takes this code and securely exchanges it with Google's servers by providing the code, `client_id`, and `client_secret`.
5. **Access Granted:** Google returns an Access Token. The app uses this token to call Google's userinfo endpoint to get the user's email/name, then creates a local session for that user.

 Security Considerations
* **Protect the Client Secret:** The secret used in step 4 must never be exposed to the frontend/browser. It must only exist on your secure backend.
* **Validate the `state` parameter:** Generate a random string before the redirect, pass it to the provider, and verify it when the user returns. This prevents Cross-Site Request Forgery (CSRF) attacks.
* **Strict Redirect URIs:** OAuth providers will only redirect to pre-registered URIs. Ensure these are strictly defined to prevent open-redirect attacks.
* **Use PKCE for Public Clients:** If implementing OAuth in a mobile app or SPA where you cannot hide a client secret, use the PKCE (Proof Key for Code Exchange) extension to secure the flow.



 7. API Key Authentication

 What is it?
API Key authentication is a simple method where a unique string (the key) is assigned to a developer or client application. The client passes this key in the request header (e.g., `X-API-Key: 12345`), and the server validates it to grant access.

 When should it be used?
* Business-to-Business (B2B) integrations.
* Public APIs (e.g., weather APIs, mapping APIs, currency converters).
* Server-to-server communication where human users are not involved.
* Tracking usage and billing based on the identity of the calling application.

 How does it work? (Technical Flow)
1. **Generation:** A user logs into a developer portal and clicks "Generate API Key". The server creates a random string and stores a hash of it in the database.
2. **Distribution:** The server shows the plaintext key to the user *exactly once*.
3. **Request:** The client application makes an HTTP request to the API, attaching the key in the header.
4. **Validation:** The API server hashes the incoming key and checks if it exists in the database.
5. **Rate Limiting/Access:** If valid, the server processes the request and updates usage metrics associated with that specific key.

 Security Considerations
* **API Keys are NOT user authentication:** They identify the *application*, not the *user*. They do not have complex scopes or claims like JWTs.
* **Transmit over HTTPS:** Because the key grants full access, it must never be sent over plain HTTP.
* **Key Rotation:** Enforce periodic key expiration and allow developers to easily roll/regenerate keys if one is accidentally committed to GitHub.
* **Implement strict Rate Limiting:** Since API keys often bypass traditional user login, rate limiting is the primary defense against abuse and DDoS attacks.



 8.  Swagger / OpenAPI Docs

    What is it?
Swagger (now officially known as the OpenAPI Specification or OAS) is a standard, machine-readable format (JSON or YAML) for describing RESTful APIs. It defines the available endpoints, the expected request formats, response schemas, and authentication methods.

    What Problem is it Solving?
Historically, APIs were documented manually in Word docs or Wikis. This led to massive synchronization issues: if a backend developer changed an endpoint, the documentation became outdated, causing endless frustration for frontend developers and third-party integrators. 

    Why use it?
* **Single Source of Truth:** The documentation lives alongside the code. If the code changes, the spec changes.
* **Interactive UI (Swagger UI):** Developers can view the docs in a browser and actually send test requests directly from the documentation page.
* **Auto-Generation:** Tools can read the OpenAPI spec and automatically generate client SDKs (e.g., generating a JavaScript class to interact with your API), server stubs, and Postman collections.

     How does it work?
1. A developer writes an `openapi.yaml` file defining paths (`/auth/login`), methods (`POST`), and schemas (`username: string`).
2. This file is fed into **Swagger UI**, which renders a beautiful, interactive webpage.
3. Alternatively, libraries like `swagger-jsdoc` can parse JSDoc comments written directly above your Node.js route functions to auto-generate the YAML file.



 9.  What Problem is React Node Framework Solving?

 What is it?
A "React Node Framework" refers to the ecosystem of meta-frameworks like **Next.js**, **Remix**, or the traditional **MERN** stack (MongoDB, Express, React, Node). They combine a React frontend with a Node.js backend into a unified development experience.

 What Problem is it Solving?

**1. The Context-Switching Problem (Language Unification)**
Historically, building a web app meant writing Java/C# for the backend, SQL for the database, and JavaScript for the frontend. A React+Node stack allows a developer (or a team) to write **JavaScript/TypeScript everywhere**. You share the same types, logic, and mental models across the entire stack.

**2. Code Sharing and Validation**
Without a unified framework, you might write form validation rules on the backend (to secure the database) and then write the *exact same rules* again on the frontend (for user experience). React/Node frameworks solve this by allowing you to write a single validation schema (e.g., using Zod or Yup) and import it into both the client and the server.

**3. The SEO and Performance Problem with SPAs**
Traditional React applications are Single Page Applications (SPAs). The server sends a blank HTML page and a massive JavaScript file. The browser must download and execute the JS before the user sees anything. This is terrible for SEO (Google's bots struggle with blank pages) and slow on mobile devices. Frameworks like Next.js solve this with **Server-Side Rendering (SSR)**, where the Node server pre-renders the React components into HTML and sends a fully formed page to the browser.

**4. Routing and Deployment Complexity**
In a standard React app, the client handles routing. If a user bookmarks `/profile`, the server tries to find a file at `/profile`, fails, and returns a 404. React+Node frameworks move routing to the server (or a serverless edge function), ensuring direct URL access works seamlessly while still providing the snappy, app-like feel of client-side routing.