import {
    CloudFrontRequest,
    CloudFrontRequestCallback,
    CloudFrontRequestEvent,
    CloudFrontResponseCallback,
    CloudFrontResponseEvent,
    Context
} from 'aws-lambda';
import {CloudFrontResponse} from "aws-lambda/common/cloudfront";

const pointsToFile = uri => /\/[^/]+\.[^/]+$/.test(uri);
const hasTrailingSlash = uri => uri.endsWith('/');

export class Redirect {
    readonly request: CloudFrontRequest;
    readonly eventType: "origin-request" | "origin-response" | "viewer-request" | "viewer-response";
    readonly requestUri: string;
    // private response: CloudFrontResponse;

    constructor(readonly event: CloudFrontRequestEvent, readonly context: Context, readonly callback: CloudFrontRequestCallback) {
        const cf = event.Records[0].cf;
        this.request = cf.request;
        // this.response = cf.response;
        this.eventType = cf.config.eventType;
        this.callback = callback;

        // const cookies = this.request.headers.cookie || [];
        // this.cookie = cookies.find(c => c.value.startsWith(CookieName)) || {};

        // this.cookie = this.request.headers.cookie;
        this.requestUri = this.request.uri;
    }

    async toHtml() {
        if (!pointsToFile(this.requestUri)) {
            // Append ".html" or "index.html"
            this.request.uri = `${this.requestUri}${hasTrailingSlash(this.requestUri) ? "index.html":".html"}`
        }

        return this.callback(null, this.request);
    }
}
