import {suite, test, timeout} from 'mocha-typescript';
import {expect} from 'chai';


@suite(timeout(10000))
export class TestMain {

    @test('should list s3 objects')
    async testListS3() {
        const s3ls = require("s3-ls");

        const lister = s3ls({ bucket: "isoreg-backup" });

        const { files, folders } = await lister.ls("dir1");
        console.log(files);
        console.log(folders);
    }
}
