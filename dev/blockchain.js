const sha256 = require('sha256');               
const currentNodeUrl = process.argv[3];        
const Web3 = require('web3');                    

const { v1: uuidv1 } = require('uuid');          

function Blockchain() {
  this.chain = [];
  this.pendingTransactions = [];
  this.currentNodeUrl = `http://localhost:${process.argv[2] || 3001}`; 
this.networkNodes = [];

this.contractAddress = '0xd9145CCE52D386f254917e481eB44e9943F39138';
this.createNewBlock(100, '0', '0'); 
 
}

Blockchain.prototype.createNewBlock = function(nonce, previousBlockHash, hash) {
  const newBlock = {
    index: this.chain.length + 1,
    timestamp: Date.now(),
    transactions: this.pendingTransactions,
    nonce: nonce,
    hash: hash,
    previousBlockHash: previousBlockHash
  };
  this.pendingTransactions = [];
  this.chain.push(newBlock);
  return newBlock;
};

Blockchain.prototype.getLastBlock = function() {
  return this.chain[this.chain.length - 1];
};

Blockchain.prototype.createNewTransaction = function(batchData) {
  if (!batchData || typeof batchData !== 'object') {
    throw new Error('Invalid transaction: batchData missing');
  }

  if (!batchData.species) {
    throw new Error('Invalid transaction: species is required');
  }

  const newTransaction = {
    batchId: uuidv1().split('-').join(''),
    species: batchData.species,
    farmOrigin: batchData.farmOrigin || null,
    harvestDate: batchData.harvestDate || Date.now(),
    qualityMetrics: batchData.qualityMetrics || {},
    sender: batchData.sender || 'unknown',
    recipient: batchData.recipient || 'unknown',
    amount: batchData.amount || 0,
    transactionId: uuidv1().split('-').join('')
  };

  return newTransaction;
};


Blockchain.prototype.addTransactionToPendingTransactions = function(transactionObj) {
  this.pendingTransactions.push(transactionObj);
  return this.getLastBlock()['index'] + 1;
};

Blockchain.prototype.hashBlock = function(previousBlockHash, currentBlockData, nonce) {
  const dataAsString = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
  const hash = sha256(dataAsString);
  return hash;
};

Blockchain.prototype.proofOfWork = function(previousBlockHash, currentBlockData) {
  let nonce = 0;
  let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
  while (hash.substring(0, 4) !== '0000') {
    nonce++;
    hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
  }
  return nonce;
};

Blockchain.prototype.chainIsValid = function(blockchain) {
  let validChain = true;
  for (let i = 1; i < blockchain.length; i++) {
    const currentBlock = blockchain[i];
    const prevBlock = blockchain[i - 1];
    const blockHash = this.hashBlock(prevBlock['hash'], { transactions: currentBlock['transactions'], index: currentBlock['index'] }, currentBlock['nonce']);
    if (blockHash.substring(0, 4) !== '0000') validChain = false;
    if (currentBlock['previousBlockHash'] !== prevBlock['hash']) validChain = false;
  }
  const genesisBlock = blockchain[0];
  const correctNonce = genesisBlock['nonce'] === 100;
  const correctPreviousBlockHash = genesisBlock['previousBlockHash'] === '0';
  const correctHash = genesisBlock['hash'] === '0';
  const correctTransactions = genesisBlock['transactions'].length === 0;
  if (!correctNonce || !correctPreviousBlockHash || !correctHash || !correctTransactions) validChain = false;
  return validChain;
};

Blockchain.prototype.getBlock = function(blockHash) {
  let correctBlock = null;
  this.chain.forEach(block => {
    if (block.hash === blockHash) correctBlock = block;
  });
  return correctBlock;
};

Blockchain.prototype.getTransaction = function(transactionId) {
  let correctTransaction = null;
  let correctBlock = null;
  this.chain.forEach(block => {
    block.transactions.forEach(transaction => {
      if (transaction.transactionId === transactionId) {
        correctTransaction = transaction;
        correctBlock = block;
      }
    });
  });
  return { transaction: correctTransaction, block: correctBlock };
};

Blockchain.prototype.getBatchData = function(batchId) {
  let batchData = null;
  this.chain.forEach(block => {
    block.transactions.forEach(tx => {
      if (tx.batchId === batchId) batchData = tx;
    });
  });
  return batchData;
};


Blockchain.prototype.callSmartContract = async function(method, params) {
  console.log(`Mock smart contract call: ${method} with params ${JSON.stringify(params)}`);
  if (method === 'verifyBatch' || method === 'isVerified') {
    return true; 
  }
  throw new Error('Mock method not supported');
};

module.exports = Blockchain;