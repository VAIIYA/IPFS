import React from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Toaster } from 'react-hot-toast';
import { SwapInterface } from './components/SwapInterface';
import { WalletContextProvider } from './context/WalletContextProvider';

function App() {
  return (
    <WalletContextProvider>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">Solana Swap</h1>
            <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700" />
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          <SwapInterface />
        </main>

        <footer className="bg-white border-t">
          <div className="max-w-7xl mx-auto px-4 py-4 text-center text-gray-600">
            <p>Maximum fee: 0.1% • Fee recipient: EpfmoiBoNFEofbACjZo1vpyqXUy5Fq9ZtPrGVwok5fb3</p>
          </div>
        </footer>
      </div>
      <Toaster position="bottom-right" />
    </WalletContextProvider>
  );
}

export default App;