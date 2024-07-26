//import { signMessage } from "./signPKP";
const { signMessage } = require('./signPKP');
const { api } = require("@lit-protocol/wrapped-keys");
const ethers = require("ethers");
const {generatePrivateKey, signMessageWithEncryptedKey} = api;
const {getSessionSigForLitAction} = require("./utils/utils");


const getCreateDIDData = async (triaName, pkpData, authMethod, litNodeClient) => {
  try {
    console.log("1");
    const sessionSig = await getSessionSigForLitAction({
      authMethod: authMethod,
      litNodeClient: litNodeClient,
      pkp: pkpData,
    });
    console.log("2");
    const { pkpAddress, generatedPublicKey, id} = await generatePrivateKey({
      pkpSessionSigs: sessionSig,
      network: 'evm',
      litNodeClient: litNodeClient,
      memo: Math.floor(1000000000 + Math.random() * 9000000000).toString()
    });
    const wrappedEthAddress = await ethers.utils.computeAddress(generatedPublicKey);
    if(pkpAddress !== pkpData.ethAddress) {
      throw new Error('pkpAddress is not equal to ethAddress');
    }
    const evmAddress = wrappedEthAddress;
    const evmMessage = {
      address: evmAddress,
      timestamp: new Date().getTime(),
    };
    // const { signature } = await signMessage(
      //   pkpData.publicKey,
      //   JSON.stringify(evmMessage),
    //   authMethod
    // );
    console.log("3");
    const signature = await signMessageWithEncryptedKey({
      pkpSessionSigs: sessionSig,
      network: 'evm',
      messageToSign:  JSON.stringify(evmMessage),
      litNodeClient: litNodeClient,
      id: id
    });
    console.log("signature", signature);
    console.log("4");
    //const recoverAddress = ethers.utils.verifyMessage(signature, JSON.stringify(evmMessage));
    console.log("5");
    
    // if(recoverAddress !== wrappedEthAddress) {
    //   throw new Error('recoverAddress is not equal to wrappedEthAddress');
    // }
    console.log("6");
    const evmChainData = {
      address: evmAddress,
      message: evmMessage,
      signature,
    };
    console.log("7");

    const args = {
      did: triaName,
      evmChainData: evmChainData,
      nonEvmChainsData: [],
      accessToken: authMethod.accessToken,
      fromClientId: "e95a0ebc4cf97fdda343b471f47410e4:d3f4a2522ba2b408da4d897da4da2c75b0fb6ac216300e9b10a0ccdd2de8adc090ea129b2e3d031dd76bac4f0368edc5f737af62faac99c9348de855ec5c222be396c12d461225ed8e3c765e918b41e9bed51d0f49db82a3cd8eefa66ddf90e639ace441a59f:3e7bbf7393422b16beeaa530c2860a3b"
    };
    console.log("args",args);
    return args;
  } catch (err) {
    throw err;
  }
};

module.exports= {getCreateDIDData}