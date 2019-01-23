const express = require('express');

const BIM360Client = require('../helpers/forge/bim360');

const { FORGE_API_HOST, BIM360_CONTAINER_ID } = process.env;
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

// GET /api/issue/types
// Provides list of all BIM360 issue types and subtypes.
router.get('/types', async function(req, res, next) {
    const client = new BIM360Client(FORGE_API_HOST, req.session.token.access_token);
    try {
        const issues = await client.getIssueTypes(BIM360_CONTAINER_ID);
        res.json(issues);
    } catch(err) {
        next(err);
    }
});

// GET /api/issue
// Provides list of all BIM360 issues.
router.get('/', async function(req, res, next) {
    const client = new BIM360Client(FORGE_API_HOST, req.session.token.access_token);
    try {
        const issues = await client.getIssues(BIM360_CONTAINER_ID);
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
        next(err);
    }
});

// POST /api/issue
// Creates new BIM360 issue.
router.post('/', async function(req, res, next) {
    const client = new BIM360Client(FORGE_API_HOST, req.session.token.access_token);
    const { title, description, status, issue_type, issue_subtype, object_id, x, y, z } = req.body;
    const urn = process.env.BIM360_DOCUMENT_LINEAGE_ID;
    const sheet_guid = process.env.BIM360_DOCUMENT_SHEET_GUID;
    try {
        const issue = await client.createIssue(
            BIM360_CONTAINER_ID, title, description, status,
            issue_type, issue_subtype, urn, sheet_guid, object_id,
            { x: parseFloat(x), y: parseFloat(y), z: parseFloat(z) }
        );
        res.json(issue);
    } catch(err) {
        next(err);
    }
});

module.exports = router;