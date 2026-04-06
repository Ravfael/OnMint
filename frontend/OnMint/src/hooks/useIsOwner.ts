import { useAccount, useReadContract } from "wagmi";
import type { Abi } from "viem";

import { POKEMON_CARD_ABI, POKEMON_CARD_ADDRESS } from "../contracts/addresses";

type UseIsOwnerResult = {
  isOwner: boolean;
  isLoading: boolean;
  ownerAddress: string | undefined;
};

export function useIsOwner(): UseIsOwnerResult {
  const { address } = useAccount();

  const { data, isLoading } = useReadContract({
    address: POKEMON_CARD_ADDRESS as `0x${string}`,
    abi: POKEMON_CARD_ABI as Abi,
    functionName: "owner",
  });

  const ownerAddress = typeof data === "string" ? data : undefined;
  const adminWallet = import.meta.env.VITE_ADMIN_WALLET_ADDRESS;

  const isOwner =
    (typeof address === "string" && typeof ownerAddress === "string" && ownerAddress.toLowerCase() === address.toLowerCase()) || (typeof address === "string" && !!adminWallet && address.toLowerCase() === adminWallet.toLowerCase());

  return {
    isOwner,
    isLoading,
    ownerAddress,
  };
}
