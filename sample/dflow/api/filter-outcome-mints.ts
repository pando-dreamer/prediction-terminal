import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { Connection, PublicKey } from '@solana/web3.js';
import {
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from '@solana/spl-token';

dotenv.config();

// Simulate user wallet position fetching flow
const main = async () => {
  const METADATA_API =
    process.env.DFLOW_PREDITION_ENDPOINT ||
    'https://prediction-markets-api.dflow.net';

  console.log('🔍 Testing User Position Fetching Flow...');
  console.log('📊 Step 1: Fetch user token accounts (Token 2022)');
  console.log('📊 Step 2: Filter outcome mints via API');
  console.log('📊 Step 3: Calculate position data');

  try {
    // Step 1: Simulate fetching user's Token 2022 accounts
    // In real implementation, this would query Solana for user's token accounts
    const mockUserWallet = '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'; // Example wallet
    console.log(
      `👤 Simulating token account fetch for wallet: ${mockUserWallet}`
    );

    // Get sample market data to extract real outcome mint addresses
    const marketsResponse = await fetch(
      `${METADATA_API}/api/v1/markets?limit=20`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.DFLOW_API_KEY || '',
        },
      }
    );

    if (!marketsResponse.ok) {
      throw new Error('Failed to fetch markets list');
    }

    const marketsData = await marketsResponse.json();
    const marketsList = marketsData as any;

    // Collect all outcome mint addresses from markets
    const allOutcomeMints: string[] = [];
    const marketMintMapping: { [mint: string]: any } = {};

    if (marketsList.markets && marketsList.markets.length > 0) {
      marketsList.markets.forEach((market: any) => {
        if (market.accounts) {
          Object.entries(market.accounts).forEach(
            ([baseMint, account]: [string, any]) => {
              if (account.yesMint) {
                allOutcomeMints.push(account.yesMint);
                marketMintMapping[account.yesMint] = {
                  market: market.ticker,
                  marketTitle: market.title,
                  outcome: 'YES',
                  baseMint,
                  account,
                };
              }
              if (account.noMint) {
                allOutcomeMints.push(account.noMint);
                marketMintMapping[account.noMint] = {
                  market: market.ticker,
                  marketTitle: market.title,
                  outcome: 'NO',
                  baseMint,
                  account,
                };
              }
            }
          );
        }
      });
    }

    // Simulate user token account balances (Token 2022 program)
    // In real implementation: const tokenAccounts = await connection.getParsedTokenAccountsByOwner(userWallet, { programId: TOKEN_2022_PROGRAM_ID });
    const mockUserTokenBalances = [
      {
        mint: allOutcomeMints[0], // First outcome mint
        balance: 1500000000, // 1.5 tokens (assuming 9 decimals)
        decimals: 9,
      },
      {
        mint: allOutcomeMints[2], // Third outcome mint
        balance: 750000000, // 0.75 tokens
        decimals: 9,
      },
      {
        mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC (not outcome mint)
        balance: 10000000, // 10 USDC (6 decimals)
        decimals: 6,
      },
    ];

    console.log(
      `🪙 Found ${mockUserTokenBalances.length} token accounts for user`
    );

    // Step 2: Filter outcome mints from user's token accounts
    const userMintAddresses = mockUserTokenBalances.map(token => token.mint);

    console.log(`🔍 Filtering ${userMintAddresses.length} mint addresses...`);

    const response = await fetch(
      `${METADATA_API}/api/v1/filter_outcome_mints`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.DFLOW_API_KEY || '',
        },
        body: JSON.stringify({ addresses: userMintAddresses }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const filterResult = await response.json();
    console.log('Filter Result:', JSON.stringify(filterResult, null, 2));

    // Step 3: Calculate user positions from filtered outcome mints
    const userPositions: any[] = [];

    if (filterResult.outcomeMints && filterResult.outcomeMints.length > 0) {
      filterResult.outcomeMints.forEach((outcomeMint: string) => {
        const tokenBalance = mockUserTokenBalances.find(
          token => token.mint === outcomeMint
        );
        const marketInfo = marketMintMapping[outcomeMint];

        if (tokenBalance && marketInfo && tokenBalance.balance > 0) {
          const humanReadableBalance =
            tokenBalance.balance / Math.pow(10, tokenBalance.decimals);

          userPositions.push({
            mint: outcomeMint,
            market: marketInfo.market,
            marketTitle: marketInfo.marketTitle,
            outcome: marketInfo.outcome,
            balance: humanReadableBalance,
            balanceRaw: tokenBalance.balance,
            decimals: tokenBalance.decimals,
            baseMint: marketInfo.baseMint,
            // Additional position data would be calculated here
            estimatedValue:
              humanReadableBalance *
              (marketInfo.account.yesPrice || marketInfo.account.noPrice || 1),
            entryPrice: 0.5, // Would be calculated from trade history
            unrealizedPnL: 0, // Would be calculated based on current price vs entry price
          });
        }
      });
    }

    console.log(`\n📊 USER POSITIONS SUMMARY:`);
    console.log(`Found ${userPositions.length} active positions`);

    userPositions.forEach((position, index) => {
      console.log(`\n${index + 1}. ${position.marketTitle}`);
      console.log(`   Outcome: ${position.outcome}`);
      console.log(`   Balance: ${position.balance} tokens`);
      console.log(`   Estimated Value: $${position.estimatedValue.toFixed(2)}`);
      console.log(`   Mint: ${position.mint}`);
    });

    // Save comprehensive response data
    const responsesDir = path.join(__dirname, '../responses');
    await fs.mkdir(responsesDir, { recursive: true });
    await fs.writeFile(
      path.join(responsesDir, 'filter-outcome-mints.json'),
      JSON.stringify(
        {
          userWallet: mockUserWallet,
          step1_tokenAccounts: mockUserTokenBalances,
          step2_filterInput: userMintAddresses,
          step2_filterOutput: filterResult,
          step3_calculatedPositions: userPositions,
          summary: {
            totalTokenAccounts: mockUserTokenBalances.length,
            outcomeMints: filterResult.outcomeMints?.length || 0,
            activePositions: userPositions.length,
            estimatedTotalValue: userPositions.reduce(
              (sum, pos) => sum + pos.estimatedValue,
              0
            ),
          },
        },
        null,
        2
      )
    );

    console.log(`\n✅ Position fetching flow completed successfully!`);
    console.log(
      `📁 Saved detailed response to responses/filter-outcome-mints.json`
    );
  } catch (error) {
    console.error('❌ Error in position fetching flow:', error);
  }
};

main().catch(error => {
  console.error('Error:', error);
});
