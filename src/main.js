'use strict';

const pointsToFile = uri => /\/[^/]+\.[^/]+$/.test(uri);
const hasTrailingSlash = uri => uri.endsWith('/');
const needsTrailingSlash = uri => !pointsToFile(uri) && !hasTrailingSlash(uri);

exports.handler = async (event, context, callback) => {
    // Extract the request from the CloudFront event that is sent to Lambda@Edge
    const request = event.Records[0].cf.request;

    // Extract the URI and query string from the request
    let olduri = request.uri;

    // redirect to rootDir
    // zero downtime deployment, https://github.com/riboseinc/terraform-aws-s3-cloudfront-website/issues/30
    const rootDir = await require('./s3-root')();

    const qs = request.querystring;

    // If needed, redirect to the same URI with trailing slash, keeping query string
    if (needsTrailingSlash(olduri)) {

        //override rootDir
        if (!olduri.startsWith(rootDir)) {
            olduri = rootDir + olduri;
        }

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
    let newuri = olduri.replace(/\/$/, '\/index.html');
    if (!newuri.startsWith(rootDir)) {
        newuri = rootDir + newuri;
    }

    // Useful for test runs
    console.log("Old URI: " + olduri);
    console.log("New URI: " + newuri);

    // Replace the received URI with the URI that includes the index page
    request.uri = newuri;

    // Return to CloudFront
    return callback(null, request);
};
