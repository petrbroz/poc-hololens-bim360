const express = require('express');
var qrcode = require('qrcode');

let router = express.Router();

// GET /api/config?sid=<session_id>
// Provides session info, either based on a session ID passed in the query,
// or based on a session ID retrieved from cookies.
router.get('/', function(req, res) {
    function respond(id, session) {
        if (session) {
            res.json({
                id: id,
                access_token: session.token && session.token.access_token,
                bim360_container_id: process.env['BIM360_CONTAINER_ID'],
                bim360_document_lineage_id: process.env['BIM360_DOCUMENT_LINEAGE_ID'],
                bim360_document_version_urn: process.env['BIM360_DOCUMENT_VERSION_URN'],
                bim360_document_sheet_guid: process.env['BIM360_DOCUMENT_SHEET_GUID']
            });
        } else {
            res.status(404).end();
        }
    }

    if (req.query.sid) {
        req.sessionStore.get(req.query.sid, function(_, session) {
            respond(req.query.sid, session);
        });
    } else {
        respond(req.session.id, req.session);
    }
});

// GET /api/config/code.png
// Returns a PNG image with QR code encoding a URL
// for accessing info of whatever session is in cookies.
router.get('/code.png', function(req, res) {
    const { SERVER_URL } = process.env;
    qrcode.toFileStream(res, `${SERVER_URL}/api/config?sid=${req.session.id}`);
});

module.exports = router;