// full flow trade test
import { Connection, Keypair, VersionedTransaction } from '@solana/web3.js';
import { createOrder } from './create-order';
import { getOrderStatus } from './order-status';

const USDC = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
//Using sample ticker: KXSB-26-SEA
const YesMint = 'GNr3UXmnwokHCBwpe2QWC9qr3M8v3mTjoAUQj6TVTbyP';
/// Amount of USDC to trade to USDC
const amount = 1_000_000_000;

/// Slippage tolerance in bps
const slippageBps = 50;

// TODO: replace with your own keypair
const keypair = Keypair.generate();
console.log(`Using public key: ${keypair.publicKey.toBase58()}`);

const trade = async () => {
  const connection = new Connection(
    process.env.RPC_URL || 'https://api.mainnet-beta.solana.com',
    'confirmed'
  );
  // Create order
  const createOrderResponse = await createOrder(
    keypair.publicKey,
    USDC,
    YesMint,
    amount,
    slippageBps
  );

  /// Deserialize the transaction from base64
  const transactionBuffer = Buffer.from(
    createOrderResponse.transaction,
    'base64'
  );
  const transaction = VersionedTransaction.deserialize(transactionBuffer);

  /// Sign the transaction
  transaction.sign([keypair]);

  /// Send the transaction to Solana
  const signature = await connection.sendTransaction(transaction);

  if (createOrderResponse.executionMode === 'sync') {
    /// Monitor transaction status using getSignatureStatuses
    let status;

    do {
      const statusResult = await connection.getSignatureStatuses([signature]);
      status = statusResult.value[0];

      if (!status) {
        console.log('Waiting for transaction confirmation...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } while (
      !status ||
      status.confirmationStatus === 'processed' ||
      status.confirmationStatus === 'confirmed'
    );

    /// Check if transaction succeeded or failed
    if (status.err) {
      console.error('Transaction failed:', status.err);
    } else {
      console.log(`Trade completed successfully in slot ${status.slot}`);
    }
  } else {
    let status;
    let fills = [];
    console.log(
      `Transaction submitted with signature: ${signature}. Monitor its status separately.`
    );
    do {
      const statusResponse = await getOrderStatus(signature);
      status = statusResponse.status;
      fills = statusResponse.fills || [];

      console.log(`Order status: ${status}`);

      /// Wait before polling again if order is still open
      if (status === 'open' || status === 'pendingClose') {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } while (status === 'open' || status === 'pendingClose');

    /// Process final status
    switch (status) {
      case 'closed': {
        if (fills.length > 0) {
          console.log(`Trade completed`);
        } else {
          console.log('Order was closed without any fills');
        }
        break;
      }
      case 'pendingClose': {
        if (fills.length > 0) {
          console.log(`Trade ready to close`);
        } else {
          console.log('Order is ready to close without any fills');
        }
        break;
      }
      case 'failed': {
        console.log('Order failed to execute');
        break;
      }
    }
  }
};

// Example usage
const main = async () => {
  await trade();
};

if (require.main === module) {
  main().catch(console.error);
}

export { trade };
