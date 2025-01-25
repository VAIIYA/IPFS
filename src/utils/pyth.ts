import { PythConnection, getPythProgramKeyForCluster } from '@pythnetwork/client';
import { Connection, PublicKey } from '@solana/web3.js';

const PYTH_PRICE_FEEDS = {
  'SOL/USD': 'H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG',
  'USDC/USD': 'Gnt27xtC473ZT2Mw5u8wZ68Z3gULkSTb5DuxJy7eJotD',
};

export async function getPythPrice(connection: Connection, pair: string) {
  const pythConnection = new PythConnection(
    connection,
    getPythProgramKeyForCluster('mainnet-beta')
  );

  const priceAccount = new PublicKey(PYTH_PRICE_FEEDS[pair]);
  const price = await pythConnection.getPrice(priceAccount);

  return price;
}