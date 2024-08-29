const { LitAbility, LitActionResource, LitPKPResource } = require("@lit-protocol/auth-helpers");

const { customAuthLAIPFS, customAuthLAIPFSBse64Code } = require("./constants");
const { relayerUrl } = require("./../constant");
const axios = require("axios");

const getSessionSigForLitAction = async ({litNodeClient, authMethod, pkp, delegateAuthSig}) => {
    const IPFSID = customAuthLAIPFS;
    const litActionSessionSigs = await litNodeClient.getLitActionSessionSigs({
        pkpPublicKey: pkp.publicKey,
        resourceAbilityRequests: [
          {
            resource: new LitPKPResource('*'),
            ability: LitAbility.PKPSigning,
          },
          {
            resource: new LitActionResource('*'),
            ability: LitAbility.LitActionExecution,
          },
        ],
        expiration:  new Date(Date.now() + 1000 * 60 * 15).toISOString(),
        capacityDelegationAuthSig: delegateAuthSig,
        //litActionIpfsId: IPFSID,
        litActionCode:customAuthLAIPFSBse64Code,
        jsParams: {
          publicKey: pkp.publicKey,
          sigName: 'signedMessage',
          TYPE: "SESSION_SIG",
          authMethod: authMethod
        },
      });
      return litActionSessionSigs;
}


const pullTxHashByQueueId = async (queueId) => {
  try {
    const baseUrl = relayerUrl;
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${baseUrl}/transaction/status/${queueId}`,
        headers: { 
          'api-key': 'test-api-key'
        }
      };
    const {data} =  await axios.request(config);
    return {txHash: data.transactionHash, queueId: data.queueId};
  }catch(err) {
    console.log(err);
  }
}

module.exports = {getSessionSigForLitAction, pullTxHashByQueueId}