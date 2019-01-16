const express = require('express');
const forge = require('forge-apis');

const { FORGE_CLIENT_ID, FORGE_CLIENT_SECRET, REDIRECT_URL } = process.env;
const SCOPES = ['viewables:read', 'bucket:create', 'bucket:read', 'data:read', 'data:create', 'data:write'];

let twoLeggedAuth = new forge.AuthClientTwoLegged(FORGE_CLIENT_ID, FORGE_CLIENT_SECRET, SCOPES, true);
let threeLeggedAuth = new forge.AuthClientThreeLegged(FORGE_CLIENT_ID, FORGE_CLIENT_SECRET, REDIRECT_URL, SCOPES, true);
let router = express.Router();

// GET /api/auth/2-legged/token
// Returns 2-legged auth token and its expiration time.
router.get('/2-legged/token', async function(req, res, next) {
    try {
        const credentials = await twoLeggedAuth.authenticate();
        res.json(credentials);
    } catch(err) {
        next(err);
    }
});

// GET /api/auth/3-legged/login
// Redirects to Autodesk login.
router.get('/3-legged/login', function(req, res, next) {
    const url = threeLeggedAuth.generateAuthUrl();
    res.redirect(url);
});

// GET /api/auth/3-legged/logout
// Clears the in-memory cache of the 3-legged auth token.
router.get('/3-legged/logout', function(req, res, next) {
    req.app.set('FORGE_3LEGGED_TOKEN', null);
    res.redirect('/');
});

// GET /api/auth/3-legged/callback
// Endpoint that is called by the 3-legged auth workflow.
router.get('/3-legged/callback', async function(req, res, next) {
    try {
        const credentials = await threeLeggedAuth.getToken(req.query.code);
        req.app.set('FORGE_3LEGGED_TOKEN', credentials);
        res.redirect('/');
    } catch(err) {
        next(err);
    }
});

// GET /api/auth/3-legged/token
// Returns cached 3-legged auth token if there's one, otherwise 404.
router.get('/3-legged/token', function(req, res, next) {
    const credentials = req.app.get('FORGE_3LEGGED_TOKEN');
    if (credentials) {
        res.json(credentials);
    } else {
        res.status(404).end();
    }
});

module.exports = router;