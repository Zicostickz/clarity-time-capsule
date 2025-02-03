import {
    Clarinet,
    Tx,
    Chain,
    Account,
    types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Can store a new message with encryption and reward",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;
        const wallet2 = accounts.get('wallet_2')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('message-capsule', 'store-message', [
                types.principal(wallet2.address),
                types.utf8("Hello from the past!"),
                types.uint(10),
                types.bool(true),
                types.uint(1000)
            ], wallet1.address)
        ]);
        
        block.receipts[0].result.expectOk().expectUint(0);
    },
});

Clarinet.test({
    name: "Cannot store message with insufficient reward funds",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;
        const wallet2 = accounts.get('wallet_2')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('message-capsule', 'store-message', [
                types.principal(wallet2.address),
                types.utf8("Hello from the past!"),
                types.uint(10),
                types.bool(true),
                types.uint(999999999999)
            ], wallet1.address)
        ]);
        
        block.receipts[0].result.expectErr().expectUint(104);
    },
});

Clarinet.test({
    name: "Can reveal message and receive reward after unlock height",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;
        const wallet2 = accounts.get('wallet_2')!;
        
        let block1 = chain.mineBlock([
            Tx.contractCall('message-capsule', 'store-message', [
                types.principal(wallet2.address),
                types.utf8("Hello from the past!"),
                types.uint(1),
                types.bool(true),
                types.uint(1000)
            ], wallet1.address)
        ]);
        
        chain.mineEmptyBlock(10);
        
        let block2 = chain.mineBlock([
            Tx.contractCall('message-capsule', 'reveal-message', [
                types.uint(0)
            ], wallet2.address)
        ]);
        
        block2.receipts[0].result.expectOk().expectAscii("Hello from the past!");
    },
});

Clarinet.test({
    name: "Can get message age",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;
        const wallet2 = accounts.get('wallet_2')!;
        
        let block1 = chain.mineBlock([
            Tx.contractCall('message-capsule', 'store-message', [
                types.principal(wallet2.address),
                types.utf8("Hello from the past!"),
                types.uint(10),
                types.bool(true),
                types.uint(1000)
            ], wallet1.address)
        ]);

        chain.mineEmptyBlock(5);
        
        let block2 = chain.mineBlock([
            Tx.contractCall('message-capsule', 'get-message-age', [
                types.uint(0)
            ], wallet1.address)
        ]);
        
        block2.receipts[0].result.expectOk().expectUint(6);
    },
});
