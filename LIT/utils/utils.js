const { LitAbility, LitActionResource, LitPKPResource } = require("@lit-protocol/auth-helpers");

const { customAuthLAIPFS } = require("./constants");

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
        litActionIpfsId: IPFSID,
        jsParams: {
          publicKey: pkp.publicKey,
          sigName: 'signedMessage',
          TYPE: "SESSION_SIG",
          authMethod: authMethod
        },
      });
      return litActionSessionSigs;
}

module.exports = {getSessionSigForLitAction}