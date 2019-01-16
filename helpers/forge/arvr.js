const request = require('request');

/**
 * Client providing access to some of the endpoints of AR/VR Toolkit.
 */
class ARVRClient {
    /**
     * Creates new client.
     * @param {string} toolkitBaseUrl Base URL for calls to the toolkit endpoints.
     * @param {string} accessToken 3-legged token for calls to the toolkit endpoints.
     */
    constructor(toolkitBaseUrl, accessToken) {
        this.toolkitBaseUrl = toolkitBaseUrl;
        this.accessToken = accessToken;
    }

    /**
     * Returns list of all scenes available for given urn.
     * @param {string} urn Model urn.
     * @returns {Promise<object[]>} Promise that resolves into a list of objects representing individual issue types.
     */
    getScenes(urn) {
        const options = {
            url: `${this.toolkitBaseUrl}/arkit/v1/${urn}/scenes`,
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json'
            }
        };
        return new Promise(function (resolve, reject) {
            request(options, function(err, resp, body) {
                if (err) {
                    reject(err);
                } else if (resp.statusCode >= 400) {
                    reject(body);
                } else {
                    const response = JSON.parse(body);
                    resolve(response);
                }
            });
        });
    }

    /**
     * Returns specific scene for given urn.
     * @param {string} urn Model urn.
     * @param {string} scene Scene ID.
     * @returns {Promise<object>} Promise that resolves into a an object with scene info.
     */
    getScene(urn, scene) {
        const options = {
            url: `${this.toolkitBaseUrl}/arkit/v1/${urn}/scenes/${scene}`,
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json'
            }
        };
        return new Promise(function (resolve, reject) {
            request(options, function(err, resp, body) {
                if (err) {
                    reject(err);
                } else if (resp.statusCode >= 400) {
                    reject(body);
                } else {
                    const response = JSON.parse(body);
                    resolve(response);
                }
            });
        });
    }
}

module.exports = ARVRClient;