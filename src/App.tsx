import React, { useEffect, useState} from 'react';
import "./index.css";
import { Editor } from './Components/Editor/Editor';
import { Reader } from './Components/Reader/Reader';
// WAGMI
import { WagmiConfig, createClient, configureChains } from 'wagmi';
import { hardhat, scrollTestnet } from 'wagmi/chains';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';

// RainbowKit
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultWallets,
  RainbowKitProvider,
  darkTheme } from '@rainbow-me/rainbowkit';

const { VITE_SCROLL_API } = import.meta.env; 
console.log(import.meta.env.VITE_SCROLL_API); // Configure the chains and providers for WAGMI


const { chains, provider } = configureChains(
  [hardhat, scrollTestnet],
  [
    // jsonRpcProvider({
    //   rpc: (chain) => ({
    //     http: 'http://localhost:8545',
    //   })
    // }),
    jsonRpcProvider({
      rpc: (chain) => ({
        http: VITE_SCROLL_API,
      }),
    })
  ]
);

// Get RainbowKit Connector
const { connectors } = getDefaultWallets({
  appName: 'Publius',
  chains
});

// Create a WAGMI client, injecting the RainbowKit connector
const client = createClient({
  autoConnect: true,
  connectors,
  provider: provider,
});


function App() {
 const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePathChange = () => {
      setPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePathChange);
    return () => {
      window.removeEventListener('popstate', handlePathChange);
    };
  }, []);
  return (
    <WagmiConfig client={client} >
      <RainbowKitProvider chains={chains} theme={darkTheme({
        accentColor: '#000000',
        accentColorForeground: 'white',
        })}>
        <div>
          {path === '/' && <Editor />}
          {path === '/Reader' && <Reader />}
        </div>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default App;
