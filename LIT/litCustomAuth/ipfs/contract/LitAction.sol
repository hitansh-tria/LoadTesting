// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract LitAction {
    string public ipfsCid;
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function.");
        _;
    }

    constructor(string memory initialIpfsCid) {
        owner = msg.sender;
        ipfsCid = initialIpfsCid;
    }

    function updateIpfsCid(string memory newIpfsCid) public onlyOwner {
        ipfsCid = newIpfsCid;
    }
}
