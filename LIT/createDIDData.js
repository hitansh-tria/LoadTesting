//import { signMessage } from "./signPKP";
const { signMessage } = require('./signPKP');


const getCreateDIDData = async (triaName, pkpData, authMethod) => {
  try {
    const evmAddress = pkpData.ethAddress;
    const evmMessage = {
      address: evmAddress,
      timestamp: new Date().getTime(),
    };

    const { signature } = await signMessage(
      pkpData.publicKey,
      JSON.stringify(evmMessage),
      authMethod
    );

    const evmChainData = {
      address: evmAddress,
      message: evmMessage,
      signature,
    };
    const args = {
      did: triaName,
      evmChainData: evmChainData,
      nonEvmChainsData: [],
      accessToken: authMethod.accessToken,
      fromClientId: "e95a0ebc4cf97fdda343b471f47410e4:d3f4a2522ba2b408da4d897da4da2c75b0fb6ac216300e9b10a0ccdd2de8adc090ea129b2e3d031dd76bac4f0368edc5f737af62faac99c9348de855ec5c222be396c12d461225ed8e3c765e918b41e9bed51d0f49db82a3cd8eefa66ddf90e639ace441a59f:3e7bbf7393422b16beeaa530c2860a3b"
    };
    console.log(args)
    return args;
  } catch (err) {
    throw err;
  }
};

module.exports= {getCreateDIDData}