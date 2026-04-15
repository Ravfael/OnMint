import { useState, useMemo, useEffect } from "react";
import { RefreshCw, Search, Filter, X } from "lucide-react";
import type { PokemonCard } from "../hooks/usePokemonCards";
import { usePokemonCards } from "../hooks/usePokemonCards";
import { PokemonCardItem } from "../components/PokemonCardItem";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { POKEMON_CARD_ADDRESS, POKEMON_MARKETPLACE_ADDRESS, POKEMON_CARD_ABI, POKEMON_MARKETPLACE_ABI } from "../contracts/addresses";
import { parseEther, formatEther } from "viem";

export default function Marketplace() {
  const { cards, isLoading, error, refetch } = usePokemonCards();
  const { address } = useAccount();

  const [searchQuery, setSearchQuery] = useState("");
  const [rarityFilter, setRarityFilter] = useState<string>("All");
  const [selectedCard, setSelectedCard] = useState<PokemonCard | null>(null);

  const { writeContractAsync: writeCard } = useWriteContract();
  const { writeContractAsync: writeMarketplace } = useWriteContract();

  const [pendingTxHash, setPendingTxHash] = useState<`0x${string}` | undefined>(undefined);

  const { isLoading: isTxConfirming, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash: pendingTxHash,
  });

  useEffect(() => {
    if (isTxSuccess) {
      alert("Transaction successful! Please refresh.");
      setPendingTxHash(undefined);
      refetch();
    }
  }, [isTxSuccess, refetch]);

  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      const matchName = card.cardData.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchRarity = rarityFilter === "All" || card.cardData.rarity.toLowerCase() === rarityFilter.toLowerCase();
      return matchName && matchRarity;
    });
  }, [cards, searchQuery, rarityFilter]);

  const handleListClick = async (e: React.MouseEvent, card: PokemonCard) => {
    e.stopPropagation();
    if (!address) {
      alert("Please connect your wallet first.");
      return;
    }
    const priceStr = window.prompt(`Enter price in ETH for ${card.cardData.name}:`);
    if (!priceStr || isNaN(Number(priceStr))) {
      return;
    }

    try {
      const priceWei = parseEther(priceStr);

      // 1. Approve Marketplace
      console.log("Approving...");
      const approveTx = await writeCard({
        address: POKEMON_CARD_ADDRESS as `0x${string}`,
        abi: POKEMON_CARD_ABI,
        functionName: "approve",
        args: [POKEMON_MARKETPLACE_ADDRESS, card.tokenId],
      });
      console.log("Approve TX sent:", approveTx);

      console.log("Listing...");
      // 2. List Card
      const listTx = await writeMarketplace({
        address: POKEMON_MARKETPLACE_ADDRESS as `0x${string}`,
        abi: POKEMON_MARKETPLACE_ABI,
        functionName: "listCard",
        args: [card.tokenId, priceWei],
      });
      setPendingTxHash(listTx as `0x${string}`);
    } catch (err: any) {
      console.error(err);
      alert(`Error listing card: ${err.shortMessage || err.message}`);
    }
  };

  const handleBuyClick = async (e: React.MouseEvent, card: PokemonCard) => {
    e.stopPropagation();
    if (!address) {
      alert("Please connect your wallet first.");
      return;
    }
    if (!card.listing || !card.listing.isActive) return;

    try {
      const buyTx = await writeMarketplace({
        address: POKEMON_MARKETPLACE_ADDRESS as `0x${string}`,
        abi: POKEMON_MARKETPLACE_ABI,
        functionName: "buyCard",
        args: [card.tokenId],
        value: card.listing.price,
      });
      setPendingTxHash(buyTx as `0x${string}`);
    } catch (err: any) {
      console.error(err);
      alert(`Error buying card: ${err.shortMessage || err.message}`);
    }
  };

  return (
    <div className="pt-32 pb-20 px-4 sm:px-6 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Marketplace</h1>
          <p className="text-gray-400 text-lg">Discover, buy, and trade the rarest Pokemon NFTs.</p>
        </div>
        <button
          onClick={refetch}
          disabled={isLoading || isTxConfirming}
          className="flex items-center justify-center gap-2 bg-[#242424] hover:bg-[#2a2a2a] border border-gray-800 text-white px-5 py-2.5 rounded-xl transition-all disabled:opacity-50 font-medium"
        >
          <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
          {isTxConfirming ? "Confirming TX..." : "Refresh"}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-10 w-full">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type="text"
            className="w-full bg-[#1a1a1a] border border-gray-800 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-[#6c63ff] focus:ring-1 focus:ring-[#6c63ff] transition-colors"
            placeholder="Search Pokemon by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="relative min-w-[200px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-5 w-5 text-gray-500" />
          </div>
          <select
            className="w-full bg-[#1a1a1a] border border-gray-800 text-white pl-10 pr-10 py-3 rounded-xl appearance-none focus:outline-none focus:border-[#6c63ff] focus:ring-1 focus:ring-[#6c63ff] transition-colors cursor-pointer"
            value={rarityFilter}
            onChange={(e) => setRarityFilter(e.target.value)}
          >
            <option value="All">All Rarities</option>
            <option value="Common">Common</option>
            <option value="Uncommon">Uncommon</option>
            <option value="Rare">Rare</option>
            <option value="Ultra Rare">Ultra Rare</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-500 text-red-400 p-4 rounded-xl mb-8">
          <p>Error loading cards: {error.message}. Please make sure you are connected to the correct network.</p>
        </div>
      )}

      {isLoading && cards.length === 0 ? (
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
      ) : filteredCards.length === 0 && !isLoading ? (
        <div className="text-center py-32 bg-[#1a1a1a] border border-gray-800 rounded-2xl flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6">
            <span className="text-4xl">🔍</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">No Cards Found</h3>
          <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">No cards match your current search and filter criteria.</p>
          {(searchQuery || rarityFilter !== "All") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setRarityFilter("All");
              }}
              className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-bold transition-all"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredCards.map((card) => {
            const isOwner = card.owner.toLowerCase() === address?.toLowerCase();
            return <PokemonCardItem key={card.tokenId} card={card} onClick={(clickedCard) => setSelectedCard(clickedCard)} isOwner={isOwner} onListClick={handleListClick} onBuyClick={handleBuyClick} />;
          })}
        </div>
      )}

      {/* Card Detail Modal */}
      {selectedCard && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedCard(null)}>
          <div
            className="bg-[#1a1a1a] border border-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col md:flex-row relative animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button onClick={() => setSelectedCard(null)} className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors z-10">
              <X size={24} className="drop-shadow-lg" />
            </button>

            {/* Left side: Image */}
            <div className="w-full md:w-1/2 p-6 md:p-8 flex items-center justify-center bg-black/40">
              <img
                src={selectedCard.imageUrl || selectedCard.metadata?.image || "https://placehold.co/400x600/2a2a2a/fff?text=No+Image"}
                alt={selectedCard.cardData?.name || "Pokemon Card"}
                className="w-full max-w-sm rounded-[4%] shadow-[0_0_30px_rgba(108,99,255,0.3)] border border-[#6c63ff]/20"
              />
            </div>

            {/* Right side: Details */}
            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-center space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-3xl font-extrabold text-white">{selectedCard.cardData?.name || selectedCard.metadata?.name || "Unknown"}</h2>
                  {/* <span className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 text-sm font-bold uppercase rounded-lg">{selectedCard.cardData?.rarity || "COMMON"}</span> */}
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
                  <p className="text-[#6c63ff] font-mono text-sm break-all bg-[#6c63ff]/10 p-3 rounded-lg border border-[#6c63ff]/20">{selectedCard.owner}</p>
                </div>

                {selectedCard.metadata?.description && (
                  <div className="pt-2 border-t border-gray-700">
                    <p className="text-sm text-gray-500 mb-1">Description</p>
                    <p className="text-sm text-gray-300 leading-relaxed italic">"{selectedCard.metadata.description}"</p>
                  </div>
                )}
              </div>

              {selectedCard.listing?.isActive && (
                <div className="bg-green-900/20 border border-green-500/30 p-4 rounded-xl">
                  <p className="text-sm text-gray-400 mb-1">Listed Price</p>
                  <p className="text-2xl font-extrabold text-green-400">{formatEther(selectedCard.listing.price)} ETH</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
