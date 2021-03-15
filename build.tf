resource "null_resource" "build_src" {
  provisioner "local-exec" {
    command = <<EOT
      rm -Rf ${local.lambda_layer_src_libs_zip}

      cd libs-layer
      ./build.sh
      cd -
    EOT
    //    working_dir = local.lambda_layer_src
  }

  triggers = {
    run_now = uuid()
  }
}
