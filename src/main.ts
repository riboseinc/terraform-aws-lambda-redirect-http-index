import {Redirect} from "./redirect";
import {CloudFrontRequestCallback, CloudFrontRequestEvent, CloudFrontRequestHandler, Context} from 'aws-lambda';

exports.handler = async (event: CloudFrontRequestEvent, context: Context, callback: CloudFrontRequestCallback) => {
    if (event.Records[0].cf.config.eventType.endsWith('response')) {
        return callback("Not support for Response Event", null);
    }

    new Redirect(event, context, callback);
    return null;
};
