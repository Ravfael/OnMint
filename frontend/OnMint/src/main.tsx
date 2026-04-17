import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { sepolia } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const config = getDefaultConfig({
  appName: "OnMint",
  projectId: "f66717187d0d2482c06c341fe52eacb3",
  chains: [sepolia], // ONLY Sepolia should be here, otherwise MetaMask defaults to the chain it's currently on (Ethereum if matched in the array)
  ssr: false,
});

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider>
        <App />
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>,
);
