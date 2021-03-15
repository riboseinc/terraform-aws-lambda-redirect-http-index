locals {
  src = "${path.module}/src"
  mainjs = "${local.src}/dist/main.js"
}

resource "aws_cloudwatch_log_group" "this" {
  name = "/aws/lambda/${var.name}"
  retention_in_days = 7
}

data "archive_file" "this" {
  type        = "zip"
  output_path = "${path.module}/.archive.zip"
  source_file  = local.mainjs
}

resource "aws_lambda_function" "this" {
  depends_on = [
    data.archive_file.this
  ]

  description = "Redirect function"
  role        = aws_iam_role.this.arn
  runtime     = "nodejs12.x"

  filename         = data.archive_file.this.output_path
  source_code_hash = data.archive_file.this.output_base64sha256

  function_name = var.name
  handler       = "main.handler"

  timeout     = var.fn_timeout
  memory_size = var.fn_memory_size
  publish     = true
}

