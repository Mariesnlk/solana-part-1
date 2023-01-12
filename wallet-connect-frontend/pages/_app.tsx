import React, { useMemo } from "react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { GlowWalletAdapter, PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
/// is just a function that generates an RPC endpoint based on the network we give it
import { clusterApiUrl } from "@solana/web3.js";

require("@solana/wallet-adapter-react-ui/styles.css");
require("../styles/globals.css");
require ("../styles/Home.Module.css");
// import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  // Can be set to 'devnet', 'testnet', or 'mainnet-beta'

  const network = WalletAdapterNetwork.Devnet;

  // You can provide a custom RPC endpoint here
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading --// Only the wallets you configure here will be compiled into your application, and only the dependencies// of wallets that your users connect to will be loaded

  /// a hook that loads stuff only if one of the dependencies changes
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new GlowWalletAdapter()
  ],
  [network]
  );


  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Component {...pageProps} />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default MyApp
