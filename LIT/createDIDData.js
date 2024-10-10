const {api} = require("@lit-protocol/wrapped-keys");
const ethers = require("ethers");
const {batchGeneratePrivateKeys} = api;
const {getSessionSigForLitAction} = require("./utils/utils");

const getCreateDIDData = async (triaName, pkpData, authMethod, litNodeClient) => {
  try {
    console.log("getCreateDIDData...");
    const pkpSessionSigs = await getSessionSigForLitAction({
      authMethod: authMethod,
      litNodeClient: litNodeClient,
      pkp: pkpData,
    });

    // generateKeyParams: { memo: string };
    // signMessageParams?: { messageToSign: string | Uint8Array };

    function getMemo() {
      return Math.floor(1000000000 + Math.random() * 9000000000).toString()
    }

    const message = {message: 'Message to sign', timestamp: new Date().getTime()};
    const {results: [evmResult, solanaResult]} = await batchGeneratePrivateKeys({
      pkpSessionSigs,
      litNodeClient,
      actions: [
        {
          network: 'evm',
          generateKeyParams: {memo: getMemo()},
          signMessageParams: {messageToSign: JSON.stringify(message)}
        },
        {
          network: 'solana',
          generateKeyParams: {memo: getMemo()},
          signMessageParams: {messageToSign: JSON.stringify(message)}
        }
      ]
    });

    console.log('evmResult', evmResult);
    console.log('solanaResult', solanaResult);

    const {
      generateEncryptedPrivateKey: {
        generatedPublicKey,
        id: evmId,
        pkpAddress,
      },
      signMessage: {signature: evmSignature}
    } = evmResult
    const {
      generateEncryptedPrivateKey: {generatedPublicKey: {id: solanaId}},
      signMessage: {signature: solanaSignature}
    } = solanaResult;

    const wrappedEthAddress = await ethers.utils.computeAddress(generatedPublicKey);
    if (pkpAddress !== pkpData.ethAddress) {
      throw new Error('pkpAddress is not equal to ethAddress');
    }
    const evmAddress = wrappedEthAddress;

    console.log("signatures", {evmSignature, solanaSignature});
    console.log("ids", {evmId, solanaId});
    const recoverAddress = ethers.utils.verifyMessage(JSON.stringify(message), evmSignature);

    if(recoverAddress !== wrappedEthAddress) {
      throw new Error('recoverAddress is not equal to wrappedEthAddress');
    }
    const evmChainData = {
      address: evmAddress,
      message,
      signature: evmSignature,
    };

    const args = {
      did: triaName,
      evmChainData: evmChainData,
      nonEvmChainsData: [],
      accessToken: authMethod.accessToken,
      fromClientId: "e95a0ebc4cf97fdda343b471f47410e4:d3f4a2522ba2b408da4d897da4da2c75b0fb6ac216300e9b10a0ccdd2de8adc090ea129b2e3d031dd76bac4f0368edc5f737af62faac99c9348de855ec5c222be396c12d461225ed8e3c765e918b41e9bed51d0f49db82a3cd8eefa66ddf90e639ace441a59f:3e7bbf7393422b16beeaa530c2860a3b"
    };
    console.log("args", args);
    return args;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

module.exports = {getCreateDIDData}