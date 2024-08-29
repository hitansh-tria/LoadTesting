//import { Email } from "./litCustomAuth/Providers/emailProvider.js";
//import { AuthMethodScope } from "@lit-protocol/constants";
const { Email } = require('./litCustomAuth/Providers/emailProvider.js');
const { AuthMethodScope } = require('@lit-protocol/constants');
const io = require('socket.io-client');
const { relayerUrl} = require("./constant");
const {ethers} = require("ethers");
const {pullTxHashByQueueId} = require("./utils/utils");


const mintPKP = async (authMethod, socket) => {
  try {
    console.log(authMethod);
    const provider = new Email({ relayApiKey: "test-api-key", relayUrl: relayerUrl});
    const ethersProvider = new ethers.providers.JsonRpcProvider("https://yellowstone-rpc.litprotocol.com/");
    if (!provider) {
      throw new Error("Invalid Provider");
    }
    const options = {
      permittedAuthMethodScopes: [[AuthMethodScope.SignAnything]],
    };

    let {queueId, uuid} = await provider.mintPKPThroughRelayer(authMethod, options);
    //const { txHash: requestId, queueId: queueIdFromSockets } = await waitForSocketResponse(socket,queueId);
    const { txHash: requestId, queueId: mintPKPqueueIdFromSockets } =
        await pullTxHashByQueueId(queueId);
    // if(queueId !== queueIdFromSockets) {
    //   throw new Error("Minting succecced, keys undefine");
    // }
    const {
      //@ts-ignore
      queueId: delegateTxQueueId,
      status,
      pkpEthAddress,
      pkpPublicKey,
      pkpTokenId,
      error,
    } = await provider.relay.pollRequestUntilTerminalState(
      requestId,
      uuid
    );
    if (status !== "Succeeded") {
      throw new Error("Minting failed");
    }

    const { txHash: delegateTxHash, queueId: queueIdFromSockets } =
    await pullTxHashByQueueId(delegateTxQueueId);
    console.log("txHash", delegateTxHash);
    const receipt = await ethersProvider.waitForTransaction(delegateTxHash, 1);
    if (receipt && receipt.confirmations >= 1) {
      console.log(`Transaction confirmed in block number: ${receipt.blockNumber}`);
    } else {
      console.log('Transaction not confirmed yet.');
    }

    if (!pkpEthAddress || !pkpPublicKey || !pkpTokenId) {
      throw new Error("Minting succecced, keys undefine");
    }
    const newPKP = {
      tokenId: pkpTokenId,
      publicKey: pkpPublicKey,
      ethAddress: pkpEthAddress,
    };
    console.log(newPKP);
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
    setTimeout(async () => {
      socket.off('transactionComplete');
      try {
        console.log("pullTxHashByQueueId");
        const data = await pullTxHashByQueueId(queueId);
        if(!data) {
          throw new Error(`No response received pullTxHashByQueueId ${queueId}`);
        }
        resolve(data);
      } catch (error) {
        reject(error);
      }
    }, 5000);
  });
};

//const authMethod = {
//  accessToken:
//    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiNmM5OGE0NDktMDAxNi00OTczLWFiODctNTNjYmJmOTMxOGFhIiwiZW1haWwiOiJ4b2Rpcjk2NjUyQGh1dG92LmNvbSIsImlhdCI6MTcxNzU2NzAwNCwiZXhwIjoxNzE4MTcxODA0fQ.55qG5-iQGXzqDb-bLwg1CzHUAorvyizTlZZNrqtBaak",
//  authMethodType:
//    "0xf8d39b7f3ec30f4bd2e45e0d545c83f64f8364a2c53765ca42ccf9bf7cde3482",
//};
//
//const mintedPKP = await mintPKP(authMethod);
//console.log(mintedPKP);

module.exports = {mintPKP}