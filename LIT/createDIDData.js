const { api } = require("@lit-protocol/wrapped-keys");
const ethers = require("ethers");
const {generatePrivateKey, signMessageWithEncryptedKey} = api;
const {getSessionSigForLitAction} = require("./utils/utils");


const getCreateDIDData = async (triaName, pkpData, authMethod, litNodeClient) => {
  try {
    console.log("getCreateDIDData...");
    const sessionSig = await getSessionSigForLitAction({
      authMethod: authMethod,
      litNodeClient: litNodeClient,
      pkp: pkpData,
    });
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
    const signature = await signMessageWithEncryptedKey({
      pkpSessionSigs: sessionSig,
      network: 'evm',
      messageToSign:  JSON.stringify(evmMessage),
      litNodeClient: litNodeClient,
      id: id
    });
    console.log("signature", signature);
    //const recoverAddress = ethers.utils.verifyMessage(signature, JSON.stringify(evmMessage));

    // if(recoverAddress !== wrappedEthAddress) {
    //   throw new Error('recoverAddress is not equal to wrappedEthAddress');
    // }
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
      //Prod Client ID
//      fromClientId: "124311390b11c9a6a83eb06d98b22cdf:be8390e8b496cf4ee27e27be61112ac1e5fa081fd55eb628e0c85cae70b162ff574188399be40177b91bfe71340b50844896b11eec08b0e90eeae1ef435ea1634da78c8021e248555148dc067c4aea90f3ccb3fc795dc7df384e60ad6194a755ca57ff536fb5:676698a6c04c086f2b6bec068023ddd9"
      //Staging Client ID
      fromClientId: "4b6ee1ce04a7f7231e09a81c0826bf3b:03331a356587a5b0a96176bba4deb3b951ad9e2dd7d009e29ecc01d1a0256e6fa0cdb1e2a00f2279fc361cfa37039f0fb9b402dc01d7a26b471fb52f2a0223677189256e7a2115aea2217eff8d9b965ee0eafc55d3b5ce3e1ea434f557fa69c4039cc51c770d:252f7ae04e39f8d39980b4acf4887935"
    };
    console.log("args",args);
    return args;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

module.exports= {getCreateDIDData}