import { Connection, PublicKey } from '@solana/web3.js';
import { Jupiter } from '@jup-ag/core';
import { Token } from '../types/token';
import Decimal from 'decimal.js';

export async function getJupiterQuote(
  connection: Connection,
  inputToken: Token,
  outputToken: Token,
  amount: string,
  slippage: number
) {
  const jupiter = await Jupiter.load({
    connection,
    cluster: 'mainnet-beta',
  });

  const amountInDecimals = new Decimal(amount)
    .mul(new Decimal(10).pow(inputToken.decimals))
    .toString();

  const routes = await jupiter.computeRoutes({
    inputMint: new PublicKey(inputToken.mint),
    outputMint: new PublicKey(outputToken.mint),
    amount: BigInt(amountInDecimals),
    slippageBps: slippage * 100,
  });

  return routes;
}

export async function executeJupiterSwap(
  connection: Connection,
  route: any,
  userPublicKey: PublicKey
) {
  const jupiter = await Jupiter.load({
    connection,
    cluster: 'mainnet-beta',
  });

  const { transactions } = await jupiter.exchange({
    routeInfo: route,
    userPublicKey,
  });

  return transactions;
}