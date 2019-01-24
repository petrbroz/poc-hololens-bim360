const path = require('path');
const express = require('express');
const session = require('express-session');
const qrcode = require('qrcode');

const ENV_VARS = [
    'SERVER_URL',
    'FORGE_CLIENT_ID',
    'FORGE_CLIENT_SECRET',
    'REDIRECT_URL',
    'FORGE_API_HOST',
    'TOOLKIT_API_HOST',
    'BIM360_CONTAINER_ID',
    'BIM360_DOCUMENT_LINEAGE_ID',
    'BIM360_DOCUMENT_VERSION_URN',
    'BIM360_DOCUMENT_SHEET_GUID'
];

const MISSING_ENV_VARS = ENV_VARS.filter(envvar => !process.env.hasOwnProperty(envvar));
if (MISSING_ENV_VARS.length > 0) {
    console.warn('Missing env. variables:', MISSING_ENV_VARS.join(','));
    return;
}

let app = express();

// middleware setup
app.use(session({ secret: 'HoloLensRocks', cookie: { maxAge: 60 * 60 * 1000 }}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// generate QR code to a URL where the HoloLens app can obtain configuration data
app.get('/code.png', function(req, res) {
    const { SERVER_URL } = process.env;
    qrcode.toFileStream(res, `${SERVER_URL}/api/session/${req.session.id}`);
});

// custom routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/model', require('./routes/model'));
app.use('/api/scene', require('./routes/scene'));
app.use('/api/issue', require('./routes/issue'));
app.use('/api/session', require('./routes/session'));

const port = process.env.PORT || 3000;
app.listen(port, () => { console.log(`Server listening on port ${port}`); });