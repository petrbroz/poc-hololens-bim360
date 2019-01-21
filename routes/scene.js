const express = require('express');

const ARVRClient = require('../helpers/forge/arvr');

const { TOOLKIT_API_HOST, BIM360_DOCUMENT_VERSION_URN } = process.env;
const MISSING_TOKEN_WARNING = `No 3-legged token cached in server. Make sure to go to the server URL and sign in first.`;

let router = express.Router();

router.use(function(req, res, next) {
    const credentials = req.app.get('FORGE_3LEGGED_TOKEN');
    if (!credentials) {
        res.status(401).send(MISSING_TOKEN_WARNING);
        return;
    }
    req.access_token = credentials.access_token;
    next();
});

// GET /api/scene
// Returns list of all available scenes for different models.
router.get('/', async function(req, res, next) {
    const client = new ARVRClient(TOOLKIT_API_HOST, req.access_token);
    try {
        const scenes = await client.getScenes(BIM360_DOCUMENT_VERSION_URN);
        res.json(scenes);
    } catch(err) {
        next(err);
    }
});

// GET /api/scene/:id
// Returns details of a specific scene, incl. an access token needed to load the scene.
router.get('/:id', async function(req, res, next) {
    const client = new ARVRClient(TOOLKIT_API_HOST, req.access_token);
    try {
        const scene = await client.getScene(BIM360_DOCUMENT_VERSION_URN, req.params.id);
        scene.access_token = req.access_token;
        res.json(scene);
    } catch(err) {
        next(err);
    }
});

module.exports = router;