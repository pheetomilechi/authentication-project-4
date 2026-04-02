const storage = require('../utils/storage');
const { verifyPassword, createToken, verifyToken } = require('../utils/crypto');

const TOKEN_SECRET = 'your-secret-key-change-in-production';
const TOKEN_EXPIRY_MINUTES = 60;

async function tokenLogin(username, password) {
    const user = storage.findUser(username);
    
    if (!user) {
        return { success: false, message: 'User not found' };
    }
    
    const isValid = await verifyPassword(password, user.passwordHash, user.salt);
    
    if (!isValid) {
        return { success: false, message: 'Invalid password' };
    }
    
    // Create token
    const token = createToken(
        { username: user.username },
        TOKEN_SECRET,
        TOKEN_EXPIRY_MINUTES
    );
    
    // Store token
    storage.saveToken(token, {
        username: user.username,
        createdAt: Date.now(),
        expiresAt: Date.now() + (TOKEN_EXPIRY_MINUTES * 60 * 1000)
    });
    
    return {
        success: true,
        message: 'Token generated',
        token,
        expiresIn: `${TOKEN_EXPIRY_MINUTES} minutes`
    };
}

function verifyTokenEndpoint(token) {
    const result = verifyToken(token, TOKEN_SECRET);
    
    if (!result.valid) {
        return { success: false, message: result.error };
    }
    
    // Check if token is in storage (optional - for blacklisting)
    const storedToken = storage.findToken(token);
    if (!storedToken) {
        return { success: false, message: 'Token not recognized' };
    }
    
    return {
        success: true,
        message: 'Token is valid',
        payload: result.payload
    };
}

module.exports = { tokenLogin, verifyTokenEndpoint };