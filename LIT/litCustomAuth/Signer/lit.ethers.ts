import { keccak256 } from "js-sha3";
import { Bytes, ethers } from "ethers";
import { IRelayPKP } from "@lit-protocol/types";
import { concat, arrayify } from "@ethersproject/bytes";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { UnsignedTransaction, serialize } from "@ethersproject/transactions";

import AuthService from "../../services/auth";
import { LitCustomAuthMethod } from "../../types";
import { customAuthLAIPFS, litStagingSentryDNS } from "../../utils/constants";
import * as Sentry from "@sentry/browser";
import packageJson from "../../package.json";
export class LitCustomAuthSigner extends ethers.Signer {
  readonly provider: ethers.providers.Provider;
  readonly address: string;
  litNodeClient: LitNodeClient;
  authService: AuthService;
  currentAccount: IRelayPKP;
  customAuthMethod: LitCustomAuthMethod;

  constructor({
    baseUrl,
    provider,
    currentAccount,
    customAuthMethod,
    sentryDns,
    litNodeClient,
  }: {
    baseUrl: string,
    provider: ethers.providers.Provider;
    currentAccount: IRelayPKP;
    customAuthMethod: LitCustomAuthMethod;
    sentryDns?: string;
    litNodeClient: LitNodeClient;
  }) {
    super();
    this.provider = provider;
    this.currentAccount = currentAccount;
    this.address = currentAccount?.ethAddress;
    this.litNodeClient = litNodeClient;
    this.customAuthMethod = customAuthMethod;
    this.authService = new AuthService(baseUrl || "https://dev.tria.so");
    Sentry.init({
      dsn: sentryDns || litStagingSentryDNS,
      release: `tria-sdk/web@${packageJson.version}`,
      debug: true,
      defaultIntegrations: false,
    });
  }

  async getAddress(): Promise<string> {
    return this.address;
  }

  async signMessage(message: Bytes | string): Promise<string> {
    try {
      console.time("Lit Custom signer signMessage");
      const authSig = await this.authService.getSIWE();
      if (!authSig) {
        throw new Error("AUTH SIG REQUIRED");
      }
      console.log("in lit action signMessage", message);
      console.log("this.customAuthMethod", this.customAuthMethod);
      const { authMethodType } = this.customAuthMethod;
      console.log({ authMethodType });
      const ipfsId = customAuthLAIPFS;
      console.log({ ipfsId });
      if (typeof message === "string") {
        message = ethers.utils.toUtf8Bytes(message);
      }
      // message = ethers.utils.arrayify(message);
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
    const jsParams = {
        sigName: "signedMessage",
        publicKey: this.currentAccount?.publicKey,
        toSign: toSign,
        TYPE: "SIGN_ECDSA",
        authMethod: {
          accessToken: localStorage.getItem("accessToken"),
          authMethodType: authMethodType,
        },
      };
      console.log({ jsParams });
      let sessionSig = localStorage.getItem("sessionSig");
      if (sessionSig) {
        console.log("sessionSig exists");
        sessionSig = JSON.parse(sessionSig);
      }
      const result = await this.litNodeClient.executeJs({
        sessionSigs: sessionSig,
        ipfsId: ipfsId,
        jsParams,
      });
      const { signatures, logs, response } = result;
      if (!signatures) {
        const newErr = new Error(
          "Something went wrong, no  signatures in returned"
        );
        Sentry.captureException(newErr, {
          tags: { key: "SignMessage" },
          level: "fatal",
          extra: {
            litResponse: {
              logs: logs,
              response: response,
            },
            errorDetails: {
              message: newErr.message,
              stack: newErr.stack,
            },
          },
        });
        throw newErr;
      }
      const { signature } = signatures[jsParams.sigName];
      const address = ethers.utils.verifyMessage(message, signature);
      if (address !== this.address) {
        const newErr = new Error("Invalid Signature, address mismatch");
        Sentry.captureException(newErr, {
          tags: { key: "SignMessage" },
          level: "fatal",
          extra: {
            logs,
            response: response,
            address1: address,
            address2: this.address,
            pubKey: jsParams.publicKey,
          },
        });
        throw newErr;
      }
      console.timeEnd("Lit Custom signer signMessage");
      return signature;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async signTransaction(
    txParams: ethers.providers.TransactionRequest
  ): Promise<string> {
    console.log({ txParams });
    const authSig = await this.authService.getSIWE();
    if (!authSig) {
      throw new Error("AUTH SIG REQUIRED");
    }
    if (txParams.hasOwnProperty("from")) {
      delete txParams.from;
    }
    const unsignedTxnParams = { ...txParams } as UnsignedTransaction;
    const serializedTx = serialize(unsignedTxnParams);
    console.log("serializedTx", serializedTx);

    const rlpEncodedTxn = arrayify(serializedTx);
    console.log("rlpEncodedTxn: ", rlpEncodedTxn);

    const unsignedTxn = keccak256.digest(rlpEncodedTxn);
    console.log("unsignedTxn: ", unsignedTxn);
    const { authMethodType } = this.customAuthMethod;
    const ipfsId = customAuthLAIPFS;
    const jsParams = {
      toSign: unsignedTxn,
      publicKey: this.currentAccount?.publicKey,
      sigName: "signature",
      TYPE: "SIGN_ECDSA",
      authMethod: {
        accessToken: localStorage.getItem("accessToken"),
        authMethodType: authMethodType,
      },
    };
    let sessionSig = localStorage.getItem("sessionSig");
      if (sessionSig) {
        console.log("sessionSig exists");
        sessionSig = JSON.parse(sessionSig);
      }
    const result = await this.litNodeClient.executeJs({
      sessionSigs: sessionSig,
      ipfsId: ipfsId,
      jsParams,
    });
    console.log(result);
    const { signatures } = result;
    const { signature } = signatures[jsParams.sigName];
    return signature;
  }

  connect(provider: ethers.providers.Provider): LitCustomAuthSigner {
    // Return a new instance of the custom signer connected to a different provider
    return new LitCustomAuthSigner({
      provider,
      currentAccount: this.currentAccount,
      customAuthMethod: this.customAuthMethod,
      litNodeClient: this.litNodeClient,
    });
  }

  async sendTransaction(txnObject: any) {
    console.log("<-----txnObject----->", txnObject);
    const chainId = (await this.provider.getNetwork()).chainId;
    const updatedtx = { ...txnObject, chainId };
    //@ts-ignore
    updatedtx.nonce = await this.provider.getTransactionCount(
      this.address,
      "pending"
    );
    delete updatedtx.from;
    const signedTx = (await this.signTransaction(updatedtx)) as string;
    const serializeTxn = serialize(updatedtx, signedTx);
    console.log("signedTx", signedTx);
    const tx = await this.provider.sendTransaction(serializeTxn);
    return tx;
  }
}
