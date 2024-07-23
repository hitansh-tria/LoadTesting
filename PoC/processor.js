const AWS = require('aws-sdk');
const fs = require('fs');
const path = '/tmp/responses.csv';

const s3 = new AWS.S3();
const bucketName = 'artilleryio-test-data-741878071414-us-west-1';
const objectKey = 'responses.csv';

function writeResponse(url, statusCode, body) {
  const csvRow = `"${url}","${statusCode}","${JSON.stringify(body)}"\n`;
  fs.writeFileSync(path, csvRow, { flag: 'a' });
}

module.exports = {
  getRandomUsername: (context, events, done) => {
    const randomName = (Math.random() + 1).toString(36).substring(2);
    const randomNum = Math.floor(Math.random() * 1000000);
    context.vars.username = `${randomName}${randomNum}`;
    return done();
  },

  addFromClientID: (context, events, done) => {
    context.vars.createDIDData.fromClientId = context.vars.fromClientId;
//    context.vars.createDIDData = JSON.stringify(context.vars.createDIDData)
    return done();
  },

  captureResponse: (requestParams, response, context, ee, next) => {
    const statusCode = response.statusCode;
    if (statusCode != 200) {
      const url = requestParams.url;
      const body = response.body;

      writeResponse(url, statusCode, body);
    }
    return next();
  },
  uploadToS3: async () => {
    const fileContent = fs.readFileSync(path);

    const params = {
      Bucket: bucketName,
      Key: objectKey,
      Body: fileContent,
    };

    try {
      await s3.upload(params).promise();
      console.log(`File uploaded successfully at https://${bucketName}.s3.us-west-1.amazonaws.com//${objectKey}`);
    } catch (err) {
      console.error('Error uploading file to S3:', err);
    }
  }
};
