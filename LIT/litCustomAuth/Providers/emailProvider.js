const { ethers } = require("ethers");
const jose = require("jose");
const { LitRelay } = require("../relay.js");
const { customLAAuthMethod } = require("../../utils/constants.js");

class Email {
  relay;
  baseUrl;
  constructor(config, baseUrl) {
    this.relay = new LitRelay(config);
    this.baseUrl = baseUrl;
  }
  async prepareRelayRequestData(authMethod) {
    const authMethodType = authMethod.authMethodType;
    const { authMethodId, uuid } = await this.getAuthMethodId(authMethod);
    const data = {
      uuid,
      authMethodType,
      authMethodId,
    };
    return data;
  }

  async mintPKPThroughRelayer(authMethod, customArgs) {
    try {
      const data = await this.prepareRelayRequestData(authMethod);
      // if (customArgs && !(0, validators_1.validateMintRequestBody)(customArgs)) {
      //     throw new Error('Invalid mint request body');
      // }
      const body = await this.prepareMintBody(data, customArgs ?? {});
      const mintRes = await this.relay.mintPKP(body);
      // if (!mintRes || !mintRes.requestId) {
      //     throw new Error('Missing mint response or request ID from relay server');
      // }
      //@ts-ignore
      return { queueId: mintRes.queueId, uuid: data.uuid };
    } catch (error) {
      throw error;
    }
  }
  async prepareMintBody(data, customArgs) {
    try {
      const pubkey = data.authMethodPubKey || "0x";
      const LAAuthMethod = customLAAuthMethod;
      const defaultArgs = {
        // default params
        uuid: data.uuid,
        keyType: 2,
        permittedAuthMethodTypes: [
          data.authMethodType,
          LAAuthMethod.authMethodType,
        ],
        permittedAuthMethodIds: [data.authMethodId, LAAuthMethod.id],
        permittedAuthMethodPubkeys: [pubkey, pubkey],
        permittedAuthMethodScopes: [["0"], ["1"]],
        addPkpEthAddressAsPermittedAddress: true,
        sendPkpToItself: true,
      };
      // console.log("defaultArgs", defaultArgs);
      // console.log("defaultArgs.permittedAuthMethodScopes", defaultArgs.permittedAuthMethodScopes);
      let args = {
        ...defaultArgs,
        ...customArgs,
      };
      args.permittedAuthMethodScopes = defaultArgs.permittedAuthMethodScopes;
      // console.log("args", args);
      const body = JSON.stringify(args);
      return body;
    } catch (error) {
      throw error;
    }
  }

  async getAuthMethodId(authMethod) {
    const decodedPayload = jose.decodeJwt(authMethod.accessToken);
    const authMethodId = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(`${decodedPayload.uuid}`)
    );
    return { authMethodId, uuid: decodedPayload.uuid };
  }

  async fetchPKPsThroughRelayer(authMethod) {
    const data = await this.prepareRelayRequestData(authMethod);
    const body = this.prepareFetchBody(data);
    const fetchRes = await this.relay.fetchPKPs(body);
    if (!fetchRes || !fetchRes.pkps) {
      throw new Error("Missing PKPs in fetch response from relay server");
    }
    return fetchRes.pkps;
  }
  prepareFetchBody(data) {
    const args = {
      authMethodId: data.authMethodId,
      authMethodType: data.authMethodType,
      authMethodPubKey: data.authMethodPubKey,
    };
    const body = JSON.stringify(args);
    return body;
  }
}

module.exports = { Email };
