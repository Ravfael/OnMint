import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useMyCollection } from "../hooks/useMyCollection";
import { PokemonCardItem } from "../components/PokemonCardItem";
import type { PokemonCard } from "../hooks/usePokemonCards";
import { X } from "lucide-react";

export default function CollectionsPage() {
  const { address, isConnected } = useAccount();
  const { cards, isLoading, totalOwned } = useMyCollection();

  const [selectedCard, setSelectedCard] = useState<PokemonCard | null>(null);
  const [showToast, setShowToast] = useState(false);

  const handleCardClick = (card: PokemonCard) => {
    setSelectedCard(card);
  };

  const closeMenu = () => {
    setSelectedCard(null);
  };

  const handleTransfer = () => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };


  if (!isConnected) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-6 container mx-auto px-4">
        <h2 className="text-3xl font-bold text-white mb-2">My Collection</h2>
        <div className="bg-[#000000] border border-gray-800 p-12 rounded-2xl flex flex-col items-center justify-center max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6">
            <span className="text-4xl">🔌</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-3">Wallet Not Connected</h3>
          <p className="text-gray-400 mb-8">Connect your wallet to view your collection of Pokemon cards.</p>
          <ConnectButton />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-[#000000]">
      {/* Toast Notification */}
      <div
        className={`fixed top-4 right-4 bg-purple-600 text-white px-6 py-3 rounded-lg shadow-xl shadow-purple-900/20 transform transition-all duration-300 z-[100] ${showToast ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}`}
      >
        <div className="flex items-center space-x-2">
          <span className="text-xl">🚧</span>
          <span className="font-medium">Coming Soon!</span>
        </div>
      </div>

      <div className="flex justify-center items-center mb-10 mt-7">
        <div className="flex flex-col mt-9 ml-3">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600 text-center mb-4 font-poppins">My Collection</h1>
          <p className="text-gray-400 text-lg">Manage your personal collection of Pokemon NFTs</p>
        </div>
        <div className="bg-purple-600/20 border border-purple-500/30 text-purple-400 px-5 py-2.5 rounded-xl font-bold text-lg shadow-[0_0_15px_rgba(147,51,234,0.15)] flex items-center gap-2 mr-3 mt-9 justify-end">
          <span>{totalOwned}</span>
          <span className="text-purple-300/80 font-medium text-sm">Cards</span>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-[#242424] rounded-xl overflow-hidden shadow-lg border border-gray-800 animate-pulse w-full aspect-[3/4] max-h-[450px] flex flex-col">
              <div className="flex-1 bg-gray-800" />
              <div className="h-36 p-5 space-y-3 bg-[#242424]">
                <div className="h-5 bg-gray-700 rounded w-1/2" />
                <div className="h-4 bg-gray-700 rounded w-full" />
                <div className="h-10 bg-gray-700 rounded-lg w-full mt-4" />
              </div>
            </div>
          ))}
        </div>
      ) : cards.length === 0 ? (
        <div className="text-center py-24 bg-[#000000] border border-[#000000] rounded-2xl flex flex-col items-center justify-center">
          <div className="w-24 h-24 bg-[#000000] rounded-full flex items-center justify-center mb-6">
            <span className="text-5xl">📭</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">You don't own any Pokemon cards yet</h3>
          <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">Visit the marketplace to discover and mint new Pokemon cards to build your collection.</p>
          <Link to="/marketplace" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-xl transition-all hover:scale-105">
            Explore Marketplace
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {cards.map((card) => (
            <div key={card.tokenId} className="cursor-pointer transition-transform hover:-translate-y-2">
              <PokemonCardItem card={card} onClick={handleCardClick} isOwner={true} />
            </div>
          ))}
        </div>
      )}

      {/* Card Detail Modal */}
      {selectedCard && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={closeMenu}>
          <div
            className="bg-[#1a1a1a] border border-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col md:flex-row relative animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button onClick={closeMenu} className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors z-10">
              <X size={24} className="drop-shadow-lg" />
            </button>

            {/* Left side: Image */}
            <div className="w-full md:w-1/2 p-6 md:p-8 flex items-center justify-center bg-black/40">
              <img
                src={selectedCard.imageUrl || selectedCard.metadata?.image || "https://placehold.co/400x600/2a2a2a/fff?text=No+Image"}
                alt={selectedCard.cardData?.name || "Pokemon Card"}
                className="w-full max-w-sm rounded-[4%] shadow-[0_0_30px_rgba(147,51,234,0.3)] border border-purple-500/20"
              />
            </div>

            {/* Right side: Details */}
            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-center space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-3xl font-extrabold text-white">{selectedCard.cardData?.name || selectedCard.metadata?.name || "Unknown"}</h2>
                  <span className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 text-sm font-bold uppercase rounded-lg">{selectedCard.cardData?.rarity || "COMMON"}</span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                  <span className="bg-gray-800 px-3 py-1 rounded-md">Token ID: #{selectedCard.tokenId.toString()}</span>
                  <span className="bg-gray-800 px-3 py-1 rounded-md">Series: {selectedCard.cardData?.series.toString()}</span>
                  <span className="bg-gray-800 px-3 py-1 rounded-md">Card No: {selectedCard.cardData?.cardNumber.toString()}</span>
                </div>
              </div>

              <div className="bg-[#242424] p-5 rounded-xl border border-gray-800 space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">Ownership</h3>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Owner Address</p>
                  <p className="text-purple-400 font-mono text-sm break-all bg-purple-400/10 p-3 rounded-lg border border-purple-400/20">{selectedCard.owner}</p>
                </div>

                {selectedCard.metadata?.description && (
                  <div className="pt-2 border-t border-gray-700">
                    <p className="text-sm text-gray-500 mb-1">Description</p>
                    <p className="text-sm text-gray-300 leading-relaxed italic">"{selectedCard.metadata.description}"</p>
                  </div>
                )}
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-4 mt-auto">
                <button onClick={handleTransfer} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  Transfer Card
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
