//import { Email } from "./litCustomAuth/Providers/emailProvider.js";
//import { AuthMethodScope } from "@lit-protocol/constants";
const { Email } = require('./litCustomAuth/Providers/emailProvider.js');
const { AuthMethodScope } = require('@lit-protocol/constants');


const mintPKP = async (authMethod) => {
  try {
    const provider = new Email({ relayApiKey: "test-api-key", relayUrl: "https://7fd7-2401-4900-1c1a-42c3-f447-5b83-b646-87b.ngrok-free.app"});
    if (!provider) {
      throw new Error("Invalid Provider");
    }
    const options = {
      permittedAuthMethodScopes: [[AuthMethodScope.SignAnything]],
    };

    let txHash = await provider.mintPKPThroughRelayer(authMethod, options);
    const { status, pkpEthAddress, pkpPublicKey, pkpTokenId, error } =
      await provider.relay.pollRequestUntilTerminalState(txHash);
    if (status !== "Succeeded") {
      throw new Error("Minting failed");
    }

    if (!pkpEthAddress || !pkpPublicKey || !pkpTokenId) {
      throw new Error("Minting succecced, keys undefine");
    }
    const newPKP = {
      tokenId: pkpTokenId,
      publicKey: pkpPublicKey,
      ethAddress: pkpEthAddress,
    };
    return newPKP;
  } catch (err) {
    throw err;
  }
};

//const authMethod = {
//  accessToken:
//    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiNmM5OGE0NDktMDAxNi00OTczLWFiODctNTNjYmJmOTMxOGFhIiwiZW1haWwiOiJ4b2Rpcjk2NjUyQGh1dG92LmNvbSIsImlhdCI6MTcxNzU2NzAwNCwiZXhwIjoxNzE4MTcxODA0fQ.55qG5-iQGXzqDb-bLwg1CzHUAorvyizTlZZNrqtBaak",
//  authMethodType:
//    "0xf7d39b7f3ec30f4bd2e45e0d545c83f64f8364a2c53765ca42ccf9bf7cde3482",
//};
//
//const mintedPKP = await mintPKP(authMethod);
//console.log(mintedPKP);

module.exports = {mintPKP}