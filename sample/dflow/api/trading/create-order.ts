import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { Keypair, PublicKey } from '@solana/web3.js';

dotenv.config();
const USDC = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
const YesMint = 'GNr3UXmnwokHCBwpe2QWC9qr3M8v3mTjoAUQj6TVTbyP';
/// Amount of SOL to trade to USDC
const amount = 1_000_000_000;

/// Slippage tolerance in bps
const slippageBps = 50;

/// Base URL for the DFlow Trade API
const API_BASE_URL = process.env.DFLOW_QUOTE_ENDPOINT || '';
const API_KEY = process.env.DFLOW_API_KEY; // Optional

const keypair = Keypair.generate();
console.log(`Using public key: ${keypair.publicKey.toBase58()}`);

const createOrder = async (
  userPublicKey: PublicKey,
  inputMint: string,
  outputMint: string,
  amount: number,
  slippageBps: number
): Promise<any> => {
  const queryParams = new URLSearchParams();
  queryParams.append('inputMint', inputMint);
  queryParams.append('outputMint', outputMint);
  queryParams.append('amount', amount.toString());
  queryParams.append('slippageBps', slippageBps.toString());
  queryParams.append('predictionMarketSlippageBps', 'auto');
  queryParams.append('userPublicKey', userPublicKey.toBase58());

  try {
    const response = await fetch(
      `${API_BASE_URL}/order?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY || '',
        },
      }
    );

    if (!response.ok) {
      console.error(`❌ HTTP ${response.status}: ${response.statusText}`);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Order retrieved');

    // Save response
    const responsesDir = path.join(__dirname, '../../responses');
    await fs.mkdir(responsesDir, { recursive: true });
    await fs.writeFile(
      path.join(responsesDir, `order-${keypair.publicKey.toBase58()}.json`),
      JSON.stringify(data, null, 2)
    );

    return data;
  } catch (error) {
    console.error('❌ Failed to get order:', error);
    throw error;
  }
};

// Example usage
const main = async () => {
  await createOrder(keypair.publicKey, USDC, YesMint, amount, slippageBps);
};

if (require.main === module) {
  main().catch(console.error);
}

export { createOrder };
