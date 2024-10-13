const fs = require('fs');
const { api, config } = require("@lit-protocol/wrapped-keys");
const { litActionRepository } = require("@lit-protocol/wrapped-keys-lit-actions");
const ethers = require("ethers");
const { generatePrivateKey, signMessageWithEncryptedKey } = api;
const { getSessionSigForLitAction } = require("./utils/utils");
const { LitService } = require("./lit");

const logExecutionTime = (label, startTime) => {
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000; // Convert to seconds
  const logMessage = `${label} took ${duration.toFixed(3)} seconds\n`; // Log with 3 decimal places
  console.log(logMessage); // Log to console

  // Append the log to a file
  fs.appendFileSync('execution_time.log', logMessage, (err) => {
    if (err) {
      console.error('Failed to write to log file:', err);
    }
  });
};

const getCreateDIDData = async (triaName, pkpData, authMethod, litNodeClient) => {
  try {
    console.log("getCreateDIDData...");

    const litService = new LitService();
    
    // <---this--->
    const startTime1 = Date.now(); // Start time measurement
    const { sessionSig } = await litService.generateSessionSig({ authMethod: authMethod, pubKey: pkpData.publicKey });
    logExecutionTime('generateSessionSig', startTime1); // Log execution time

    let wrappedKeySupportedChain = ["evm", "solana"];
    
    // <---this--->
    const startTime2 = Date.now(); // Start time measurement
    const evmMessage = {
      address: "This sign for create DID",
      timestamp: new Date().getTime(),
    };
    const {generatedPublicKey, evmSignature} = await litService.bathcGenerateWrappedKeys({sessionSig, message: evmMessage});
    console.log({generatedPublicKey, evmSignature});
    // const { generatedWrappedKeys } = await litService.generateWrappedKeys({ chains: wrappedKeySupportedChain, sessionSig });
    logExecutionTime('generateWrappedKeys', startTime2); // Log execution time

    // console.log("generatedWrappedKeys", generatedWrappedKeys);
    // const network = "evm";
    // let wrappedKey = generatedWrappedKeys.filter(
    //   (wrappedKey) => wrappedKey.network === network
    // );
    // console.log("wrappedKey", wrappedKey);
    
    // const wrappedEthAddress = await ethers.utils.computeAddress(wrappedKey[0].generatedPublicKey);
    const wrappedEthAddress = await ethers.utils.computeAddress(generatedPublicKey);
    const evmAddress = wrappedEthAddress;
    // const evmMessage = {
    //   address: evmAddress,
    //   timestamp: new Date().getTime(),
    // };
    
    // <---this--->
    // const startTime3 = Date.now(); // Start time measurement
    // const evmsignaturePromise = litService.signMessageWithWrappedKey({
    //   message: JSON.stringify(evmMessage),
    //   network: 'evm',
    //   wrappedKeyId: wrappedKey[0].id,
    //   sessionSig
    // });
    // const solanaSignaturePromise = litService.signMessageWithWrappedKey({
    //   message: JSON.stringify(evmMessage),
    //   network: 'solana',
    //   wrappedKeyId: generatedWrappedKeys[1].id,
    //   sessionSig
    // });
    // const [evmsignature, solanaSignature] = await Promise.all([evmsignaturePromise]);
    // logExecutionTime('signMessageWithWrappedKey', startTime3); // Log execution time

    // console.log("signature", evmsignature);
    
    const evmChainData = {
      address: evmAddress,
      message: evmMessage,
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

module.exports = { getCreateDIDData };
