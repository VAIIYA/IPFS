import React, { useState, useCallback, useEffect } from 'react';
import { ArrowDownUp, Settings } from 'lucide-react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { TokenSelect } from './TokenSelect';
import { TOKENS } from '../constants/tokens';
import { getJupiterQuote, executeJupiterSwap } from '../utils/jupiter';
import { getPythPrice } from '../utils/pyth';
import type { SwapState } from '../types/token';
import toast from 'react-hot-toast';
import Decimal from 'decimal.js';

const FEE_RECIPIENT = "EpfmoiBoNFEofbACjZo1vpyqXUy5Fq9ZtPrGVwok5fb3";
const MAX_FEE_PERCENTAGE = 0.001; // 0.1%

export function SwapInterface() {
  const { connection } = useConnection();
  const { publicKey, signTransaction, connected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [route, setRoute] = useState(null);
  const [priceImpact, setPriceImpact] = useState<number>(0);
  const [swapState, setSwapState] = useState<SwapState>({
    inputToken: TOKENS[0],
    outputToken: TOKENS[1],
    inputAmount: '',
    outputAmount: '',
    slippage: 0.5,
  });

  const updateQuote = useCallback(async () => {
    if (!swapState.inputToken || !swapState.outputToken || !swapState.inputAmount) {
      return;
    }

    try {
      const routes = await getJupiterQuote(
        connection,
        swapState.inputToken,
        swapState.outputToken,
        swapState.inputAmount,
        swapState.slippage
      );

      if (routes.routesInfos.length > 0) {
        const bestRoute = routes.routesInfos[0];
        setRoute(bestRoute);
        
        // Calculate output amount
        const outAmount = new Decimal(bestRoute.outAmount.toString())
          .div(new Decimal(10).pow(swapState.outputToken.decimals))
          .toString();
        setSwapState(prev => ({ ...prev, outputAmount: outAmount }));

        // Calculate price impact
        const impact = (bestRoute.priceImpactPct * 100);
        setPriceImpact(impact);
      }
    } catch (error) {
      console.error('Failed to get quote:', error);
      toast.error('Failed to get quote. Please try again.');
    }
  }, [connection, swapState.inputToken, swapState.outputToken, swapState.inputAmount, swapState.slippage]);

  useEffect(() => {
    updateQuote();
  }, [updateQuote]);

  const handleSwap = useCallback(async () => {
    if (!publicKey || !signTransaction || !route) {
      toast.error('Please connect your wallet and get a quote first');
      return;
    }

    if (priceImpact > 5) {
      const confirm = window.confirm(
        `Warning: Price impact is high (${priceImpact.toFixed(2)}%). Do you want to continue?`
      );
      if (!confirm) return;
    }

    setLoading(true);
    try {
      const { swapTransaction } = await executeJupiterSwap(
        connection,
        route,
        publicKey
      );

      const signed = await signTransaction(swapTransaction);
      const signature = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(signature);

      toast.success('Swap successful!');
      setSwapState(prev => ({ ...prev, inputAmount: '', outputAmount: '' }));
      setRoute(null);
    } catch (error) {
      console.error('Swap failed:', error);
      toast.error('Swap failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [connection, publicKey, signTransaction, route, priceImpact]);

  const handleSlippageChange = (value: number) => {
    setSwapState(prev => ({ ...prev, slippage: value }));
    updateQuote();
  };

  return (
    <div className="max-w-lg w-full mx-auto p-4">
      <div className="bg-white rounded-xl shadow-xl p-4 space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Swap</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSlippageChange(swapState.slippage === 0.5 ? 1 : 0.5)}
              className="text-gray-600 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>

        <TokenSelect
          selectedToken={swapState.inputToken}
          onSelect={(token) => setSwapState(prev => ({ ...prev, inputToken: token }))}
          amount={swapState.inputAmount}
          onAmountChange={(amount) => setSwapState(prev => ({ ...prev, inputAmount: amount }))}
          label="You pay"
        />

        <div className="relative h-8">
          <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg">
            <ArrowDownUp className="text-gray-600" />
          </div>
        </div>

        <TokenSelect
          selectedToken={swapState.outputToken}
          onSelect={(token) => setSwapState(prev => ({ ...prev, outputToken: token }))}
          amount={swapState.outputAmount}
          onAmountChange={(amount) => setSwapState(prev => ({ ...prev, outputAmount: amount }))}
          label="You receive"
          readonly
        />

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Price Impact</span>
            <span className={priceImpact > 5 ? 'text-red-500' : 'text-gray-600'}>
              {priceImpact.toFixed(2)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span>Fee</span>
            <span>0.1%</span>
          </div>
          <div className="flex justify-between">
            <span>Fee Recipient</span>
            <span className="text-xs">{FEE_RECIPIENT.slice(0, 4)}...{FEE_RECIPIENT.slice(-4)}</span>
          </div>
          <div className="flex justify-between">
            <span>Slippage Tolerance</span>
            <span>{swapState.slippage}%</span>
          </div>
          {route && (
            <div className="flex justify-between">
              <span>Route</span>
              <span>Jupiter Aggregator</span>
            </div>
          )}
        </div>

        <button
          onClick={handleSwap}
          disabled={!connected || loading || !route}
          className={`w-full ${
            connected && route
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-gray-400'
          } text-white rounded-lg py-3 font-semibold transition-colors relative`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </span>
          ) : !connected ? (
            'Connect Wallet to Swap'
          ) : !route ? (
            'Enter an amount'
          ) : (
            'Swap'
          )}
        </button>
      </div>
    </div>
  );
}