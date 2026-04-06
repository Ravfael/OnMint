import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X, Wallet } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export const YourApp = () => {
  return <ConnectButton />;
};

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-black/40 backdrop-blur-md border-b border-white/10" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="text-2xl font-black tracking-tighter cursor-pointer text-white">
          On<span className="text-fuchsia-500">Mint</span>
        </Link>
        <div className="hidden md:flex gap-8 items-center">
          <Link to="/marketplace" className="text-sm font-medium hover:text-fuchsia-400 transition-colors pointer-events-auto cursor-pointer text-gray-300">
            Explore
          </Link>
          <Link to="/#collections" className="text-sm font-medium hover:text-fuchsia-400 transition-colors pointer-events-auto cursor-pointer text-gray-300">
            Collections
          </Link>
          <Link to="/mint" className="text-sm font-medium hover:text-fuchsia-400 transition-colors pointer-events-auto cursor-pointer text-gray-300">
            Mint
          </Link>
          <ConnectButton.Custom>
            {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
              const ready = mounted;
              const connected = ready && account && chain;
              return (
                <div {...(!ready && { "aria-hidden": true, style: { opacity: 0, pointerEvents: "none", userSelect: "none" } })}>
                  {(() => {
                    if (!connected) {
                      return (
                        <button
                          onClick={openConnectModal}
                          type="button"
                          className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-5 py-2.5 rounded-full font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-fuchsia-900/50 hover:shadow-fuchsia-900/80"
                        >
                          <Wallet size={16} /> Connect Wallet
                        </button>
                      );
                    }
                    if (chain.unsupported) {
                      return (
                        <button
                          onClick={openChainModal}
                          type="button"
                          className="bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-full font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-red-900/50 hover:shadow-red-900/80"
                        >
                          Wrong network
                        </button>
                      );
                    }
                    return (
                      <div className="flex gap-3">
                        <button onClick={openChainModal} type="button" className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-full font-bold transition-all flex items-center gap-2 cursor-pointer">
                          {chain.hasIcon && (
                            <div style={{ background: chain.iconBackground, width: 20, height: 20, borderRadius: 999, overflow: "hidden" }}>
                              {chain.iconUrl && <img alt={chain.name ?? "Chain icon"} src={chain.iconUrl} style={{ width: 20, height: 20 }} />}
                            </div>
                          )}
                          {chain.name}
                        </button>
                        <button
                          onClick={openAccountModal}
                          type="button"
                          className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-5 py-2.5 rounded-full font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-fuchsia-900/50 hover:shadow-fuchsia-900/80"
                        >
                          {account.displayName}
                        </button>
                      </div>
                    );
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </div>
        <button className="md:hidden text-white cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-xl absolute top-20 w-full border-b border-white/10 flex flex-col items-center py-6 gap-6">
          <Link to="/marketplace" className="text-gray-300 hover:text-white font-medium" onClick={() => setIsOpen(false)}>
            Explore
          </Link>
          <Link to="/#collections" className="text-gray-300 hover:text-white font-medium" onClick={() => setIsOpen(false)}>
            Collections
          </Link>
          <Link to="/mint" className="text-gray-300 hover:text-white font-medium" onClick={() => setIsOpen(false)}>
            Mint
          </Link>
          <button className="bg-fuchsia-600 text-white px-6 py-2 rounded-full font-bold w-4/5 flex justify-center items-center gap-2">
            <Wallet size={16} /> Connect Wallet
          </button>
        </div>
      )}
    </nav>
  );
}
