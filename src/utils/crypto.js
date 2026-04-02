const crypto = require('crypto');

// Password hashing with PBKDF2
function hashPassword(password, salt) {
    return new Promise((resolve, reject) => {
        // Generate salt if not provided
        const actualSalt = salt || crypto.randomBytes(16).toString('hex');
        
        crypto.pbkdf2(password, actualSalt, 100000, 64, 'sha512', (err, derivedKey) => {
            if (err) reject(err);
            resolve({
                hash: derivedKey.toString('hex'),
                salt: actualSalt
            });
        });
    });
}

// Verify password
async function verifyPassword(password, storedHash, salt) {
    const { hash } = await hashPassword(password, salt);
    return hash === storedHash;
}

// Generate session ID
function generateSessionId() {
    return crypto.randomBytes(32).toString('hex');
}

// Create HMAC token (JWT-style)
function createToken(payload, secret, expiresInMinutes = 60) {
    const header = { alg: 'HS256', typ: 'token' };
    const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url');
    const payloadB64 = Buffer.from(JSON.stringify({
        ...payload,
        iat: Date.now(),
        exp: Date.now() + (expiresInMinutes * 60 * 1000)
    })).toString('base64url');
    
    const signature = crypto
        .createHmac('sha256', secret)
        .update(`${headerB64}.${payloadB64}`)
        .digest('base64url');
    
    return `${headerB64}.${payloadB64}.${signature}`;
}

// Verify token
function verifyToken(token, secret) {
    const [headerB64, payloadB64, signature] = token.split('.');
    
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${headerB64}.${payloadB64}`)
        .digest('base64url');
    
    if (signature !== expectedSignature) {
        return { valid: false, error: 'Invalid signature' };
    }
    
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString());
    
    if (Date.now() > payload.exp) {
        return { valid: false, error: 'Token expired' };
    }
    
    return { valid: true, payload };
}

module.exports = {
    hashPassword,
    verifyPassword,
    generateSessionId,
    createToken,
    verifyToken
};