import { Contract } from "@ethersproject/contracts";

const go = async () => {
    const toContract = "0x667BdB4bc34E7f96134Bd1D85570402923be13eF";
    const abi = [{"inputs":[{"internalType":"string","name":"initialIpfsCid","type":"string"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"ipfsCid","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"newIpfsCid","type":"string"}],"name":"updateIpfsCid","outputs":[],"stateMutability":"nonpayable","type":"function"}];
    const contract = new Contract(toContract, abi);
    const rawTxn = await contract.populateTransaction.ipfsCid();
    const txn = ethers.utils.serializeTransaction(rawTxn);
    // const chain = "polygon";
    const chain = "mumbai";

    const res = await Lit.Actions.callContract({
      chain,
      txn
    });

    const decodedResult = contract.interface.decodeFunctionResult("ipfsCid", res)[0].toString();
    const _ = await Lit.Actions.call({ ipfsId: decodedResult, params });
}

go();