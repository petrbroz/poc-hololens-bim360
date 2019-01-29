const express = require('express');
const forge = require('forge-apis');
const ARVRClient = require('../../helpers/forge/arvr');
const BIM360Client = require('../../helpers/forge/bim360');

const {
    SERVER_URL,
    FORGE_CLIENT_ID,
    FORGE_CLIENT_SECRET,
    BIM360_DOCUMENT_LINEAGE_ID,
    BIM360_DOCUMENT_VERSION_URN,
    BIM360_DOCUMENT_SHEET_GUID,
    BIM360_CONTAINER_ID,
    TOOLKIT_API_HOST,
    FORGE_API_HOST,
    BIM360_PROJECT_ID
} = process.env;
const SCOPES = ['viewables:read', 'bucket:create', 'bucket:read', 'data:read', 'data:create', 'data:write'];

let router = express.Router();

// For now, we just hard-code a single BIM360 document
const DOCUMENTS = [
    {
        id: BIM360_DOCUMENT_LINEAGE_ID,
        tip: {
            urn: BIM360_DOCUMENT_VERSION_URN
        }
    }
];

// Auth APIs

// GET /v2/api/auth/token
// Returns JSON with 2-legged auth credentials that can be used by Forge Viewer.
router.get('/auth/token', async function(req, res) {
    try {
        const client = new forge.AuthClientTwoLegged(FORGE_CLIENT_ID, FORGE_CLIENT_SECRET, SCOPES, true);
        const credentials = await client.authenticate();
        res.json(credentials);
    } catch(err) {
        res.status(500).send(err);
    }
});

// Session APIs

// GET /v2/api/sessions/:id
// Returns JSON with information about specific session.
router.get('/sessions/:id', function(req, res) {
    const { id } = req.params;
    req.sessionStore.get(id, function(err, session) {
        if (session) {
            res.json({
                id: id,
                host: SERVER_URL,
                model: BIM360_DOCUMENT_LINEAGE_ID,
                access_token: session.token && session.token.access_token
            });
        } else {
            res.status(404).end();
        }
    });
});

// Document APIs

// Middleware for any endpoint under /v2/api/docs
// Makes sure that there is an access token provided in the Authorization header.
router.use('/docs', function(req, res, next) {
    if (req.headers.authorization) {
        req._access_token = req.headers.authorization.replace('Bearer ', '');
        next();
    } else {
        res.status(401).end();
    }
});

// GET /v2/api/docs
// Lists all documents (lineages) in BIM360. Currently hard-coded.
router.get('/docs', function(req, res) {
    res.json(DOCUMENTS);
});

// Middleware for any endpoint under /v2/api/docs/:doc_id
// Finds the corresponding document record and stores it for any nested handlers.
router.use('/docs/:doc_id', function(req, res, next) {
    const doc = DOCUMENTS.find(doc => doc.id === req.params.doc_id);
    if (doc) {
        req._document = doc;
        next();
    } else {
        res.status(404).end();
    }
});

// GET /v2/api/docs/:doc_id
// Returns information about specific BIM360 document (lineage).
router.get('/docs/:doc_id', function(req, res) {
    res.json(req._document);
});

// Scene APIs

router.use('/docs/:doc_id/scenes', function(req, res, next) {
    req._arvr_client = new ARVRClient(TOOLKIT_API_HOST, req._access_token);
    next();
});

router.get('/docs/:doc_id/scenes', async function(req, res) {
    try {
        const scenes = await req._arvr_client.getScenes(req._document.tip.urn);
        res.json(scenes);
    } catch(err) {
        res.status(500).send(err);
    }
});

router.get('/docs/:doc_id/scenes/:scene_id', async function(req, res) {
    try {
        const scene = await req._arvr_client.getScene(req._document.tip.urn, req.params.scene_id);
        res.json(scene);
    } catch(err) {
        res.status(500).send(err);
    }
});

router.post('/docs/:doc_id/scenes', async function(req, res) {
    try {
        const { name, objects } = req.body;
        const response = await req._arvr_client.createScene(BIM360_DOCUMENT_VERSION_URN, name, BIM360_PROJECT_ID, objects);
        await req._arvr_client.processScene(BIM360_DOCUMENT_VERSION_URN, name);
        res.json(response);
    } catch(err) {
        res.status(500).send(err);
    }
});

// Issue APIs

router.use('/docs/:doc_id/issues', function(req, res, next) {
    req._bim360_client = new BIM360Client(FORGE_API_HOST, req._access_token);
    next();
});

router.get('/docs/:doc_id/issues', async function(req, res) {
    try {
        const issues = await req._bim360_client.getIssues(BIM360_CONTAINER_ID);
        res.json(issues.filter(issue => issue.attributes.status !== 'void').map(issue => {
            const { id, title, description, status, target_urn } = issue.attributes;
            let result = { id, title, description, status, target_urn };
            if (issue.attributes.pushpin_attributes) {
                const { type, location, object_id } = issue.attributes.pushpin_attributes;
                result.pushpin_type = type;
                result.pushpin_location = location;
                result.pushpin_object_id = object_id;
            }
            return result;
        }));
    } catch(err) {
        res.status(500).send(err);
    }
});

router.post('/docs/:doc_id/issues', async function(req, res) {
    const { title, description, status, issue_type, issue_subtype, object_id, x, y, z } = req.body;
    const urn = BIM360_DOCUMENT_LINEAGE_ID;
    const sheet_guid = BIM360_DOCUMENT_SHEET_GUID;
    try {
        const issue = await req._bim360_client.createIssue(
            BIM360_CONTAINER_ID, title, description, status,
            issue_type, issue_subtype, urn, sheet_guid, object_id,
            { x: parseFloat(x), y: parseFloat(y), z: parseFloat(z) }
        );
        res.json(issue);
    } catch(err) {
        res.status(500).send(err);
    }
});

router.get('/docs/:doc_id/issue-types', async function(req, res, next) {
    try {
        const client = new BIM360Client(FORGE_API_HOST, req._access_token);
        const issues = await client.getIssueTypes(BIM360_CONTAINER_ID);
        res.json(issues);
    } catch(err) {
        next(err);
    }
});

module.exports = router;