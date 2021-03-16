'use strict';

const pointsToFile = uri => /\/[^/]+\.[^/]+$/.test(uri);
const hasTrailingSlash = uri => uri.endsWith('/');
const needsTrailingSlash = uri => !pointsToFile(uri) && !hasTrailingSlash(uri);

exports.handler = async (event, context, callback) => {
    // Extract the request from the CloudFront event that is sent to Lambda@Edge
    const request = event.Records[0].cf.request;

    // Extract the URI and query string from the request
    const olduri = request.uri;
    const qs = request.querystring;

    // If needed, redirect to the same URI with trailing slash, keeping query string
    if (needsTrailingSlash(olduri)) {
        return callback(null, {
            body: '',
            status: '302',
            statusDescription: 'Moved Temporarily',
            headers: {
                location: [{
                    key: 'Location',
                    value: qs ? `${olduri}/?${qs}` : `${olduri}/`,
                }],
            }
        });
    }

    // Match any '/' that occurs at the end of a URI, replace it with a default index
    const newuri = olduri.replace(/\/$/, '\/index.html');

    // Useful for test runs
    // console.log("Old URI: " + olduri);
    // console.log("New URI: " + newuri);

    // Replace the received URI with the URI that includes the index page
    request.uri = newuri;

    try {
        const rootDir = require('./s3-root')();

    }
    catch (e) {
        if (e === require('./no-ops-error')) {
            console.log(e);
        }
        else {
            return callback(`error ${e.message}`, request);
        }
    }


    // Return to CloudFront
    return callback(null, request);
};
