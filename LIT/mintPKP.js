//import { Email } from "./litCustomAuth/Providers/emailProvider.js";
//import { AuthMethodScope } from "@lit-protocol/constants";
const { Email } = require('./litCustomAuth/Providers/emailProvider.js');
const { AuthMethodScope } = require('@lit-protocol/constants');
const io = require('socket.io-client');



const mintPKP = async (authMethod, socket) => {
  try {
    const provider = new Email({ relayApiKey: "test-api-key", relayUrl: "https://datil-dev-relayer.tria.so"});
    if (!provider) {
      throw new Error("Invalid Provider");
    }
    const options = {
      permittedAuthMethodScopes: [[AuthMethodScope.SignAnything]],
    };

    let {queueId, uuid} = await provider.mintPKPThroughRelayer(authMethod, options);
    const { requestId, queueId: queueIdFromSockets } = await waitForSocketResponse(socket);
    if(queueId !== queueIdFromSockets) {
      throw new Error("Minting succecced, keys undefine");
    }
    const { queueId: delegateTxQueueId, status, pkpEthAddress, pkpPublicKey, pkpTokenId, error } =
      await provider.relay.pollRequestUntilTerminalState(requestId, uuid);
    if (status !== "Succeeded") {
      throw new Error("Minting failed");
    }

    await waitForSocketResponse(socket, delegateTxQueueId);

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


const waitForSocketResponse = (socket, queueId) => {
  return new Promise((resolve, reject) => {
    socket.on('transactionComplete', (data) => {
      console.log("transactionComplete", data);
      socket.off('transactionComplete'); // Remove the event listener after receiving the response
      resolve(data);

    });
    // Timeout after 35 seconds if no response is received
    setTimeout(() => {
      socket.off('transactionComplete');
      reject(new Error('No response from socket within 35 seconds'));
    }, 35000);
  });
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