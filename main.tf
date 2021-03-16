resource "aws_cloudwatch_log_group" "this" {
  name = "/aws/lambda/${var.name}"
  retention_in_days = 7
}

data "archive_file" "this" {
  type = "zip"
  output_path = "${path.module}/.archive.zip"
  //  source_file  = "${path.module}/src/main.js"
  source_dir = "${path.module}/src"
}

resource "aws_lambda_function" "this" {
  depends_on = [
    data.archive_file.this
  ]

  description = "terraform-aws-lambda-redirect-http-index"
  role = aws_iam_role.this.arn
  runtime = "nodejs12.x"

  filename = data.archive_file.this.output_path
  source_code_hash = data.archive_file.this.output_base64sha256

  function_name = var.name
  handler = "main.handler"

  timeout = var.fn_timeout
  memory_size = var.fn_memory_size
  publish = true

  environment {
    BUCKET_NAME = var.bucket_name
    BUCKET_CONFIG_KEY = var.bucket_config_key
  }
}

