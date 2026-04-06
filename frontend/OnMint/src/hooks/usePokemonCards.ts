import { useState, useEffect, useCallback } from "react";
import { usePublicClient } from "wagmi";
import type { Abi } from "viem";

import {
  POKEMON_CARD_ADDRESS,
  POKEMON_CARD_ABI,
  POKEMON_MARKETPLACE_ADDRESS,
  POKEMON_MARKETPLACE_ABI
} from "../contracts/addresses";

export type PokemonCard = {
  tokenId: number;
  tokenURI: string;
  imageUrl: string;
  metadata: {
    name: string;
    description: string;
    image: string;
    attributes: Array<{ trait_type: string; value: string }>;
  } | null;
  cardData: {
    name: string;
    rarity: string;
    series: number;
    cardNumber: number;
  };
  owner: string;
  listing?: {
    tokenId: number;
    price: bigint;
    seller: string;
    isActive: boolean;
  } | null;
};

type CardDataRawObject = {
  name: string;
  rarity: string;
  series: bigint;
  cardNumber: bigint;
};

export function usePokemonCards() {
  const publicClient = usePublicClient();
  const [cards, setCards] = useState<PokemonCard[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchCards = useCallback(async () => {
    if (!publicClient) return;

    setIsLoading(true);
    setError(null);

    try {
      const fetchedCards: PokemonCard[] = [];
      const gateway = import.meta.env.VITE_PINATA_GATEWAY || "gateway.pinata.cloud";

      const ipfsToHttp = (url: string) => {
        if (!url) return "";
        return url.startsWith("ipfs://") ? `https://${gateway}/ipfs/${url.replace("ipfs://", "")}` : url;
      };

      let currentTokenId = 0;
      while (true) {
        let owner = "";
        try {
          owner = (await publicClient.readContract({
            address: POKEMON_CARD_ADDRESS as `0x\${string}`,
            abi: POKEMON_CARD_ABI as Abi,
            functionName: "ownerOf",
            args: [BigInt(currentTokenId)],
          })) as string;
        } catch (err) {
          // Reverts when token doesn't exist. Stop the loop.
          break;
        }

        const [tokenURI, cardDataRaw, listingRaw] = await Promise.all([
          publicClient.readContract({
            address: POKEMON_CARD_ADDRESS as `0x\${string}`,
            abi: POKEMON_CARD_ABI as Abi,
            functionName: "tokenURI",
            args: [BigInt(currentTokenId)],
          }).catch(() => "") as Promise<string>,
          publicClient.readContract({
            address: POKEMON_CARD_ADDRESS as `0x\${string}`,
            abi: POKEMON_CARD_ABI as Abi,
            functionName: "cardData",
            args: [BigInt(currentTokenId)],
          }).catch(() => null) as Promise<CardDataRawObject | unknown[] | null>,
          publicClient.readContract({
            address: POKEMON_MARKETPLACE_ADDRESS as `0x\${string}`,
            abi: POKEMON_MARKETPLACE_ABI as Abi,
            functionName: "listings",
            args: [BigInt(currentTokenId)],
          }).catch(() => null) as Promise<unknown[] | any>,
        ]);

        let metadata = null;
        let imageUrl = "";

        try {
          if (tokenURI) {
            const httpUrl = ipfsToHttp(tokenURI);
            const res = await fetch(httpUrl);
            if (res.ok) {
              metadata = await res.json();
              if (metadata?.image) {
                imageUrl = ipfsToHttp(metadata.image);
              }
            }
          }
        } catch (err) {
          console.error(`Failed to fetch metadata for token \${currentTokenId}`, err);
        }

        let finalCardData = { name: "", rarity: "", series: 0, cardNumber: 0 };
        if (Array.isArray(cardDataRaw)) {
          finalCardData = {
            name: String(cardDataRaw[0] || ""),
            rarity: String(cardDataRaw[1] || ""),
            series: Number(cardDataRaw[2] || 0),
            cardNumber: Number(cardDataRaw[3] || 0),
          };
        } else if (cardDataRaw && typeof cardDataRaw === "object") {
          const obj = cardDataRaw as CardDataRawObject;
          finalCardData = {
            name: obj.name || "",
            rarity: obj.rarity || "",
            series: Number(obj.series ?? 0n),
            cardNumber: Number(obj.cardNumber ?? 0n),
          };
        }

        let listing = null;
        if (Array.isArray(listingRaw)) {
          listing = {
            tokenId: Number(listingRaw[0] ?? 0),
            price: listingRaw[1] as bigint,
            seller: String(listingRaw[2] ?? ""),
            isActive: Boolean(listingRaw[3] ?? false),
          };
        } else if (listingRaw && typeof listingRaw === "object") {
          listing = {
            tokenId: Number(listingRaw.tokenId ?? 0),
            price: listingRaw.price as bigint,
            seller: String(listingRaw.seller ?? ""),
            isActive: Boolean(listingRaw.isActive ?? false),
          };
        }

        fetchedCards.push({
          tokenId: currentTokenId,
          tokenURI: tokenURI || "",
          imageUrl,
          metadata,
          cardData: finalCardData,
          owner: owner || "",
          listing: listing?.isActive ? listing : null,
        });

        currentTokenId++;
      }

      setCards(fetchedCards);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err : new Error("Failed to fetch cards"));
    } finally {
      setIsLoading(false);
    }
  }, [publicClient]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const refetch = useCallback(() => {
    fetchCards();
  }, [fetchCards]);

  return {
    cards,
    isLoading,
    error,
    refetch,
  };
}
