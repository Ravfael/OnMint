import React, { useState } from "react";
import type { PokemonCard } from "../hooks/usePokemonCards";
import { formatEther } from "viem";

export interface PokemonCardItemProps {
  card: PokemonCard;
  onClick: (card: PokemonCard) => void;
  isOwner?: boolean;
  onBuyClick?: (e: React.MouseEvent, card: PokemonCard) => void;
  onListClick?: (e: React.MouseEvent, card: PokemonCard) => void;
}

export function PokemonCardItem({ card, onClick, isOwner = false, onBuyClick, onListClick }: PokemonCardItemProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  // Return a skeleton card if the metadata is still null/loading.
  if (!card.metadata) {
    return (
      <div className="bg-[#242424] rounded-xl overflow-hidden shadow-lg border border-gray-800 animate-pulse w-full">
        <div className="aspect-[3/4] bg-gray-700 w-full relative" />
        <div className="p-4 space-y-3">
          <div className="h-5 bg-gray-700 rounded w-1/2"></div>
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/3"></div>
          <div className="h-10 bg-gray-700 rounded-lg w-full mt-4"></div>
        </div>
      </div>
    );
  }

  const { name, series, cardNumber } = card.cardData;

  // Format ID and Card Number to be 3 digits minimum
  const formattedTokenId = card.tokenId.toString().padStart(3, "0");
  const formattedCardNumber = cardNumber.toString().padStart(3, "0");

  const formatOwnerAddress = (address: string) => {
    if (!address || address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div
      className="bg-[#242424] rounded-xl overflow-hidden shadow-lg border border-gray-800 hover:border-[#6c63ff]/50 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(108,99,255,0.2)] flex flex-col cursor-pointer w-full group"
      onClick={() => onClick(card)}
    >
      <div className="aspect-[3/4] relative overflow-hidden bg-black/20">
        {/* Placeholder before the image actually loads */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center">
            <span className="text-gray-600 font-medium">Loading asset...</span>
          </div>
        )}

        <img
          src={card.imageUrl}
          alt={name}
          className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? "opacity-100" : "opacity-0"} group-hover:scale-110 transition-transform`}
          onLoad={() => setImageLoaded(true)}
        />

        {/* Image bottom shadow fade */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#242424] to-transparent pointer-events-none"></div>

        {/* {getRarityBadge()} */}
      </div>

      <div className="p-5 flex flex-col flex-grow relative z-10 -mt-8">
        <div className="flex justify-between items-end mb-2">
          <h3 className="text-xl font-bold text-white tracking-tight truncate pr-2">{name}</h3>
          <span className="text-[#6c63ff] font-bold text-sm bg-[#6c63ff]/10 px-2 py-1 rounded-md shrink-0">#{formattedTokenId}</span>
        </div>

        <div className="space-y-1.5 mb-6 text-sm flex-grow">
          <p className="text-gray-400 flex items-center justify-between">
            <span>Series {series}</span>
            <span className="text-gray-500 font-medium">#{formattedCardNumber}</span>
          </p>
          <p className="text-gray-400 flex items-center justify-between">
            <span>Owner</span>
            <span className="font-mono text-gray-300">{formatOwnerAddress(card.owner)}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-auto flex flex-col gap-2">
          {card.listing?.isActive ? (
            isOwner ? (
              <button className="w-full bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm cursor-not-allowed" disabled onClick={(e) => e.stopPropagation()}>
                Listed for {formatEther(card.listing.price)} ETH
              </button>
            ) : (
              <button
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onBuyClick?.(e, card);
                }}
              >
                Buy for {formatEther(card.listing.price)} ETH
              </button>
            )
          ) : isOwner ? (
            <button
              className="w-full border border-[#6c63ff] text-[#6c63ff] hover:bg-[#6c63ff]/10 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
              onClick={(e) => {
                e.stopPropagation();
                onListClick?.(e, card);
              }}
            >
              List for Sale
            </button>
          ) : (
            <button className="w-full bg-gray-800 text-gray-400 font-medium py-2 px-4 rounded-lg transition-colors text-sm cursor-not-allowed" disabled onClick={(e) => e.stopPropagation()}>
              Not for Sale
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick(card);
            }}
            className="w-full bg-[#6c63ff] hover:bg-[#5b54e5] text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center text-sm"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
