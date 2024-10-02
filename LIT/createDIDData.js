const { api, config } = require("@lit-protocol/wrapped-keys");
const { litActionRepository } = require("@lit-protocol/wrapped-keys-lit-actions");
const ethers = require("ethers");
const {generatePrivateKey, signMessageWithEncryptedKey} = api;
const {getSessionSigForLitAction} = require("./utils/utils");
const {LitService} = require("./lit");
//config.setLitActionsCode(litActionRepository);

const getCreateDIDData = async (triaName, pkpData, authMethod, litNodeClient) => {
  try {
    console.log("getCreateDIDData...");
    // const sessionSig = await getSessionSigForLitAction({
    //   authMethod: authMethod,
    //   litNodeClient: litNodeClient,
    //   pkp: pkpData,
    // });
    const litService = new LitService();
    const {sessionSig} = await litService.generateSessionSig({authMethod: authMethod, pubKey: pkpData.publicKey});

    // const promise1 = generatePrivateKey({
    //   pkpSessionSigs: sessionSig,
    //   network: 'evm',
    //   litNodeClient: litNodeClient,
    //   memo: Math.floor(1000000000 + Math.random() * 9000000000).toString()
    // });
    // const promise2 = generatePrivateKey({
    //   pkpSessionSigs: sessionSig,
    //   network: 'solana',
    //   litNodeClient: litNodeClient,
    //   memo: Math.floor(1000000000 + Math.random() * 9000000000).toString()
    // });
    let wrappedKeySupportedChain = ["evm", "solana"];
    const {generatedWrappedKeys} = await litService.generateWrappedKeys({chains: wrappedKeySupportedChain, sessionSig});
    console.log("generatedWrappedKeys", generatedWrappedKeys);
    const network = "evm";
    let wrappedKey = generatedWrappedKeys.filter(
      (wrappedKey) => wrappedKey.network === network
    );
    console.log("wrappedKey", wrappedKey);
    // const [{id: evmId, generatedPublicKey, pkpAddress}, {id:solanaId}] = await Promise.all([promise1, promise2]);
    const wrappedEthAddress = await ethers.utils.computeAddress(wrappedKey[0].generatedPublicKey);
    // if(pkpAddress !== pkpData.ethAddress) {
    //   throw new Error('pkpAddress is not equal to ethAddress');
    // }
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
    const evmsignaturePromise = litService.signMessageWithWrappedKey({
      message: JSON.stringify(evmMessage),
      network: 'evm',
      wrappedKeyId: wrappedKey[0].id,
      sessionSig
    });
    // const evmsignaturePromise = signMessageWithEncryptedKey({
    //   pkpSessionSigs: sessionSig,
    //   network: 'evm',
    //   messageToSign:  JSON.stringify(evmMessage),
    //   litNodeClient: litNodeClient,
    //   id: evmId
    // });
    const solanaSignaturePromise = litService.signMessageWithWrappedKey({
      message: JSON.stringify(evmMessage),
      network: 'solana',
      wrappedKeyId: generatedWrappedKeys[1].id,
      sessionSig
    });
    // const solanaSignaturePromise = signMessageWithEncryptedKey({
    //   pkpSessionSigs: sessionSig,
    //   network: 'solana',
    //   messageToSign:  JSON.stringify(evmMessage),
    //   litNodeClient: litNodeClient,
    //   id: solanaId
    // });
    const [evmsignature, solanaSignature] = await Promise.all([evmsignaturePromise, solanaSignaturePromise])
    console.log("signature", evmsignature);
    //const recoverAddress = ethers.utils.verifyMessage(evmsignature, JSON.stringify(evmMessage));

    // if(recoverAddress !== wrappedEthAddress) {
    //   throw new Error('recoverAddress is not equal to wrappedEthAddress');
    // }
    const evmChainData = {
      address: evmAddress,
      message: evmMessage,
      signature:evmsignature.signature,
    };

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
    console.log(err);
    throw err;
  }
};

module.exports= {getCreateDIDData}