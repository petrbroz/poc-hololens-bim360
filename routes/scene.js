const express = require('express');

const ARVRClient = require('../helpers/forge/arvr');

const { TOOLKIT_API_HOST, BIM360_DOCUMENT_VERSION_URN, BIM360_PROJECT_ID } = process.env;
const MISSING_TOKEN_WARNING = `No 3-legged token cached in server. Make sure to go to the server URL and sign in first.`;

let router = express.Router();

router.use(function(req, res, next) {
    const credentials = req.session.token;
    if (!credentials) {
        res.status(401).send(MISSING_TOKEN_WARNING);
        return;
    }
    next();
});

// GET /api/scene
// Returns list of all available scenes for different models.
router.get('/', async function(req, res, next) {
    const client = new ARVRClient(TOOLKIT_API_HOST, req.session.token.access_token);
    try {
        const scenes = await client.getScenes(BIM360_DOCUMENT_VERSION_URN);
        res.json(scenes);
    } catch(err) {
        next(err);
    }
});

// POST /api/scene
// Creates new scene and begins its processing.
router.post('/', async function(req, res, next) {
    const client = new ARVRClient(TOOLKIT_API_HOST, req.session.token.access_token);
    try {
        const { name, objects } = req.body;
        const response = await client.createScene(BIM360_DOCUMENT_VERSION_URN, name, BIM360_PROJECT_ID, objects);
        await client.processScene(BIM360_DOCUMENT_VERSION_URN, name);
        const manifest = await client.getManifest(BIM360_DOCUMENT_VERSION_URN);
        // console.log(manifest);
        res.json(response);
    } catch(err) {
        next(err);
    }
});

// GET /api/scene/:id
// Returns details of a specific scene, incl. an access token needed to load the scene.
router.get('/:id', async function(req, res, next) {
    const client = new ARVRClient(TOOLKIT_API_HOST, req.session.token.access_token);
    try {
        const scene = await client.getScene(BIM360_DOCUMENT_VERSION_URN, req.params.id);
        scene.access_token = req.session.token.access_token;
        res.json(scene);
    } catch(err) {
        next(err);
    }
});

module.exports = router;