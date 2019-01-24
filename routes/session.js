const express = require('express');
var qrcode = require('qrcode');

let router = express.Router();

// GET /api/session/:id
// Provides information for a specific session ID.
router.get('/:id', function(req, res) {
    const { id } = req.params;
    req.sessionStore.get(id, function(err, session) {
        if (session) {
            res.json({
                id: id,
                host: process.env.SERVER_URL,
                access_token: session.token && session.token.access_token
            });
        } else {
            res.status(404).end();
        }
    });
});

module.exports = router;