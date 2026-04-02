const http = require('http');
const passwordAuth = require('./auth/password');
const tokenAuth = require('./auth/token');
const sessionAuth = require('./auth/session');

const PORT = 3000;

// Parse JSON body
function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                resolve(JSON.parse(body));
            } catch (e) {
                reject(new Error('Invalid JSON'));
            }
        });
        req.on('error', reject);
    });
}

// Send JSON response
function sendResponse(res, statusCode, data) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end(JSON.stringify(data));
}

// Route handler
async function handleRequest(req, res) {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        sendResponse(res, 200, {});
        return;
    }

    const url = new URL(req.url, `http://localhost:${PORT}`);
    const path = url.pathname;

    try {
        // ===== PASSWORD AUTHENTICATION =====
        if (path === '/auth/password/register' && req.method === 'POST') {
            const body = await parseBody(req);
            const result = await passwordAuth.register(body.username, body.password);
            return sendResponse(res, result.success ? 201 : 400, result);
        }

        if (path === '/auth/password/login' && req.method === 'POST') {
            const body = await parseBody(req);
            const result = await passwordAuth.login(body.username, body.password);
            return sendResponse(res, result.success ? 200 : 401, result);
        }

        // ===== TOKEN AUTHENTICATION =====
        if (path === '/auth/token/login' && req.method === 'POST') {
            const body = await parseBody(req);
            const result = await tokenAuth.tokenLogin(body.username, body.password);
            return sendResponse(res, result.success ? 200 : 401, result);
        }

        if (path === '/auth/token/verify' && req.method === 'GET') {
            const authHeader = req.headers['authorization'];
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return sendResponse(res, 401, { 
                    success: false, 
                    message: 'No token provided' 
                });
            }
            const token = authHeader.split(' ')[1];
            const result = tokenAuth.verifyTokenEndpoint(token);
            return sendResponse(res, result.success ? 200 : 401, result);
        }

        // ===== SESSION AUTHENTICATION =====
        if (path === '/auth/session/login' && req.method === 'POST') {
            const body = await parseBody(req);
            const result = await sessionAuth.sessionLogin(body.username, body.password);
            if (result.success) {
                // Set session cookie
                res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'Set-Cookie': `sessionId=${result.sessionId}; HttpOnly; Path=/; Max-Age=${30 * 60}`,
                    'Access-Control-Allow-Origin': '*'
                });
                res.end(JSON.stringify(result));
                return;
            }
            return sendResponse(res, 401, result);
        }

        if (path === '/auth/session/profile' && req.method === 'GET') {
            // Get session ID from cookie or header
            let sessionId = null;
            const cookieHeader = req.headers['cookie'];
            if (cookieHeader) {
                const cookies = cookieHeader.split(';');
                for (const cookie of cookies) {
                    const [name, value] = cookie.trim().split('=');
                    if (name === 'sessionId') sessionId = value;
                }
            }
            // Fallback to Authorization header
            if (!sessionId) {
                const authHeader = req.headers['authorization'];
                if (authHeader) sessionId = authHeader;
            }
            
            if (!sessionId) {
                return sendResponse(res, 401, { 
                    success: false, 
                    message: 'No session provided' 
                });
            }
            
            const result = sessionAuth.getProfile(sessionId);
            return sendResponse(res, result.success ? 200 : 401, result);
        }

        if (path === '/auth/session/logout' && req.method === 'POST') {
            let sessionId = null;
            const cookieHeader = req.headers['cookie'];
            if (cookieHeader) {
                const cookies = cookieHeader.split(';');
                for (const cookie of cookies) {
                    const [name, value] = cookie.trim().split('=');
                    if (name === 'sessionId') sessionId = value;
                }
            }
            if (!sessionId) {
                const authHeader = req.headers['authorization'];
                if (authHeader) sessionId = authHeader;
            }
            
            if (!sessionId) {
                return sendResponse(res, 400, { 
                    success: false, 
                    message: 'No session provided' 
                });
            }
            
            const result = sessionAuth.logout(sessionId);
            return sendResponse(res, result.success ? 200 : 400, result);
        }

        // 404 for unknown routes
        sendResponse(res, 404, { 
            success: false, 
            message: 'Route not found',
            availableRoutes: [
                'POST /auth/password/register',
                'POST /auth/password/login',
                'POST /auth/token/login',
                'GET  /auth/token/verify',
                'POST /auth/session/login',
                'GET  /auth/session/profile',
                'POST /auth/session/logout'
            ]
        });

    } catch (error) {
        sendResponse(res, 500, { 
            success: false, 
            message: 'Internal server error',
            error: error.message 
        });
    }
}

// Start server
const server = http.createServer(handleRequest);

server.listen(PORT, () => {
    console.log(`🔐 Authentication Server running on http://localhost:${PORT}`);
    console.log('\nAvailable endpoints:');
    console.log('  POST /auth/password/register');
    console.log('  POST /auth/password/login');
    console.log('  POST /auth/token/login');
    console.log('  GET  /auth/token/verify');
    console.log('  POST /auth/session/login');
    console.log('  GET  /auth/session/profile');
    console.log('  POST /auth/session/logout');
});