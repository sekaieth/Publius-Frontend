import React from 'react';
import { Editor } from './Editor';
import { WagmiConfig, createClient, chain, configureChains } from 'wagmi';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';

const { chains, provider } = configureChains(
  [chain.hardhat],
  [
    jsonRpcProvider({
      rpc: (chain) => ({
        http: 'http://localhost:8545',
      })
    })
  ]
);

const client = createClient({
  autoConnect: true,
  provider: provider,
});

function App() {
  return (
    <WagmiConfig client={client} >
      <div>
          <Editor />
      </div>
    </WagmiConfig>
  );
}

export default App;
