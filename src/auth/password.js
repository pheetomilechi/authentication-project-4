const storage = require('../utils/storage');
const { hashPassword, verifyPassword } = require('../utils/crypto');

async function register(username, password) {
    // Check if user exists
    if (storage.findUser(username)) {
        return { success: false, message: 'User already exists' };
    }
    
    // Hash password
    const { hash, salt } = await hashPassword(password);
    
    // Store user
    storage.saveUser(username, {
        username,
        passwordHash: hash,
        salt,
        createdAt: new Date().toISOString()
    });
    
    return { success: true, message: 'User registered successfully' };
}

async function login(username, password) {
    const user = storage.findUser(username);
    
    if (!user) {
        return { success: false, message: 'User not found' };
    }
    
    const isValid = await verifyPassword(password, user.passwordHash, user.salt);
    
    if (!isValid) {
        return { success: false, message: 'Invalid password' };
    }
    
    return { 
        success: true, 
        message: 'Login successful',
        user: { username: user.username }
    };
}

module.exports = { register, login };