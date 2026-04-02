const storage = require('../utils/storage');
const { verifyPassword, generateSessionId } = require('../utils/crypto');

const SESSION_EXPIRY_MINUTES = 30;

async function sessionLogin(username, password) {
    const user = storage.findUser(username);
    
    if (!user) {
        return { success: false, message: 'User not found' };
    }
    
    const isValid = await verifyPassword(password, user.passwordHash, user.salt);
    
    if (!isValid) {
        return { success: false, message: 'Invalid password' };
    }
    
    // Create session
    const sessionId = generateSessionId();
    storage.saveSession(sessionId, {
        username: user.username,
        createdAt: Date.now(),
        expiresAt: Date.now() + (SESSION_EXPIRY_MINUTES * 60 * 1000)
    });
    
    return {
        success: true,
        message: 'Session created',
        sessionId,
        expiresIn: `${SESSION_EXPIRY_MINUTES} minutes`
    };
}

function getProfile(sessionId) {
    const session = storage.findSession(sessionId);
    
    if (!session) {
        return { success: false, message: 'Session not found' };
    }
    
    if (Date.now() > session.expiresAt) {
        storage.destroySession(sessionId);
        return { success: false, message: 'Session expired' };
    }
    
    const user = storage.findUser(session.username);
    
    return {
        success: true,
        user: {
            username: user.username,
            createdAt: user.createdAt
        },
        sessionExpiresAt: new Date(session.expiresAt).toISOString()
    };
}

function logout(sessionId) {
    const session = storage.findSession(sessionId);
    
    if (!session) {
        return { success: false, message: 'Session not found' };
    }
    
    storage.destroySession(sessionId);
    return { success: true, message: 'Logged out successfully' };
}

module.exports = { sessionLogin, getProfile, logout };