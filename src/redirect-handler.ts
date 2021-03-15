import {CloudFrontRequest, CloudFrontRequestCallback, CloudFrontRequestEvent, Context} from 'aws-lambda';

const pointsToFile = uri => /\/[^/]+\.[^/]+$/.test(uri);
const hasTrailingSlash = uri => uri.endsWith('/');

export class RedirectHandler {
    private readonly request: CloudFrontRequest;
    private readonly eventType: "origin-request" | "origin-response" | "viewer-request" | "viewer-response";
    private readonly requestUri: string;

    constructor(private readonly event: CloudFrontRequestEvent,
                private readonly context: Context,
                private readonly callback: CloudFrontRequestCallback) {
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

    async handleRequest() {
        if (!pointsToFile(this.requestUri)) {
            // Append ".html" or "index.html"
            this.request.uri = `${this.requestUri}${hasTrailingSlash(this.requestUri) ? "index.html":".html"}`
        }

        return this.callback(null, this.request);
    }
}
