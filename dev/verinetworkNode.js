const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');

const { v1: uuidv1 } = require('uuid');           

const port = process.argv[2];
const rp = require('request-promise');

const nodeAddress = uuidv1().split('-').join('');  

const traceFish = new Blockchain();  

app.use(bodyParser.json());  
app.use(bodyParser.urlencoded({ extended: false }));  

app.get('/blockchain', function (req, res) { 
  res.send(traceFish);  
});


app.get('/block-explorer', function(req, res) {
  res.sendFile('./block-explorer/index.html', { root: __dirname });
});

app.post('/transaction/broadcast', function(req, res) {  
  const batchData = req.body;  
  const newTransaction = traceFish.createNewTransaction(batchData);  
  traceFish.addTransactionToPendingTransactions(newTransaction);  
  const requestPromises = [];  
  traceFish.networkNodes.forEach(networkNodeUrl => {  
    const requestOptions = { uri: networkNodeUrl + '/transaction', method: 'POST', body: newTransaction, json: true };  
    requestPromises.push(rp(requestOptions));  
  });
  Promise.all(requestPromises).then(data => {  
    res.json({ note: 'Batch record created and broadcast.' });  
  });
});

app.post('/transaction', function(req, res) {  
  const newTransaction = req.body;  
  const blockIndex = traceFish.addTransactionToPendingTransactions(newTransaction); 
  res.json({ note: `Batch will be added in block ${blockIndex}.` });  
});

app.get('/mine', function(req, res) {  
  const lastBlock = traceFish.getLastBlock();  
  const previousBlockHash = lastBlock['hash'];  
  const currentBlockData = { transactions: traceFish.pendingTransactions, index: lastBlock['index'] + 1 };  
  const nonce = traceFish.proofOfWork(previousBlockHash, currentBlockData); 
  const blockHash = traceFish.hashBlock(previousBlockHash, currentBlockData, nonce); 
  const newBlock = traceFish.createNewBlock(nonce, previousBlockHash, blockHash);  
  const requestPromises = [];
  traceFish.networkNodes.forEach(networkNodeUrl => {
    const requestOptions = { uri: networkNodeUrl + '/receive-new-block', method: 'POST', body: { newBlock }, json: true };
    requestPromises.push(rp(requestOptions));
  });
  Promise.all(requestPromises).then(data => {
    const requestOptions = { uri: traceFish.currentNodeUrl + '/transaction/broadcast', method: 'POST', body: { species: 'Reward', farmOrigin: 'Mining', harvestDate: Date.now(), qualityMetrics: {}, sender: '00', recipient: nodeAddress, amount: 12.5 }, json: true };
    return rp(requestOptions);
  }).then(data => {
    res.json({ note: 'New block mined & broadcast.', block: newBlock });
  });
});


app.get('/batch/:batchId', function(req, res) { 
  const batchId = req.params.batchId;  
  const batchData = traceFish.getBatchData(batchId);  
  res.json({ batch: batchData }); 
});

app.post('/verify-batch', async function(req, res) {  
  const batchId = req.body.batchId; 
  try { 
    const result = await traceFish.callSmartContract('verifyBatch', [batchId]);  
    res.json({ verified: result });  
} catch (error) {  
    res.json({ error: error.message });  
  }
});

app.get('/block-explorer', function(req, res) {  
  res.sendFile('./block-explorer/index.html', { root: __dirname });  
});

app.listen(port, function () {  
  console.log(`Listening on port ${port}...`);  
});