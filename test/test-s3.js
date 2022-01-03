require("../src/s3-root")()
    .then(rs => console.log(rs))
    .catch(e => console.error(e === require("../src/no-ops-error")));
