const { getPKPs } = require("./fetchPKP.js");
const { mintPKP } = require("./mintPKP.js");
const { getCreateDIDData } = require("./createDIDData.js");
const { Email } = require("./litCustomAuth/Providers/emailProvider.js");
const fs = require("fs");
const path = require("path");
//const loc = "/tmp/responses.csv"; //To be used when running through AWS Lambda
//const errPath = "/tmp/error.log"
const errPath = "./error.log"
const loc = './responses.csv'; //To be used when running locally (not recommended for a load over 100 total VUs)
const io = require("socket.io-client");
const { LitNodeClientNodeJs } = require("@lit-protocol/lit-node-client-nodejs");
const jose = require("jose");
const { relayerUrl } = require("./constant");
const { LitService } = require("./lit");

//const objectKey = 'responses.csv';
const logFilePath = path.join(__dirname, 'error_log.txt');
function writeResponse(url, statusCode, body) {
  const csvRow = `"${url}","${statusCode}","${JSON.stringify(body)}"\n`;
  fs.writeFileSync(loc, csvRow, { flag: "a" });
}

// function logErrorToFile(error, requestId) {
// //  const logFilePath = path.join(__dirname, 'error.log');
//   const logFilePath = errPath;
//   const timestamp = new Date().toISOString();
//   const errorMessage = `${requestId} - ${timestamp} - ${error.message} - ${error.stack}\n`;

//   fs.appendFile(logFilePath, errorMessage, (err) => {
//     if (err) {
//       console.error('Failed to write error to log file:', err);
//     }
//   });
// }

