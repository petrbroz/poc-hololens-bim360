const options = {
	getAccessToken: function(callback) {
		fetch('/api/auth/2-legged/token')
		    .then((response) => response.json())
		    .then((json) => callback(json.access_token, json.expires_in));
	}
};

let app = null;

Autodesk.Viewing.Initializer(options, async () => {
    app = new Autodesk.Viewing.ViewingApplication('viewer');
    app.registerViewer(app.k3D, Autodesk.Viewing.Private.GuiViewer3D);

    // If the server already has a 3-legged token cached, show all the UI in the sidebar,
    // otherwise prompt the user to sign in
    const response = await fetch('/api/auth/3-legged/token');
    if (response.status === 200) {
        document.querySelector('#sidebar-header > button').innerHTML = 'Logout';
        document.querySelector('#sidebar-header > button').addEventListener('click', function() { window.location.href = '/api/auth/3-legged/logout'; });
        fetch('/api/model')
            .then(response => response.json())
            .then(urns => {
                const modelsSelect = document.getElementById('models');
                modelsSelect.innerHTML = urns.map(urn => `<option value="${urn}">${urn}</option>`).join('');
                modelsSelect.addEventListener('change', function(ev) { loadModel(modelsSelect.value); });
                loadModel(modelsSelect.value);
            });
    } else if (response.status === 404) {
        document.querySelector('#sidebar-header > button').innerHTML = 'Login';
        document.querySelector('#sidebar-header > button').addEventListener('click', function() { window.location.href = '/api/auth/3-legged/login'; });
        document.getElementById('sidebar-controls').style.setProperty('display', 'none');
    }
});

function loadModel(urn) {
    return new Promise(function(resolve, reject) {
        function onDocumentLoadSuccess() {
            const viewables = app.bubble.search({'type':'geometry'});
            if (viewables.length > 0) {
                app.selectItem(viewables[0].data, onItemLoadSuccess, onItemLoadFailure);
                updateSidebarUI();
            }
        }
        function onDocumentLoadFailure() { reject('Could not load document'); }
        function onItemLoadSuccess() { resolve(); }
        function onItemLoadFailure() { reject('Could not load model'); }
        app.loadDocument('urn:' + urn, onDocumentLoadSuccess, onDocumentLoadFailure);
    });
}

function updateSidebarUI() {
    // Populate the sidebar UI
    // fetch('/api/auth/2-legged/token')
    //     .then(resp => resp.status < 400 ? resp.json() : { access_token: '' })
    //     .then(credentials => document.getElementById('token-2legs').value = credentials.access_token);
    // fetch('/api/auth/3-legged/token')
    //     .then(resp => resp.status < 400 ? resp.json() : { access_token: '' })
    //     .then(credentials => document.getElementById('token-3legs').value = credentials.access_token);
    fetch('/api/scene')
        .then(resp => resp.status < 400 ? resp.json() : [])
        .then(scenes => {
            document.getElementById('scenes').innerHTML = scenes.map(scene => `<option value="${scene}">${scene}</option>`).join('');
            function selectSceneGeometry() {
                const scene = document.getElementById('scenes').value;
                fetch('/api/scene/' + scene)
                    .then(resp => resp.status < 400 ? resp.json() : { list: [] })
                    .then(scene => {
                        const viewer = app.getCurrentViewer();
                        viewer.select(scene.list);
                        viewer.fitToView(scene.list);
                    });
            }
            document.getElementById('scenes').addEventListener('change', selectSceneGeometry);
            selectSceneGeometry();
        });
    fetch('/api/issue')
        .then(resp => resp.status < 400 ? resp.json() : [])
        .then(issues => document.getElementById('issues').innerHTML = issues.map(issue => `<option value="${issue.id}">${issue.title}</option>`).join(''));
    fetch('/api/issue/types')
        .then(resp => resp.status < 400 ? resp.json() : [])
        .then(types => {
            document.getElementById('issue-types').innerHTML = types.map(type => `<option value="${type.id}">${type.title}</option>`).join('');
            function updateSubtypes() {
                const issueTypeID = document.getElementById('issue-types').value;
                const issueType = types.find(t => t.id === issueTypeID);
                const subtypes = issueType ? issueType.subtypes : [];
                document.getElementById('issue-subtypes').innerHTML = subtypes.map(type => `<option value="${type.id}">${type.title}</option>`).join('');
            }
            document.getElementById('issue-types').addEventListener('change', updateSubtypes);
            updateSubtypes();
        });

    // Add UI for making a request to the server to create new issue
    document.getElementById('issue-create').addEventListener('click', function() {
        const viewer = app.getCurrentViewer();
        const selection = viewer.getSelection();
        const issue = {
            title: document.getElementById('issue-title').value,
            description: document.getElementById('issue-description').value,
            status: document.getElementById('issue-status').value,
            issue_type: document.getElementById('issue-types').value,
            issue_subtype: document.getElementById('issue-subtypes').value,
            object_id: selection.length > 0 ? selection[0] : null,
            x: 1.0, y: 2.0, z: 3.0
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(issue)
        };
        fetch('/api/issue', options)
            .then(resp => resp.json())
            .then(issue => console.log(issue));
    });
}