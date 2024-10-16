const {
  LitAbility,
  LitActionResource,
  LitPKPResource,
} = require("@lit-protocol/auth-helpers");

const { customAuthLAIPFS, customAuthLAIPFSBse64Code } = require("./constants");
const { relayerUrl, litProxy } = require("./../constant");
const axios = require("axios");
const { ethers, providers } = require("ethers");
const {
	datil,
} = require("@lit-protocol/contracts");


const getSessionSigForLitAction = async ({
  litNodeClient,
  authMethod,
  pkp,
  delegateAuthSig,
}) => {
  const {
    data: { capacityDelegationAuthSig },
  } = await axios.post(
    `${litProxy}/api/v1/lit/v6/delegate-auth-sig`,
    {
      delegateeAddress: pkp.ethAddress,
    }
  );
  console.log("capacityDelegationAuthSig", capacityDelegationAuthSig);
  const IPFSID = customAuthLAIPFS;
  const litActionSessionSigs = await litNodeClient.getLitActionSessionSigs({
    pkpPublicKey: pkp.publicKey,
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
    expiration: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
    capabilityAuthSigs: [capacityDelegationAuthSig],
    //litActionIpfsId: IPFSID,
    litActionCode: customAuthLAIPFSBse64Code,
    jsParams: {
      publicKey: pkp.publicKey,
      authMethod: authMethod,
    },
  });
  return litActionSessionSigs;
};

const pullTxHashByQueueId = async (queueId) => {
  try {
    const baseUrl = relayerUrl;
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `${baseUrl}/transaction/status/${queueId}`,
      headers: {
        "api-key": "test-api-key",
      },
    };
    const { data } = await axios.request(config);
    return { txHash: data.transactionHash, queueId: data.queueId };
  } catch (err) {
    throw err;
  }
};



const getProvider = () => {
  const provider =  new ethers.providers.JsonRpcProvider(
    'https://rpc-chronicle-yellowstone-testnet-9qgmzfcohk.t.conduit.xyz/EQDCLvbyg7eqh3BD4Zh3wo9ySG2RSRkWZ',
  );
  return provider;
}

async function getPkpNftContractForDatil() {
	let contractsDataRes = datil;
  const contractList = contractsDataRes.data;
  const contractName = 'PKPNFT'
	// find object where name is == contractName
	const contractData = contractList.find(
		(contract) => contract.name === contractName,
	);

  const contract = contractData.contracts[0];
	console.log(`Contract address: ${contract.address_hash}`);
  
  const provider = getProvider();
	// -- ethers contract
	const ethersContract = new ethers.Contract(
		contract.address_hash,
		contract.ABI,
    provider
	);

	return ethersContract;
}

async function getPkpEthAddress(tokenId) {
	const pkpNft = await getPkpNftContractForDatil();
  console.log(pkpNft);
	return pkpNft.getEthAddress(tokenId);
}

async function getPkpPublicKey(tokenId) {
	const pkpNft = await getPkpNftContractForDatil();

	return pkpNft.getPubkey(tokenId);
}


const TRANSFER_EVENT_SIGNATURE =
	"0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

async function getTokenIdFromTransferEvent(
	receipt,
) {
	// Filter for the Transfer event.
	const transferEventLog = receipt.logs.find((log) => {
		return (
			log.topics.length > 0 && log.topics[0] === TRANSFER_EVENT_SIGNATURE
		);
	});

	// Validation
	if (!transferEventLog) {
		throw new Error("No Transfer event found in receipt");
	}

	if (transferEventLog.topics.length < 3) {
		throw new Error("Transfer event does not have enough topics");
	}

	return transferEventLog.topics[3];
}

const pollRequestUntilTerminalState = async (mintPKPTxHash) => {
  try {
    const provider = getProvider();
    let mintReceipt = await provider.waitForTransaction(
      mintPKPTxHash,
      1,
      30000,
    );
    let tokenIdFromEvent = await getTokenIdFromTransferEvent(mintReceipt);
    const [pkpEthAddress, pkpPublicKey] = await Promise.all([
      getPkpEthAddress(tokenIdFromEvent),
      getPkpPublicKey(tokenIdFromEvent),
    ]);	
    return {
      status: "Succeeded",
      pkpTokenId: tokenIdFromEvent,
      pkpEthAddress,
      pkpPublicKey
    };
  }catch(err) {
    console.log(err);
    throw err;
  } 
}



module.exports = { getSessionSigForLitAction, pullTxHashByQueueId, pollRequestUntilTerminalState};
