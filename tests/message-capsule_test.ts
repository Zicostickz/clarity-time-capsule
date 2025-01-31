import {
    Clarinet,
    Tx,
    Chain,
    Account,
    types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Can store a new message",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;
        const wallet2 = accounts.get('wallet_2')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('message-capsule', 'store-message', [
                types.principal(wallet2.address),
                types.utf8("Hello from the past!"),
                types.uint(10)
            ], wallet1.address)
        ]);
        
        block.receipts[0].result.expectOk().expectUint(0);
    },
});

Clarinet.test({
    name: "Cannot reveal message before unlock height",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;
        const wallet2 = accounts.get('wallet_2')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('message-capsule', 'store-message', [
                types.principal(wallet2.address),
                types.utf8("Hello from the past!"),
                types.uint(10)
            ], wallet1.address),
            Tx.contractCall('message-capsule', 'reveal-message', [
                types.uint(0)
            ], wallet2.address)
        ]);
        
        block.receipts[1].result.expectErr().expectUint(101);
    },
});

Clarinet.test({
    name: "Can reveal message after unlock height",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;
        const wallet2 = accounts.get('wallet_2')!;
        
        let block1 = chain.mineBlock([
            Tx.contractCall('message-capsule', 'store-message', [
                types.principal(wallet2.address),
                types.utf8("Hello from the past!"),
                types.uint(1)
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
