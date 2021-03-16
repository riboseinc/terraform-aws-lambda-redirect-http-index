const AWS = require('aws-sdk');

const bucket = process.env.BUCKET_NAME || 'isoreg-backup';
const key = process.env.BUCKET_CSV_CONFIG_KEY || 'test.csv';

// language=SQL format=false
const SelectMaxTimestamp = `SELECT MAX(cast(lastUpdatedTimestamp as int)) FROM s3object`;
const SelectRootDirByTimestamp = (lastTimestamp) => {
    return `SELECT rootDir FROM s3object s WHERE cast(lastUpdatedTimestamp as int) = ${lastTimestamp}`
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

module.exports = async () => {
    const s3 = new AWS.S3();
    return new Promise((resolve, reject) => {
        s3.selectObjectContent(params(SelectMaxTimestamp)).promise()
            .then(data => parseS3QueryStream(data))
            .then(timestamp => s3.selectObjectContent(params(SelectRootDirByTimestamp(timestamp))).promise())
            .then(data => parseS3QueryStream(data, 'rootDir'))
            .then(rootDir => resolve(rootDir))
            .catch(e => {
                console.error(e);
                reject(e);
            });
    });
}




