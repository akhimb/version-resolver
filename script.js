const https = require('https');

Begin();

async function Begin()
{
    const version = await getVersion();
    console.log("Version is : ", version);
}

exports.handler = async (event, context) => {
    try {
        // Get the API key and clientId from the event object or any other source
        const version = await getVersion();

        // Construct the new URL by appending the version before the 'api' part
        const currentUrl = event.headers['Host'] + event.path;
        const apiIndex = currentUrl.indexOf('/api');
        const newUrl = currentUrl.slice(0, apiIndex) + '/' + version + currentUrl.slice(apiIndex);

        return {
            statusCode: 200,
            body: JSON.stringify({
                newUrl: newUrl,
            }),
        };
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

async function getVersion() {
    const apiKey = 'YOUR_API_KEY';
    const clientId = 'YOUR_CLIENT_ID';
    const versionResolverUri = 'https://my-json-server.typicode.com/akhimb/version-resolver';

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
    const version = responseData.acceptVersion;
    return version;
}

