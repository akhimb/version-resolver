const https = require('https');
const versionRegex = /^(20\d{2})\.(\d{1,3})\.(\d{1,3})$/;
const versionResolverUri = 'https://my-json-server.typicode.com/typicode/demo/posts/1';

exports.handler = async (event, context) => {
    try {
        // Get the API key and clientId from the event object or any other source
        const request = event.Records[0].cf.request;

        // Get the API key, clientId, and acceptVersion from the request headers
        const apiKey = request.headers['x-api-key'][0].value;
        const clientId = request.headers['client-id'][0].value;
        const acceptVersion = request.headers['accept-version'][0].value;

        // Check if apiKey, clientId, and acceptVersion headers are missing
        if (!apiKey || !clientId || !acceptVersion) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    error: 'Required headers are missing.',
                }),
            };
        }

        // Check if clientId and x-api-key headers are missing
        if (!apiKey) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    error: 'x-api-key is missing.',
                }),
            };
        }

        if (!clientId) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    error: 'client-id is missing.',
                }),
            };
        }

        // Validate the accept-version using the regex
        if (!versionRegex.test(acceptVersion)) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    error: 'accept-version format is invalid.',
                }),
            };
        }

        // Construct the headers and query parameters
        const headers = {
            'x-api-key': apiKey,
        };

        const queryParams = `clientId=${clientId}`;

        // Construct the URL for the 'version' endpoint
        const url = versionResolverUri + `?${queryParams}`;

        // Make the GET request using the 'https' module
        const response = await new Promise((resolve, reject) => {
            const req = https.get(url, { headers }, (res) => {
                let data = '';
                res.on('data', chunk => {
                    data += chunk;
                });
                res.on('end', () => {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: data,
                    });
                });
            });

            req.on('error', reject);
        });

        // Extract the version string from the response
        const responseData = JSON.parse(response.body);
        const version = responseData.version;
        // Update the request URL by replacing the 'api' part with the new version
        request.uri = request.uri.replace('/api', '/' + version + '/api');
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'An error occurred',
            }),
        };
    }
};
