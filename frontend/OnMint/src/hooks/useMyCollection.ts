import { useState, useCallback, useEffect } from "react";
import { useAccount, useReadContract, usePublicClient } from "wagmi";
import type { Abi } from "viem";

import { POKEMON_CARD_ADDRESS, POKEMON_CARD_ABI } from "../contracts/addresses";
import type { PokemonCard } from "./usePokemonCards";

export function useMyCollection() {
  const { address: connectedAddress } = useAccount();
  const publicClient = usePublicClient();

  const [cards, setCards] = useState<PokemonCard[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // 1. Call totalSupply() on contract
  const { data: totalSupplyRaw, refetch: refetchTotalSupply } = useReadContract({
    address: POKEMON_CARD_ADDRESS as `0x${string}`,
    abi: POKEMON_CARD_ABI as Abi,
    functionName: "totalSupply",
  });

  const totalSupply = totalSupplyRaw ? Number(totalSupplyRaw) : 0;
  const totalOwned = cards.length;

  const fetchMyCards = useCallback(async () => {
    // If wallet not connected or no data
    if (!publicClient || !connectedAddress || totalSupply === 0) {
      setCards([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const fetchedCards: PokemonCard[] = [];
      const gateway = import.meta.env.VITE_PINATA_GATEWAY || "gateway.pinata.cloud";
      const ipfsToHttp = (url: string) => {
        if (!url) return "";
        return url.startsWith("ipfs://") ? `https://${gateway}/ipfs/${url.replace("ipfs://", "")}` : url;
      };

      // 2. Loop tokenId from 1 to totalSupply
      for (let tokenId = 1; tokenId <= totalSupply; tokenId++) {
        try {
          // 3. For each tokenId call ownerOf(tokenId)
          const owner = (await publicClient.readContract({
            address: POKEMON_CARD_ADDRESS as `0x${string}`,
            abi: POKEMON_CARD_ABI as Abi,
            functionName: "ownerOf",
            args: [BigInt(tokenId)],
          })) as string;

          // 4. If ownerOf === connected wallet address (case-insensitive)
          if (owner.toLowerCase() === connectedAddress.toLowerCase()) {
            // 5. Fetch tokenURI, cardData
            const [tokenURI, cardDataRaw] = await Promise.all([
              publicClient
                .readContract({
                  address: POKEMON_CARD_ADDRESS as `0x${string}`,
                  abi: POKEMON_CARD_ABI as Abi,
                  functionName: "tokenURI",
                  args: [BigInt(tokenId)],
                })
                .catch(() => "") as Promise<string>,
              publicClient
                .readContract({
                  address: POKEMON_CARD_ADDRESS as `0x${string}`,
                  abi: POKEMON_CARD_ABI as Abi,
                  functionName: "cardData",
                  args: [BigInt(tokenId)],
                })
                .catch(() => null) as Promise<{ name: string; rarity: string; series: bigint; cardNumber: bigint } | null>,
            ]);

            let metadata = null;
            let imageUrl = "";

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

            // Include card
            fetchedCards.push({
              tokenId,
              tokenURI,
              imageUrl,
              metadata,
              cardData: cardDataRaw
                ? {
                    name: cardDataRaw.name,
                    rarity: cardDataRaw.rarity,
                    series: Number(cardDataRaw.series),
                    cardNumber: Number(cardDataRaw.cardNumber),
                  }
                : { name: "", rarity: "", series: 0, cardNumber: 0 },
              owner,
            });
          }
        } catch (err) {
          // Mute error for disconnected token ids (if burned/missing)
        }
      }

      setCards(fetchedCards);
    } catch (err: unknown) {
      console.error("Error fetching my collection:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch collection"));
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, connectedAddress, totalSupply]);

  useEffect(() => {
    fetchMyCards();
  }, [fetchMyCards]);

  const refetch = useCallback(() => {
    refetchTotalSupply();
    fetchMyCards();
  }, [refetchTotalSupply, fetchMyCards]);

  return {
    cards,
    isLoading,
    error,
    refetch,
    totalOwned,
  };
}
