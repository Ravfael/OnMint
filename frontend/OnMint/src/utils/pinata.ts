export type NFTMetadata = {
  name: string;
  description: string;
  image: string;
  attributes: Array<{ trait_type: string; value: string }>;
};

const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

export const uploadImageToPinata = async (file: File): Promise<string> => {
  if (!PINATA_JWT) {
    throw new Error("Pinata JWT is not defined in environment variables");
  }

  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`Error uploading image: ${res.statusText}`);
    }

    const data = await res.json();
    return `ipfs://${data.IpfsHash}`;
  } catch (error) {
    console.error("Error uploading image to Pinata:", error);
    throw error;
  }
};

export const uploadMetadataToPinata = async (metadata: NFTMetadata): Promise<string> => {
  if (!PINATA_JWT) {
    throw new Error("Pinata JWT is not defined in environment variables");
  }

  try {
    const data = JSON.stringify({
      pinataContent: metadata,
      pinataMetadata: {
        name: metadata.name,
      },
    });

    const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: data,
    });

    if (!res.ok) {
      throw new Error(`Error uploading metadata: ${res.statusText}`);
    }

    const responseData = await res.json();
    return `ipfs://${responseData.IpfsHash}`;
  } catch (error) {
    console.error("Error uploading metadata to Pinata:", error);
    throw error;
  }
};
