const { getPKPs } = require('./fetchPKP.js');
const { mintPKP } = require('./mintPKP.js');
const { getCreateDIDData } = require('./createDIDData.js');
const { Email } = require('./litCustomAuth/Providers/emailProvider.js');
//const AWS = require('aws-sdk');
const fs = require('fs');
const path = '/tmp/responses.csv';

//const s3 = new AWS.S3();
//const bucketName = 'artilleryio-test-data-741878071414-us-west-1';
//const objectKey = 'responses.csv';

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
  getPKP: async (context, events, done) => {
    const authMethod = {
      accessToken: context.vars.accessToken,
      authMethodType: "0xf7d39b7f3ec30f4bd2e45e0d545c83f64f8364a2c53765ca42ccf9bf7cde3482",
    };
    await getPKPs(authMethod);
    return true;
  },
  mintPKP: async (context, events, done) => {
    const authMethod = {
      accessToken: context.vars.accessToken,
      authMethodType: "0xf7d39b7f3ec30f4bd2e45e0d545c83f64f8364a2c53765ca42ccf9bf7cde3482",
    };
    context.vars.PKPData = await mintPKP(authMethod);
    return true;
  },
  getCreateDIDData: async (context, events, done) => {
    const authMethod = {
      accessToken: context.vars.accessToken,
      authMethodType: "0xf7d39b7f3ec30f4bd2e45e0d545c83f64f8364a2c53765ca42ccf9bf7cde3482",
    };
    const triaName = `${context.vars.username}@tria`;
    context.vars.DIDData = await getCreateDIDData(triaName, context.vars.PKPData, authMethod);
    return true;
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
//  uploadToS3: async () => {
//    const fileContent = fs.readFileSync(path);
//
//    const params = {
//      Bucket: bucketName,
//      Key: objectKey,
//      Body: fileContent,
//    };
//
//    try {
//      await s3.upload(params).promise();
//      console.log(`File uploaded successfully at https://${bucketName}.s3.us-west-1.amazonaws.com//${objectKey}`);
//    } catch (err) {
//      console.error('Error uploading file to S3:', err);
//    }
//  }
};
