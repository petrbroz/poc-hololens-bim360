const express = require('express');

// For now, we just use a single hard-coded model URN.
const MODELS = [process.env.BIM360_MODEL_URN];

let router = express.Router();

// GET /api/model
// Returns list of all BIM360 models.
router.get('/', function(req, res, next) {
    res.json(MODELS);
});

module.exports = router;