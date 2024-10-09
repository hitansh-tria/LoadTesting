const axios  = require("axios");
///import { errorHandler } from "../utils/helper";
const {litProxy}  = require("./constant");

// import { litProxy } from "./constant";


class LitService {

    async generateSessionSig(payload) {
        try {
            const randomEightDigitNumber = Math.floor(10000000 + Math.random() * 90000000);
            const { data } = await axios.post(`${litProxy}/api/v1/lit/v6/wrapped-key/generate-session-signature`, {
                ...payload,
                requestId: randomEightDigitNumber
            });
            return data;
        } catch (err) {
            throw err;
        }
    }

    async getWrappedKeys(payload) {
        try {
            const { data } = await axios.post(`${litProxy}/api/v1/lit/v6/wrapped-key/get`, {
                ...payload
            });
            return data;
        } catch (err) {
            throw err;
        }
    }

    async generateWrappedKeys(payload) {
        try {
            const randomEightDigitNumber = Math.floor(10000000 + Math.random() * 90000000);
            const { data } = await axios.post(`${litProxy}/api/v1/lit/v6/wrapped-key/generate`, {
                ...payload,
                requestId: randomEightDigitNumber
            });
            return data;
        } catch (err) {
            throw err;
        }
    }

    async signMessageWithWrappedKey(payload) {
        try {
            const randomEightDigitNumber = Math.floor(10000000 + Math.random() * 90000000);
            const { data } = await axios.post(`${litProxy}/api/v1/lit/v6/wrapped-key/sign-message`, {
                ...payload,
                requestId: randomEightDigitNumber
            });
            return data;
        } catch (err) {
            throw err;
        }
    }

    async signTransactionWithWrappedKey(payload) {
        try {
            const { data } = await axios.post(`${litProxy}/api/v1/lit/v6/wrapped-key/sign-transaction`, {
                ...payload
            });
            return data;
        } catch (err) {
            throw err;
        }
    }


    async getEncryptedKey(payload) {
        try {
            const { data } = await axios.post(`${litProxy}/api/v1/lit/v6/wrapped-key/get-encrypted-key`, {
                    ...payload
                }
            );
            return data;
        } catch (err) {
            throw err;
        }
    }
    
    async executeCustomLitAction(payload) {
        try {
            const { data } = await axios.post(`${litProxy}/api/v1/lit/v6/wrapped-key/exec-custom-lit-action`, {
                ...payload
            });
            return data;
        } catch (err) {
            throw err;
        }
    }

    async getDelegateAuthSig(delegateeAddress) {
        try {
            const { data } = await axios.post(`${litProxy}/api/v1/lit/v6/delegate-auth-sig`, {
                delegateeAddress: delegateeAddress
            });
            return data;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = {LitService}