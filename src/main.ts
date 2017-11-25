import sha256 from "fast-sha256";

export type Transaction = any;

export type Block = {
  index: number;
  hash: string;
  previousHash: string;
  timestamp: number;
  data: Transaction[];
};

// TODO
function stringToUint(str) {
  const buf = new ArrayBuffer(str.length * 2);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return bufView;
}

function generateHash(block) {
  return sha256(
    stringToUint(
      block.index +
        block.previousHash +
        block.timestamp +
        JSON.stringify(block.data)
    )
  ).toString();
}

function createBlock(previousBlock: Block, data: Transaction[]): Block {
  // TODO can this fail?
  const block = {
    index: previousBlock.index + 1,
    previousHash: previousBlock.hash,
    timestamp: Date.now(),
    data: data
  };

  return {
    ...block,
    hash: generateHash(block)
  };
}

function createGenesisBlock() {
  const block = {
    index: 0,
    previousHash: "",
    timestamp: Date.now(),
    data: []
  };

  return {
    ...block,
    hash: generateHash(block)
  };
}

export type Client = {
  blockchain: Blockchain;
  transactions: Transaction[];
};

export type Blockchain = Block[];

function consensus(blockchains: Blockchain[]): Blockchain {
  return blockchains.reduce(
    (longest, chain) => (chain.length > longest.length ? chain : longest)
  );
}

export function createClient(otherClients: Client[] = []) {
  const blockchain =
    otherClients.length === 0
      ? createNewBlockchain()
      : consensus(otherClients.map(getBlockchain));

  return {
    blockchain,
    transactions: []
  };
}

function replaceBlockchain(client, blockchain) {
  return {
    ...client,
    blockchain: consensus([client.blockchain, blockchain])
  };
}

export function createTransaction(client, transaction) {
  return {
    ...client,
    transactions: client.transactions.concat(transaction)
  };
}

export function clearTransactions(client) {
  return {
    ...client,
    transactions: []
  };
}

export function addBlock(client: Client, block: Block): Client {
  return {
    ...client,
    blockchain: client.blockchain.concat(block)
  };
}

export function getBlockchain(client) {
  return client.blockchain;
}

export function createNewBlockchain() {
  return [createGenesisBlock()];
}

export function mine(client: Client): Client {
  const blockchain = getBlockchain(client);
  const previousBlock = blockchain[blockchain.length - 1];
  const newBlock = createBlock(previousBlock, client.transactions);

  return clearTransactions(addBlock(client, newBlock));
}

export function emitBlockUpdate(client: Client, receivingClients: Client[]) {
  return receivingClients.map(cli => replaceBlockchain(cli, client.blockchain));
}
