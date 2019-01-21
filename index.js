const path = require('path');
const express = require('express');

const ENV_VARS = [
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
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// custom routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/model', require('./routes/model'));
app.use('/api/scene', require('./routes/scene'));
app.use('/api/issue', require('./routes/issue'));

const port = process.env.PORT || 3000;
app.listen(port, () => { console.log(`Server listening on port ${port}`); });