function logErrorToFile(url, statusCode, message, requestId) {
  const logMessage = `${new Date().toISOString()} | URL: ${url} | Status: ${statusCode} | Error: ${message} | Request ID: ${requestId}\n`;
  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) {
      console.error('Failed to write to log file', err);
    }
  });
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
      return done();
    }
    return done(new Error("Check DID not successful. Ending scenario."));
    // If successful, continue with the scenario
  },
  getRandomUsername: (context, events, done) => {
    const randomName = (Math.random() + 1).toString(36).substring(2);
    const randomNum = Math.floor(Math.random() * 1000000);
    context.vars.username = `load0x${randomName}${randomNum}`;
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
  getPKP: (context, events, done) => {
    try {
      const authMethod = {
        accessToken: context.vars.accessToken,
        authMethodType:
          "0xf8d39b7f3ec30f4bd2e45e0d545c83f64f8364a2c53765ca42ccf9bf7cde3482",
      };

      getPKPs(authMethod)
        .then((result) => {
          //console.log("result", result);
          if (result && result.length === 1) {
            context.vars.pkpData = result[0];
            return done();
          } else {
            return done(new Error("GET PKP not successful. PKP length not equal to 1"));
          }
        })
        .catch((error) => {
          return done(new Error("GET PKP not successful. Ending scenario."));
        });
    } catch (error) {
      return done(new Error("GET PKP not successful. Ending scenario."));
    }
  },
  generateSessionSig: async (context, events) => {
    try {
      console.log("generateSessionSig");
      const authMethod = {
        accessToken: context.vars.accessToken,
        authMethodType:
          "0xf8d39b7f3ec30f4bd2e45e0d545c83f64f8364a2c53765ca42ccf9bf7cde3482",
        // accessToken:
        //   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiMGIyNDIwYTctYzBmNy00YTlmLWFlN2UtMGMyODA5NDU3M2FjIiwiZW1haWwiOiJkNzRwMmIyNHpsQHNteWt3Yi5jb20iLCJpYXQiOjE3MjU3MTAxMDgsImV4cCI6MTcyNjMxNDkwOH0.k7oWdFfpVzvDS-psFXBYZGTIbJdbCUt-KuFOGFx_yr8",
        // userOauthId: "d74p2b24zl@smykwb.com",
        // userKey: "d74p2b24zl@smykwb.com",
      };
      const litService = new LitService();
    
      const { sessionSig } = await litService.generateSessionSig({ authMethod: authMethod, pubKey: context.vars.pkpData.publicKey });
      context.vars.sessionSig = sessionSig;
      return;
    } catch (err) {
      console.log(err.message);
      throw new Error("GenerateSessionSig not successful. Ending scenario.");
    }
  },
  getWrappedKeys: async (context, events) => {
    try {
      console.log("getWrappedKeys");
      const litService = new LitService();
      const { existingWrappedKeys: wrappedKeys } =
        await litService.getWrappedKeys({ sessionSig: context.vars.sessionSig });
      if (wrappedKeys.length === 2) {
        //console.log(wrappedKeys);
        return;
      } else {
        throw new Error("getWrappedKeys not successful. lenght not equal to 2");
      }
    } catch (err) {
      console.log(err);
      throw new Error("getWrappedKeys not successful. Ending scenario.");
    }
  },
  mintPKP: (context, events, done) => {
    // try {
    const authMethod = {
      accessToken: context.vars.accessToken,
      authMethodType:
        "0xf8d39b7f3ec30f4bd2e45e0d545c83f64f8364a2c53765ca42ccf9bf7cde3482",
      // accessToken:
      //   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiMGIyNDIwYTctYzBmNy00YTlmLWFlN2UtMGMyODA5NDU3M2FjIiwiZW1haWwiOiJkNzRwMmIyNHpsQHNteWt3Yi5jb20iLCJpYXQiOjE3MjU3MTAxMDgsImV4cCI6MTcyNjMxNDkwOH0.k7oWdFfpVzvDS-psFXBYZGTIbJdbCUt-KuFOGFx_yr8",
      // userOauthId: "d74p2b24zl@smykwb.com",
      // userKey: "d74p2b24zl@smykwb.com",
    };
    let queueId = context.vars.queueId;
    mintPKP(queueId, authMethod)
      .then((PKPData) => {
        context.vars.PKPData = PKPData;
        done();
      })
      .catch((error) => {
        console.log("Blocker ===== Processor Error", error);
        const requestUrl = error.config ? error.config.url : 'Unknown URL';
        const statusCode = error.response ? error.response.status : 'No status code';
        const errorMessage = error.message || 'Unknown error';
        const requestData = error.config && error.config.data ? error.config.data : 'No request data';
        // Log the error details
        logErrorToFile(requestUrl, statusCode, errorMessage, requestData);
        done(new Error(`"MINT PKP not successful. Ending scenario. ${error.message}`));
      });
  },
  getCreateDIDData: (context, events, done) => {
    // const litNodeClient = new LitNodeClientNodeJs({
    //   alertWhenUnauthorized: false,
    //   //litNetwork: "datil-test",
    //   rpcUrl:'https://rpc-chronicle-yellowstone-testnet-9qgmzfcohk.t.conduit.xyz/EQDCLvbyg7eqh3BD4Zh3wo9ySG2RSRkWZ',
    //   litNetwork: 'datil',
    //   debug: false,
    // });

    const authMethod = {
      accessToken: context.vars.accessToken,
      authMethodType:
        "0xf8d39b7f3ec30f4bd2e45e0d545c83f64f8364a2c53765ca42ccf9bf7cde3482",
    };
    const triaName = `${context.vars.username}@tria`;

    // litNodeClient.connect().then(() => {
    getCreateDIDData(
      triaName,
      context.vars.PKPData,
      authMethod,
      // litNodeClient
    )
      .then((DIDData) => {
        context.vars.DIDData = DIDData;
        done();
      })
      .catch((error) => {
        const requestUrl = error.config ? error.config.url : 'Unknown URL';
        const statusCode = error.response ? error.response.status : 'No status code';
        const errorMessage = error.message || 'Unknown error';
        let requestId = 'No requestId';
        if (error.config && error.config.data) {
          try {
            const requestData = JSON.parse(error.config.data); // Assuming the data is in JSON format
            requestId = requestData.requestId || 'No requestId'; // Extract requestId if available
          } catch (parseError) {
            console.error('Failed to parse request data', parseError);
          }
        }
        // Log the error details
        logErrorToFile(requestUrl, statusCode, errorMessage, requestId);
        // const res = Array.from(litNodeClient.getRequestIds());
        //const requestId = JSON.stringify(res[res.length - 1]);
        //logErrorToFile(error, requestId);
        done(new Error(error.message ?? "CreateDID Data not successful. Ending scenario."));
      });
    // })
    // .catch((error) => {
    //       const res = Array.from(litNodeClient.getRequestIds());
    //       const requestId = JSON.stringify(res[res.length - 1]);
    //       logErrorToFile(error, requestId);
    //       done(new Error("LITConnect not successful. Ending scenario."));
    //     });
  },
  captureResponse: (requestParams, response, context, ee, next) => {
    // console.log(response);
    const statusCode = response.statusCode;
    //    if (statusCode != 200) {
    const url = requestParams.url;
    const body = response.body;

    writeResponse(url, statusCode, body);
    //    }
    return next();
  },
  uploadToS3: async () => {
    if (fs.existsSync(loc)) {
      //    const workerId = context.awsRequestId;
      const workerId = Math.floor(Math.random() * 1000000);
      const objectKey = `error.log`;
      const fileContent = fs.readFileSync(errPath);

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
