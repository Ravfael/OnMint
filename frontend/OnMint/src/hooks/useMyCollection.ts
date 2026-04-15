import { useState, useCallback, useEffect, useRef } from "react";
import { useAccount, usePublicClient } from "wagmi";
import type { Abi } from "viem";

import {
  POKEMON_CARD_ADDRESS,
  POKEMON_CARD_ABI,
} from "../contracts/addresses";
import type { PokemonCard } from "./usePokemonCards";

export function useMyCollection() {
  const { address: connectedAddress } = useAccount();
  const publicClient = usePublicClient();

  const [cards, setCards] = useState<PokemonCard[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // A manual trigger counter — incrementing forces a re-fetch
  const [fetchTrigger, setFetchTrigger] = useState(0);

  // Track mount state to avoid setting state after unmount
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchMyCards = useCallback(async () => {
    if (!publicClient || !connectedAddress) {
      setCards([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const fetchedCards: PokemonCard[] = [];
      const gateway =
        import.meta.env.VITE_PINATA_GATEWAY || "gateway.pinata.cloud";
      const ipfsToHttp = (url: string) => {
        if (!url) return "";
        return url.startsWith("ipfs://")
          ? `https://${gateway}/ipfs/${url.replace("ipfs://", "")}`
          : url;
      };

      // Use the same loop-until-revert pattern as usePokemonCards.
      // This doesn't depend on totalSupply (which can be cached/stale).
      let currentTokenId = 0;
      while (true) {
        let owner = "";
        try {
          owner = (await publicClient.readContract({
            address: POKEMON_CARD_ADDRESS as `0x${string}`,
            abi: POKEMON_CARD_ABI as Abi,
            functionName: "ownerOf",
            args: [BigInt(currentTokenId)],
          })) as string;
        } catch {
          // ownerOf reverts when token doesn't exist → we've reached the end
          break;
        }

        // Check if this token belongs to the connected wallet
        if (owner.toLowerCase() === connectedAddress.toLowerCase()) {
          try {
            const [tokenURI, cardDataRaw] = await Promise.all([
              publicClient
                .readContract({
                  address: POKEMON_CARD_ADDRESS as `0x${string}`,
                  abi: POKEMON_CARD_ABI as Abi,
                  functionName: "tokenURI",
                  args: [BigInt(currentTokenId)],
                })
                .catch(() => "") as Promise<string>,
              publicClient
                .readContract({
                  address: POKEMON_CARD_ADDRESS as `0x${string}`,
                  abi: POKEMON_CARD_ABI as Abi,
                  functionName: "cardData",
                  args: [BigInt(currentTokenId)],
                })
                .catch(() => null) as Promise<{
                name: string;
                rarity: string;
                series: bigint;
                cardNumber: bigint;
              } | null>,
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

            // Parse cardData (may come back as array or object depending on viem version)
            let finalCardData = {
              name: "",
              rarity: "",
              series: 0,
              cardNumber: 0,
            };
            if (Array.isArray(cardDataRaw)) {
              finalCardData = {
                name: String((cardDataRaw as unknown[])[0] || ""),
                rarity: String((cardDataRaw as unknown[])[1] || ""),
                series: Number((cardDataRaw as unknown[])[2] || 0),
                cardNumber: Number((cardDataRaw as unknown[])[3] || 0),
              };
            } else if (cardDataRaw && typeof cardDataRaw === "object") {
              finalCardData = {
                name: cardDataRaw.name || "",
                rarity: cardDataRaw.rarity || "",
                series: Number(cardDataRaw.series ?? 0n),
                cardNumber: Number(cardDataRaw.cardNumber ?? 0n),
              };
            }

            fetchedCards.push({
              tokenId: currentTokenId,
              tokenURI: tokenURI || "",
              imageUrl,
              metadata,
              cardData: finalCardData,
              owner,
            });
          } catch (err) {
            console.error(
              `Error fetching data for token ${currentTokenId}:`,
              err
            );
          }
        }

        currentTokenId++;
      }

      if (isMounted.current) {
        setCards(fetchedCards);
      }
    } catch (err: unknown) {
      console.error("Error fetching my collection:", err);
      if (isMounted.current) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch collection")
        );
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [publicClient, connectedAddress, fetchTrigger]);

  // Fetch whenever dependencies change
  useEffect(() => {
    fetchMyCards();
  }, [fetchMyCards]);

  // Force a fresh fetch every time the component mounts (page navigation)
  useEffect(() => {
    setFetchTrigger((prev) => prev + 1);
  }, []);

  const refetch = useCallback(() => {
    setFetchTrigger((prev) => prev + 1);
  }, []);

  return {
    cards,
    isLoading,
    error,
    refetch,
    totalOwned: cards.length,
  };
}
