// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;  

contract TraceFish {  
  mapping(string => bool) public batchVerified;  

  event BatchVerified(string batchId);  

  function verifyBatch(string memory batchId) public { 
    require(!batchVerified[batchId], "Already verified");  
    batchVerified[batchId] = true;  /
    emit BatchVerified(batchId); 
   
  }

  function isVerified(string memory batchId) public view returns (bool) {  /
    return batchVerified[batchId]; 
}