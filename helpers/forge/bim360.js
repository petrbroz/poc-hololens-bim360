const request = require('request');

/**
 * Client providing access to some of the features of BIM360 API
 * that are not supported by the official forge-apis yet.
 */
class BIM360Client {
    /**
     * Creates new client.
     * @param {string} forgeBaseUrl Base URL for calls to Forge endpoints.
     * @param {string} accessToken 3-legged token for calls to Forge endpoints.
     */
    constructor(forgeBaseUrl, accessToken) {
        this.forgeBaseUrl = forgeBaseUrl;
        this.accessToken = accessToken;
    }

    /**
     * Returns list of all BIM360 issue types and subtypes for specific issue container.
     * @param {string} containerId BIM360 issue container ID.
     * @returns {Promise<object[]>} Promise that resolves into a list of objects representing individual issue types.
     */
    getIssueTypes(containerId) {
        const options = {
            url: `${this.forgeBaseUrl}/issues/v1/containers/${containerId}/ng-issue-types?include=subtypes`,
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/vnd.api+json'
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
                    resolve(response.results);
                }
            });
        });
    }

    /**
     * Returns list of all BIM360 issues in a specific issue container.
     * @param {string} containerId BIM360 issue container ID.
     * @returns {Promise<object[]>} Promise that resolves into a list of objects representing individual issues.
     */
    getIssues(containerId) {
        const options = {
            url: `${this.forgeBaseUrl}/issues/v1/containers/${containerId}/quality-issues`,
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/vnd.api+json'
            }
        };
        return new Promise(function (resolve, reject) {
            request(options, function(err, resp, body) {
                if (err) {
                    reject(err);
                } else if (resp.statusCode >= 400) {
                    reject(body);
                } else {
                    const issues = JSON.parse(body);
                    resolve(issues.data);
                }
            });
        });
    }

    /**
     * Creates a new BIM360 issue.
     * @param {string} containerId BIM360 issue container ID.
     * @param {string} title Issue title.
     * @param {string} description Issue description.
     * @param {string} status Issue status.
     * @param {string} issueType Issue type ID, one of the IDs returned by {@see getIssueTypes}.
     * @param {string} issueSubtype Issue subtype ID, one of the nested IDs returned by {@see getIssueTypes}.
     * @returns {Promise<object>} Promise that resolves into a an object describing the new issue.
     */
    createIssue(containerId, title, description, status, issueType, issueSubtype) {
        const options = {
            url: `${this.forgeBaseUrl}/issues/v1/containers/${containerId}/quality-issues`,
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/vnd.api+json'
            },
            body: JSON.stringify({
                data: {
                    type: 'quality_issues',
                    attributes: {
                        title: title,
                        description: description,
                        //due_date: '2019-08-31T11:30:51.000Z',
                        status: status,
                        //"assigned_to": "W8WMNXPNCDPL",
                        //"assigned_to_type": "user",
                        //"owner": "W8WMNXPNCDPL",
                        ng_issue_subtype_id: issueSubtype,
                        ng_issue_type_id: issueType,
                        //"root_cause_id": "a51e89ad-119b-41bc-b74a-56fe66406492",
                        //"starting_version": "1",
                        //"location_description": "Kitchen"
                    }
                }
            })
        };
        return new Promise(function (resolve, reject) {
            request(options, function(err, resp, body) {
                if (err) {
                    reject(err);
                } else if (resp.statusCode >= 400) {
                    reject(body);
                } else {
                    const response = JSON.parse(body);
                    resolve(response.data);
                }
            });
        });
    }
}

module.exports = BIM360Client;