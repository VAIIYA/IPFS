import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Token } from '../types/token';
import { TOKENS } from '../constants/tokens';

interface TokenSelectProps {
  selectedToken?: Token;
  onSelect: (token: Token) => void;
  amount: string;
  onAmountChange: (amount: string) => void;
  label: string;
  readonly?: boolean;
}

export function TokenSelect({ 
  selectedToken, 
  onSelect, 
  amount, 
  onAmountChange, 
  label,
  readonly = false 
}: TokenSelectProps) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-md">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm text-gray-600">{label}</label>
        {selectedToken && (
          <span className="text-xs text-gray-500">
            Balance: 0.00 {selectedToken.symbol}
          </span>
        )}
      </div>
      <div className="flex gap-4">
        <input
          type="number"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          placeholder="0.00"
          className="flex-1 bg-transparent text-2xl outline-none"
          readOnly={readonly}
        />
        <button
          onClick={() => {
            const otherToken = TOKENS.find(t => t !== selectedToken);
            if (otherToken) onSelect(otherToken);
          }}
          className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 hover:bg-gray-200 transition-colors"
        >
          {selectedToken ? (
            <>
              <img src={selectedToken.logoURI} alt={selectedToken.symbol} className="w-6 h-6 rounded-full" />
              <span>{selectedToken.symbol}</span>
            </>
          ) : (
            <span>Select Token</span>
          )}
          <ChevronDown size={20} />
        </button>
      </div>
    </div>
  );
}