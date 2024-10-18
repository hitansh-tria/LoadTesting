//import { Email } from "./litCustomAuth/Providers/emailProvider.js";
const { Email } = require('./litCustomAuth/Providers/emailProvider');
const { relayerUrl} = require("./constant");

const getPKPs = async (authMethod) => {
  try {
    const provider = new Email({ relayApiKey: "test-api-key", relayUrl: relayerUrl});
    const allPKPs = await provider.fetchPKPsThroughRelayer(authMethod);
    return allPKPs;
  } catch (err) {
    console.log(err)
    throw err;
  }
};

module.exports = {getPKPs}

//const authMethod = {
//  accessToken:
//    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiNmM5OGE0NDktMDAxNi00OTczLWFiODctNTNjYmJmOTMxOGFhIiwiZW1haWwiOiJ4b2Rpcjk2NjUyQGh1dG92LmNvbSIsImlhdCI6MTcxNzU2NzAwNCwiZXhwIjoxNzE4MTcxODA0fQ.55qG5-iQGXzqDb-bLwg1CzHUAorvyizTlZZNrqtBaak",
//  authMethodType:
//    "0xf8d39b7f3ec30f4bd2e45e0d545c83f64f8364a2c53765ca42ccf9bf7cde3482",
//};
