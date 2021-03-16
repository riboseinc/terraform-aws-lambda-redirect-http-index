const AWS = require('aws-sdk');

// const params = {
//     Bucket: "isoreg-backup",
//     MaxKeys: 2
// };

// /* To create reference point for writing SQL queries, you can display the first 5 records of input data by running the following SQL query: SELECT * FROM s3object s LIMIT 5 */
// SELECT s.rootDir FROM s3object s WHERE cast(s.lastUpdatedTimestamp as int) = 1615877411
//
// /*SELECT MAX(cast(s.lastUpdatedTimestamp as int)) FROM s3object s*/

// const query = 'SELECT * FROM s3object[*].results[*] r;';
const bucket = 'isoreg-backup';
const key = 'test.csv';
const SelectMaxTimestamp = `SELECT MAX(cast(lastUpdatedTimestamp as int))
                            FROM s3object`;
const SelectRootDirByTimestamp = (lastTimestamp) => {
    return `SELECT s.rootDir FROM s3object s WHERE cast(s.lastUpdatedTimestamp as int) = ${lastTimestamp}`
}

const params = (sql) => {
    return {
        Bucket: bucket,
        Key: key,
        ExpressionType: 'SQL',
        Expression: sql,
        InputSerialization: {
            CSV: {
                FileHeaderInfo: 'USE',
                RecordDelimiter: '\n',
                FieldDelimiter: ','
            }
        },
        OutputSerialization: {
            JSON: {
                RecordDelimiter: ",",
            }
        }
    }
}

const s3 = new AWS.S3();

// return one record
const parseS3QueryStream = async (data, fieldName) => {
    return new Promise((resolve, reject) => {
        const recordBuffer = []
        data.Payload
            .on('data', (event) => {
                if (event.Records && event.Records.Payload) {
                    recordBuffer.push(event.Records.Payload);
                }
            })
            .on('error', (err) => {
                console.error(err);
                reject(err);
            })
            .on('end', () => {
                let recordString = Buffer.concat(recordBuffer).toString();
                recordString = recordString.replace(/,$/, '');
                recordString = `[${recordString}]`;
                try {
                    const records = JSON.parse(recordString);
                    if (records.length > 1) {
                        return reject(new Error(`Received ${records.length} records, expect Query return only ONE line`));
                    } else if (records.length === 0) {
                        return resolve("");
                    }

                    fieldName = fieldName || '_1'; //default csv fieldName output
                    resolve(records[0][fieldName]);
                } catch (e) {
                    reject(new Error(`Unable to convert S3 data to JSON object. S3 Select Query: ${params.Expression}`));
                }
            });
    });
}

s3.selectObjectContent(params(SelectMaxTimestamp)).promise()
    .then(data => parseS3QueryStream(data))
    .then(timestamp => s3.selectObjectContent(params(SelectRootDirByTimestamp(timestamp))).promise())
    .then(data => parseS3QueryStream(data, 'rootDir'))
    .then(rootDir => console.log(rootDir))
    .catch(e => {
        console.error(e);
    });

// s3.listObjects(params).promise()
//     .then(result =>{
//         console.log(result);
//     })
//     .catch(e => console.error(e));
