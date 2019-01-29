let app = null;

// Make a GET request to API endpoints on the demo server
async function _get(url) {
    const token = document.getElementById('access-token').value;
    const response = await fetch(url, { headers: { 'Authorization': 'Bearer ' + token } });
    const result = response.status < 300 ? await response.json() : null;
    return result;
}

// Make a POST request to API endpoints on the demo server
async function _post(url, body) {
    const token = document.getElementById('access-token').value;
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(body)
    };
    const response = await fetch(url, options);
    const result = response.status < 300 ? await response.json() : null;
    return result;
}

const options = {
	getAccessToken: function(callback) {
		fetch('/v2/api/auth/token')
		    .then((response) => response.json())
		    .then((json) => callback(json.access_token, json.expires_in));
	}
};

Autodesk.Viewing.Initializer(options, async () => {
    app = new Autodesk.Viewing.ViewingApplication('viewer');
    app.registerViewer(app.k3D, Autodesk.Viewing.Private.GuiViewer3D);

    const access_token = document.getElementById('access-token').value;
    if (access_token) {
        initializeSidebarUI();
    }
});

function initializeSidebarUI() {
    // Populate dropdowns with models, scenes, and issues
    updateModelsUI();

    document.getElementById('models').addEventListener('change', onModelChanged);
    document.getElementById('scenes').addEventListener('change', onSceneChanged);
    document.getElementById('issue-types').addEventListener('change', onIssueTypeChanged);

    // Add UI for making a request to the server to create new scene
    document.getElementById('scene-create').addEventListener('click', async function() {
        const modelSelect = document.getElementById('models');
        const model = modelSelect._data[modelSelect.selectedIndex];
        const viewer = app.getCurrentViewer();
        const selection = viewer.getSelection();
        const params = {
            name: document.getElementById('scene-title').value,
            objects: selection
        };
        const scene = await _post(`/v2/api/docs/${model.id}/scenes`, params);
        console.log('Created new scene', scene);
    });

    // Add UI for making a request to the server to create new issue
    document.getElementById('issue-create').addEventListener('click', async function() {
        const modelSelect = document.getElementById('models');
        const model = modelSelect._data[modelSelect.selectedIndex];
        const viewer = app.getCurrentViewer();
        const selection = viewer.getSelection();
        const params = {
            title: document.getElementById('issue-title').value,
            description: document.getElementById('issue-description').value,
            status: document.getElementById('issue-status').value,
            issue_type: document.getElementById('issue-types').value,
            issue_subtype: document.getElementById('issue-subtypes').value,
            object_id: selection.length > 0 ? selection[0] : null,
            x: 1.0, y: 2.0, z: 3.0
        };
        const issue = await _post(`/v2/api/docs/${model.id}/issues`, params);
        console.log('Created new issue', issue);
    });
}

async function updateModelsUI() {
    const modelSelect = document.getElementById('models');
    const models = await _get('/v2/api/docs');
    modelSelect.innerHTML = models.map(model => `<option value="${model.id}">${model.id}</option>`).join('');
    modelSelect._data = models;
    onModelChanged();
}

async function onModelChanged() {
    const modelSelect = document.getElementById('models');
    const model = modelSelect._data[modelSelect.selectedIndex];
    updateScenesUI(model.id);
    updateIssuesUI(model.id);
    loadModel(model.tip.urn);
}

async function updateScenesUI(id) {
    const scenes = await _get(`/v2/api/docs/${id}/scenes`);
    if (scenes) {
        const sceneSelect = document.getElementById('scenes');
        sceneSelect.innerHTML = scenes.map(scene => `<option value="${scene}">${scene}</option>`).join('');
        sceneSelect._data = scenes;
        onSceneChanged();
    }
}

async function onSceneChanged() {
    const modelSelect = document.getElementById('models');
    const model = modelSelect._data[modelSelect.selectedIndex];
    const scene = await _get(`/v2/api/docs/${model.id}/scenes/${document.getElementById('scenes').value}`);
    if (scene) {
        const viewer = app.getCurrentViewer();
        viewer.select(scene.list);
        viewer.fitToView(scene.list);
    }
}

async function updateIssuesUI(id) {
    const issueSelect = document.getElementById('issues');
    const issues = await _get(`/v2/api/docs/${id}/issues`);
    issueSelect.innerHTML = issues.map(issue => `<option value="${issue.id}">${issue.title}</option>`).join('');
    issueSelect._data = issues;

    const issueTypeSelect = document.getElementById('issue-types');
    const types = await _get(`/v2/api/docs/${id}/issue-types`);
    issueTypeSelect.innerHTML = types.map(type => `<option value="${type.id}">${type.title}</option>`).join('');
    issueTypeSelect._data = types;
    onIssueTypeChanged();
}

function onIssueTypeChanged() {
    const issueTypeSelect = document.getElementById('issue-types');
    const issueType = issueTypeSelect._data[issueTypeSelect.selectedIndex];
    const subtypes = issueType ? issueType.subtypes : [];
    document.getElementById('issue-subtypes').innerHTML = subtypes.map(type => `<option value="${type.id}">${type.title}</option>`).join('');
}

function loadModel(urn) {
    return new Promise(function(resolve, reject) {
        function onDocumentLoadSuccess() {
            const viewables = app.bubble.search({'type':'geometry'});
            if (viewables.length > 0) {
                app.selectItem(viewables[0].data, onItemLoadSuccess, onItemLoadFailure);
            }
        }
        function onDocumentLoadFailure() { reject('Could not load document'); }
        function onItemLoadSuccess() { resolve(); }
        function onItemLoadFailure() { reject('Could not load model'); }
        app.loadDocument('urn:' + urn, onDocumentLoadSuccess, onDocumentLoadFailure);
    });
}