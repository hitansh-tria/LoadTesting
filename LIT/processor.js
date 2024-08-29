const { getPKPs } = require("./fetchPKP.js");
const { mintPKP } = require("./mintPKP.js");
const { getCreateDIDData } = require("./createDIDData.js");
const { Email } = require("./litCustomAuth/Providers/emailProvider.js");
const AWS = require("aws-sdk");
const fs = require("fs");
const path = "/tmp/responses.csv"; //To be used when running through AWS Lambda
//const path = './responses.csv'; //To be used when running locally (not recommended for a load over 100 total VUs)
const io = require("socket.io-client");
const { LitNodeClientNodeJs } = require("@lit-protocol/lit-node-client-nodejs");
const jose = require("jose");
const { relayerUrl } = require("./constant");

const s3 = new AWS.S3();
const bucketName = "artilleryio-test-data-741878071414-us-west-1";
//const objectKey = 'responses.csv';

function writeResponse(url, statusCode, body) {
  const csvRow = `"${url}","${statusCode}","${JSON.stringify(body)}"\n`;
  fs.writeFileSync(path, csvRow, { flag: "a" });
}

module.exports = {
  checkInitiateOTPSuccessAndContinue(context, events, done) {
    if (!context.vars.initiateOTPSuccess) {
      // If initiate OTP was not successful, end the scenario
      return done(
        new Error("Initiate OTP was not successful. Ending scenario.")
      );
    }
    // If successful, continue with the scenario
    return done();
  },
  checkAccessTokenAndContinue(context, events, done) {
    if (!context.vars.accessToken) {
      // If accessToken is not present, end the scenario
      return done(new Error("Access Token not found. Ending scenario."));
    }
    // If accessToken is present, continue with the scenario
    return done();
  },
  checkAvailabilityStatusSuccessAndContinue(context, events, done) {
    if (context.vars.availabilityStatus) {
      // If initiate OTP was not successful, end the scenario
      return done(new Error("Check DID not successful. Ending scenario."));
    }
    // If successful, continue with the scenario
    return done();
  },
  getRandomUsername: (context, events, done) => {
    const randomName = (Math.random() + 1).toString(36).substring(2);
    const randomNum = Math.floor(Math.random() * 1000000);
    context.vars.username = `${randomName}${randomNum}`;
    return done();
  },
  connectSocket: function (context, events, done) {
    const accessToken = context.vars.accessToken;
    const decodedPayload = jose.decodeJwt(accessToken);

    // Create a new socket instance for each user and store it in the context
    context.vars.socket = io(relayerUrl);

    context.vars.socket.on("connect", () => {
      console.log("Socket connected");
      console.log("uuid", decodedPayload.uuid);
      context.vars.socket.emit("register", decodedPayload.uuid);
    });

    context.vars.socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    // Additional socket event listeners can be added here

    done();
  },
  getPKP: async (context, events, done) => {
    try {
      const authMethod = {
        accessToken: context.vars.accessToken,
        authMethodType:
          "0xf8d39b7f3ec30f4bd2e45e0d545c83f64f8364a2c53765ca42ccf9bf7cde3482",
      };
      await getPKPs(authMethod);
      return done();
    } catch (error) {
      return done(new Error("GET PKP not successful. Ending scenario."));
    }
  },
  mintPKP: async (context, events, done) => {
    try {
      const authMethod = {
        accessToken: context.vars.accessToken,
        authMethodType:
          "0xf8d39b7f3ec30f4bd2e45e0d545c83f64f8364a2c53765ca42ccf9bf7cde3482",
      };
      context.vars.PKPData = await mintPKP(authMethod);
      //    context.vars.PKPData = await mintPKP(authMethod, context.vars.socket);
      return done();
    } catch (error) {
      return done(new Error("Mint PKP not successful. Ending scenario."));
    }
  },
  getCreateDIDData: async (context, events, done) => {
    try {
      const litNodeClient = new LitNodeClientNodeJs({
        alertWhenUnauthorized: false,
        litNetwork: "datil-test",
        // litNetwork: 'datil',
        debug: false,
      });

      await litNodeClient.connect();
      const authMethod = {
        accessToken: context.vars.accessToken,
        authMethodType:
          "0xf8d39b7f3ec30f4bd2e45e0d545c83f64f8364a2c53765ca42ccf9bf7cde3482",
      };
      const triaName = `${context.vars.username}@tria`;
      context.vars.DIDData = await getCreateDIDData(
        triaName,
        context.vars.PKPData,
        authMethod,
        litNodeClient
      );
      context.previousRequestSucceeded = false;
      return done();
    } catch (err) {
      return done(new Error("CreateDID Data not successful. Ending scenario."));
    }
  },
  captureResponse: (requestParams, response, context, ee, next) => {
    const statusCode = response.statusCode;
    //    if (statusCode != 200) {
    const url = requestParams.url;
    const body = response.body;

    writeResponse(url, statusCode, body);
    //    }
    return next();
  },
  uploadToS3: async () => {
    if (fs.existsSync(path)) {
      //    const workerId = context.awsRequestId;
      const workerId = Math.floor(Math.random() * 1000000);
      const objectKey = `data_${workerId}.csv`;
      const fileContent = fs.readFileSync(path);

      const params = {
        Bucket: bucketName,
        Key: objectKey,
        Body: fileContent,
      };

      try {
        await s3.upload(params).promise();
        console.log(
          `File uploaded successfully at https://${bucketName}.s3.us-west-1.amazonaws.com//${objectKey}`
        );
      } catch (err) {
        console.error("Error uploading file to S3:", err);
      }
    }
  },
};
