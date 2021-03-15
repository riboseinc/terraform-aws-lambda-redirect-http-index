import {RedirectHandler} from "./redirect-handler";
import {CloudFrontRequestCallback, CloudFrontRequestEvent, CloudFrontRequestHandler, Context} from 'aws-lambda';

exports.handler = async (event: CloudFrontRequestEvent, context: Context, callback: CloudFrontRequestCallback) => {
    if (event.Records[0].cf.config.eventType.endsWith('response')) {
        return callback("Not support for Response Event", null);
    }

    const redirect = new RedirectHandler(event, context, callback);
    return redirect.handleRequest();
};
