//import { LitNodeClientNodeJs } from '@lit-protocol/lit-node-client-nodejs';
//import { LitAbility, LitActionResource, LitPKPResource } from '@lit-protocol/auth-helpers';
//import * as ethers from "ethers";
//import { concat } from "@ethersproject/bytes";
const { LitNodeClientNodeJs } = require('@lit-protocol/lit-node-client-nodejs');
const { LitAbility, LitActionResource, LitPKPResource } = require('@lit-protocol/auth-helpers');
const ethers = require('ethers');
const { concat } = require('@ethersproject/bytes');

const network = "manzano";

const signMessage = async (publicKey, message, authMethod) => {
  const IPFSID = "QmZy214gmBq6t4D76DwXasfwpP3H1rARLq25BiG1MynbyT";

  if (typeof message === "string") {
    message = ethers.utils.toUtf8Bytes(message);
  }
  const messagePrefix = "\x19Ethereum Signed Message:\n";
  const toSign = ethers.utils.arrayify(
    ethers.utils.keccak256(
      concat([
        ethers.utils.toUtf8Bytes(messagePrefix),
        ethers.utils.toUtf8Bytes(String(message.length)),
        message,
      ])
    )
  );
  try {
    const litNodeClient = new LitNodeClientNodeJs({
      alertWhenUnauthorized: false,
      litNetwork: network,
      debug: false,
    });
    await litNodeClient.connect();
    const litActionSessionSigs = await litNodeClient.getLitActionSessionSigs({
      pkpPublicKey: publicKey,
      resourceAbilityRequests: [
        {
          resource: new LitPKPResource("*"),
          ability: LitAbility.PKPSigning,
        },
        {
          resource: new LitActionResource("*"),
          ability: LitAbility.LitActionExecution,
        },
      ],
      litActionIpfsId: IPFSID,
      jsParams: {
        publicKey: publicKey,
        sigName: "signedMessage",
        TYPE: "SESSION_SIG",
        authMethod: authMethod,
      },
    });
    const res = await litNodeClient.pkpSign({
      toSign: toSign,
      pubKey: publicKey,
      sessionSigs: litActionSessionSigs,
    });
    return res;
  } catch (e) {
    console.log(e)
    console.log(JSON.stringify(e))
    throw new Error(e);
  }
};

module.exports= {signMessage}