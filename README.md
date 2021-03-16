# terraform-aws-lambda-redirect-http-index
Lambda@Edge function that redirects HTTP path to index.html

### Production Setup

To support [zero](https://github.com/riboseinc/terraform-aws-s3-cloudfront-website/issues/30) downtime deployment,
required env as bellow
- `BUCKET_NAME` (optional): bucket name to set CSV Config File
- `BUCKET_CONFIG_KEY` (optional): csv config bucket object, sample as bellow
```csv
lastUpdatedTimestamp,rootDir
1615877411,dir1
1615875912,dir2
```
