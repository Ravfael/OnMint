import React, { useEffect, useState } from "react";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";

import { MintProgressBar } from "../components/MintProgressBar";
import { POKEMON_CARD_ABI, POKEMON_CARD_ADDRESS } from "../contracts/addresses";
import { useIsOwner } from "../hooks/useIsOwner";
import { type NFTMetadata, uploadImageToPinata, uploadMetadataToPinata } from "../utils/pinata";

type Rarity = "Common" | "Rare" | "Ultra Rare";

export function AdminPage() {
  const { isConnected, address } = useAccount();
  const { isOwner, isLoading: isOwnerCheckLoading } = useIsOwner();
  const { writeContract, data: txHash, error: writeError, isPending: isWritePending } = useWriteContract();

  const {
    isLoading: isTxConfirmationLoading,
    isSuccess: isTxSuccess,
    error: txError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [cardName, setCardName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [rarity, setRarity] = useState<Rarity>("Common");
  const [series, setSeries] = useState<number>(1);
  const [cardNumber, setCardNumber] = useState<number>(1);
  const [cardImage, setCardImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (address && !recipientAddress) {
      setRecipientAddress(address);
    }
  }, [address, recipientAddress]);

  useEffect(() => {
    if (isWritePending) {
      setCurrentStep(3);
    }
  }, [isWritePending]);

  useEffect(() => {
    if (txHash && isTxConfirmationLoading) {
      setCurrentStep(4);
    }
  }, [txHash, isTxConfirmationLoading]);

  useEffect(() => {
    if (isTxSuccess) {
      setCurrentStep(5);
    }
  }, [isTxSuccess]);

  useEffect(() => {
    if (writeError || txError) {
      setCurrentStep(0);
      setErrorMsg(writeError?.message || txError?.message || "Transaction failed");
    }
  }, [writeError, txError]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCardImage(file);
      const url = URL.createObjectURL(file);
      setImagePreviewUrl(url);
    }
  };

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardImage || !cardName || !recipientAddress || series < 1 || cardNumber < 1) {
      setErrorMsg("Please fill out all required fields.");
      return;
    }

    try {
      setErrorMsg(null);
      setCurrentStep(1);
      const imageIpfsUrl = await uploadImageToPinata(cardImage);

      setCurrentStep(2);
      const metadata: NFTMetadata = {
        name: cardName,
        description,
        image: imageIpfsUrl,
        attributes: [
          { trait_type: "Rarity", value: rarity },
          { trait_type: "Series", value: series.toString() },
          { trait_type: "Card Number", value: cardNumber.toString() },
        ],
      };
      const metadataIpfsUrl = await uploadMetadataToPinata(metadata);

      setCurrentStep(3);
      writeContract({
        address: POKEMON_CARD_ADDRESS as `0x${string}`,
        abi: POKEMON_CARD_ABI,
        functionName: "mintCard",
        args: [
          recipientAddress as `0x${string}`,
          metadataIpfsUrl,
          {
            name: cardName,
            rarity: rarity,
            series: BigInt(series),
            cardNumber: BigInt(cardNumber),
          },
        ],
      });
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : "An error occurred during minting.");
      setCurrentStep(0);
    }
  };

  const resetForm = () => {
    setCardName("");
    setDescription("");
    setRarity("Common");
    setSeries(1);
    setCardNumber(1);
    setCardImage(null);
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImagePreviewUrl(null);
    setCurrentStep(0);
    setErrorMsg(null);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-white/10 text-white p-8 rounded-xl shadow-lg text-center max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4">Admin Access</h2>
          <p className="text-gray-400">Please connect your wallet to continue.</p>
        </div>
      </div>
    );
  }

  if (isOwnerCheckLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-red-900/20 border border-red-500 text-red-500 p-8 rounded-xl shadow-lg text-center max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4">Access Denied 🚫</h2>
          <p>You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-gray-100 pt-32 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 mt-15 text-center text-[#6c63ff]">Pokemon NFT Minting</h1>

        {currentStep > 0 && currentStep < 5 && (
          <div className="mb-8">
            <MintProgressBar currentStep={currentStep} />
          </div>
        )}

        <div className="bg-gray-900 border border-white/10 p-6 sm:p-8 rounded-xl shadow-2xl">
          {isTxSuccess ? (
            <div className="text-center py-12">
              <div className="text-green-400 text-6xl mb-4">✅</div>
              <h2 className="text-3xl font-bold mb-4">Minted Successfully!</h2>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Your Pokemon card NFT has been successfully minted to the blockchain.
                <br />
                <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noreferrer" className="text-[#6c63ff] hover:underline mt-2 inline-block">
                  View on Etherscan
                </a>
              </p>
              <button onClick={resetForm} className="bg-[#6c63ff] hover:bg-[#5b54e5] text-white font-bold py-3 px-8 rounded-lg transition-colors">
                Mint Another Card
              </button>
            </div>
          ) : (
            <form onSubmit={handleMint} className="space-y-6">
              {errorMsg && (
                <div className="bg-red-900/30 border border-red-500 text-red-400 p-4 rounded-lg mb-6 flex justify-between items-center">
                  <span>{errorMsg}</span>
                  {currentStep === 0 && (
                    <button type="button" onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-white">
                      ✕
                    </button>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Image Reference</label>
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-xl bg-[#1e1e1e] hover:border-[#6c63ff] transition-colors relative h-[300px] overflow-hidden">
                      {imagePreviewUrl ? (
                        <img src={imagePreviewUrl} alt="Card Preview" className="w-full h-full object-contain aspect-[3/4]" />
                      ) : (
                        <div className="text-center p-4">
                          <p className="text-gray-400 text-sm mb-2">Drag and drop or click to upload</p>
                          <p className="text-gray-500 text-xs">(Must be 3:4 aspect ratio)</p>
                        </div>
                      )}
                      <input type="file" accept="image/*" onChange={handleImageChange} disabled={currentStep > 0} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" required />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Recipient Address</label>
                    <input
                      type="text"
                      value={recipientAddress}
                      onChange={(e) => setRecipientAddress(e.target.value)}
                      disabled={currentStep > 0}
                      className="w-full bg-[#1e1e1e] border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-[#6c63ff] disabled:opacity-50"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Card Name</label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      disabled={currentStep > 0}
                      className="w-full bg-[#1e1e1e] border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-[#6c63ff] disabled:opacity-50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      disabled={currentStep > 0}
                      rows={3}
                      className="w-full bg-[#1e1e1e] border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-[#6c63ff] disabled:opacity-50 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Rarity</label>
                    <select
                      value={rarity}
                      onChange={(e) => setRarity(e.target.value as Rarity)}
                      disabled={currentStep > 0}
                      className="w-full bg-[#1e1e1e] border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-[#6c63ff] disabled:opacity-50 appearance-none"
                    >
                      <option value="Common">Common</option>
                      <option value="Rare">Uncommon</option>
                      <option value="Ultra Rare">Rare</option>
                      <option value="Ultra Rare">Ultra Rare</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Series Number</label>
                      <input
                        type="number"
                        min="1"
                        value={series}
                        onChange={(e) => setSeries(parseInt(e.target.value))}
                        disabled={currentStep > 0}
                        className="w-full bg-[#1e1e1e] border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-[#6c63ff] disabled:opacity-50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Card Number</label>
                      <input
                        type="number"
                        min="1"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(parseInt(e.target.value))}
                        disabled={currentStep > 0}
                        className="w-full bg-[#1e1e1e] border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-[#6c63ff] disabled:opacity-50"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-700">
                <button
                  type="submit"
                  disabled={currentStep > 0}
                  className="w-full bg-[#6c63ff] hover:bg-[#5b54e5] text-white font-bold py-4 rounded-lg transition-colors flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {currentStep === 0 ? "Mint Card" : currentStep === 1 ? "Uploading Image..." : currentStep === 2 ? "Uploading Metadata..." : currentStep === 3 ? "Confirming Wallet..." : "Minting..."}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
