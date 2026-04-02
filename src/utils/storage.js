// In-memory storage using Maps
const users = new Map();      // username -> user data
const sessions = new Map();   // sessionId -> session data
const tokens = new Map();     // token -> token data

module.exports = {
    users,
    sessions,
    tokens,
    
    // Helper methods
    findUser(username) {
        return users.get(username);
    },
    
    saveUser(username, userData) {
        users.set(username, userData);
    },
    
    saveSession(sessionId, sessionData) {
        sessions.set(sessionId, sessionData);
    },
    
    destroySession(sessionId) {
        sessions.delete(sessionId);
    },
    
    findSession(sessionId) {
        return sessions.get(sessionId);
    },
    
    saveToken(token, tokenData) {
        tokens.set(token, tokenData);
    },
    
    findToken(token) {
        return tokens.get(token);
    },
    
    isTokenExpired(tokenData) {
        return Date.now() > tokenData.expiresAt;
    }
};