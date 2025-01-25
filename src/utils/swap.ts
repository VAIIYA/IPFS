import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, createTransferInstruction, getAssociatedTokenAddress } from '@solana/spl-token';
import { Token } from '../types/token';
import Decimal from 'decimal.js';

const FEE_RECIPIENT = new PublicKey("EpfmoiBoNFEofbACjZo1vpyqXUy5Fq9ZtPrGVwok5fb3");
const MAX_FEE_PERCENTAGE = new Decimal(0.001); // 0.1%

export async function createSwapTransaction(
  connection: Connection,
  walletPubkey: PublicKey,
  inputToken: Token,
  outputToken: Token,
  inputAmount: string,
  slippage: number
) {
  const transaction = new Transaction();
  const amount = new Decimal(inputAmount);
  const fee = amount.mul(MAX_FEE_PERCENTAGE);

  if (inputToken.symbol === 'SOL') {
    // Handle SOL to SPL token swap
    const recipientAta = await getAssociatedTokenAddress(
      new PublicKey(outputToken.mint),
      walletPubkey
    );

    transaction.add(
      SystemProgram.transfer({
        fromPubkey: walletPubkey,
        toPubkey: FEE_RECIPIENT,
        lamports: fee.mul(LAMPORTS_PER_SOL).toNumber(),
      })
    );
  } else if (outputToken.symbol === 'SOL') {
    // Handle SPL token to SOL swap
    const sourceAta = await getAssociatedTokenAddress(
      new PublicKey(inputToken.mint),
      walletPubkey
    );

    transaction.add(
      createTransferInstruction(
        sourceAta,
        await getAssociatedTokenAddress(new PublicKey(inputToken.mint), FEE_RECIPIENT),
        walletPubkey,
        BigInt(fee.mul(10 ** inputToken.decimals).toString()),
        [],
        TOKEN_PROGRAM_ID
      )
    );
  }

  // Add other necessary instructions for the actual swap
  // This is a simplified version - you'll need to integrate with an actual DEX

  return transaction;
}