import {
  createClient,
  emitBlockUpdate,
  getBlockchain,
  createTransaction,
  mine
} from "./main";

describe("Client", () => {
  it("gets the current state on connection", () => {
    const client1 = createClient([]);
    const client2 = createClient([client1]);

    expect(getBlockchain(client1)).toEqual(getBlockchain(client2));
  });

  it("gets updated state happened after init when created", () => {
    const client1 = createClient([]);
    const client2 = createClient([client1]);

    const client1WithTransaction = createTransaction(client1, {
      hello: 123
    });

    const newClient1 = mine(client1WithTransaction);

    const client3 = createClient([newClient1, client2]);

    expect(getBlockchain(client3)).toEqual(getBlockchain(newClient1));
  });

  it("gets new state whenever a new block is created", () => {
    const client1 = createClient([]);
    const client2 = createClient([client1]);

    const client1WithTransaction = createTransaction(client1, {
      hello: 123
    });

    const newClient1 = mine(client1WithTransaction);

    const [newClient2] = emitBlockUpdate(newClient1, [client2]);

    expect(getBlockchain(newClient2)).toEqual(getBlockchain(newClient1));
  });
});
