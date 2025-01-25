export interface Token {
  symbol: string;
  name: string;
  mint: string;
  decimals: number;
  logoURI: string;
}

export interface SwapState {
  inputToken?: Token;
  outputToken?: Token;
  inputAmount: string;
  outputAmount: string;
  slippage: number;
}