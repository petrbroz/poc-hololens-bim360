const express = require('express');

const BIM360Client = require('../helpers/forge/bim360');

const { FORGE_API_HOST, BIM360_CONTAINER_ID } = process.env;

let router = express.Router();

router.use(function(req, res, next) {
    const credentials = req.app.get('FORGE_3LEGGED_TOKEN');
    if (!credentials) {
        res.status(401).end();
        return;
    }
    req.access_token = credentials.access_token;
    next();
});

// GET /api/issue/types
// Provides list of all BIM360 issue types and subtypes.
router.get('/types', async function(req, res, next) {
    const client = new BIM360Client(FORGE_API_HOST, req.access_token);
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
    const client = new BIM360Client(FORGE_API_HOST, req.access_token);
    try {
        const issues = await client.getIssues(BIM360_CONTAINER_ID);
        res.json(issues.map(issue => {
            return {
                id: issue.id,
                title: issue.attributes.title,
                description: issue.attributes.description,
                status: issue.attributes.status,
                target_urn: issue.attributes.target_urn
            };
        }));
    } catch(err) {
        next(err);
    }
});

// POST /api/issue
// Creates new BIM360 issue.
router.post('/', async function(req, res, next) {
    const client = new BIM360Client(FORGE_API_HOST, req.access_token);
    const { title, description, status, issue_type, issue_subtype } = req.body;
    try {
        const issue = await client.createIssue(BIM360_CONTAINER_ID, title, description, status, issue_type, issue_subtype);
        res.json(issue);
    } catch(err) {
        next(err);
    }
});

module.exports = router;