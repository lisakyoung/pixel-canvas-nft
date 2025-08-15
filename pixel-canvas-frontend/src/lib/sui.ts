import { SuiClient, getFullnodeUrl } from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions";

const PACKAGE_ID =
  process.env.NEXT_PUBLIC_PACKAGE_ID ||
  "0x1a0c4327a526617b2a6d13c2f991e375957bc8120bb83c95e0bdcaa14e565463";
const CANVAS_MODULE = process.env.NEXT_PUBLIC_MODULE_CANVAS || "canvas";
const NFT_MODULE = process.env.NEXT_PUBLIC_MODULE_NFT || "pixel_nft";
const AUCTION_MODULE = process.env.NEXT_PUBLIC_MODULE_AUCTION || "auction";
const DISTRIBUTION_MODULE =
  process.env.NEXT_PUBLIC_MODULE_DISTRIBUTION || "distribution";
const NETWORK = (process.env.NEXT_PUBLIC_SUI_NETWORK || "devnet") as
  | "devnet"
  | "testnet"
  | "mainnet";

// Initialize Sui Client
export const suiClient = new SuiClient({
  url: getFullnodeUrl(NETWORK),
});

// Types
export interface PixelData {
  position: number;
  color: number;
  owner: string;
  timestamp: number;
}

export interface CanvasData {
  id: string;
  pixels: PixelData[];
  totalPainted: number;
  isCompleted: boolean;
  pixelPrice: string;
  contributors: Map<string, number>;
}

export interface AuctionData {
  id: string;
  nftId: string;
  currentBid: string;
  highestBidder: string | null;
  endTime: number;
  ended: boolean;
}

// Canvas Functions
export function createCanvas(pixelPrice: number): TransactionBlock {
  const tx = new TransactionBlock();

  tx.moveCall({
    target: `${PACKAGE_ID}::${CANVAS_MODULE}::create_canvas`,
    arguments: [tx.pure(pixelPrice)],
  });

  return tx;
}

export function paintPixel(
  canvasId: string,
  position: number,
  color: number,
  payment: string
): TransactionBlock {
  const tx = new TransactionBlock();

  tx.moveCall({
    target: `${PACKAGE_ID}::${CANVAS_MODULE}::paint_pixel`,
    arguments: [
      tx.object(canvasId),
      tx.pure(position),
      tx.pure(color),
      tx.object(payment),
    ],
  });

  return tx;
}

export async function getCanvas(canvasId: string): Promise<CanvasData | null> {
  try {
    const object = await suiClient.getObject({
      id: canvasId,
      options: {
        showContent: true,
        showType: true,
      },
    });

    if (!object.data || !("content" in object.data) || !object.data.content) {
      return null;
    }

    const content = object.data.content as any;
    const fields = content.fields;

    // Parse pixels from the table
    const pixels: PixelData[] = [];
    if (fields.pixels && fields.pixels.fields) {
      const pixelTable = fields.pixels.fields.contents || [];
      pixelTable.forEach((entry: any) => {
        if (entry.fields) {
          pixels.push({
            position: parseInt(entry.fields.key),
            color: parseInt(entry.fields.value.fields.color),
            owner: entry.fields.value.fields.owner,
            timestamp: parseInt(entry.fields.value.fields.timestamp),
          });
        }
      });
    }

    // Parse contributors
    const contributors = new Map<string, number>();
    if (fields.contributors && fields.contributors.fields) {
      const contribTable = fields.contributors.fields.contents || [];
      contribTable.forEach((entry: any) => {
        if (entry.fields) {
          contributors.set(entry.fields.key, parseInt(entry.fields.value));
        }
      });
    }

    return {
      id: canvasId,
      pixels,
      totalPainted: parseInt(fields.total_painted || "0"),
      isCompleted: fields.is_completed || false,
      pixelPrice: fields.pixel_price || "0",
      contributors,
    };
  } catch (error) {
    console.error("Error fetching canvas:", error);
    return null;
  }
}

// Auction Functions
export function createAuction(
  nftId: string,
  startPrice: number,
  duration: number
): TransactionBlock {
  const tx = new TransactionBlock();

  tx.moveCall({
    target: `${PACKAGE_ID}::${AUCTION_MODULE}::create_auction`,
    arguments: [
      tx.object(nftId),
      tx.pure(startPrice),
      tx.pure(duration),
      tx.object("0x6"), // Clock object
    ],
  });

  return tx;
}

export function placeBid(
  auctionId: string,
  bidAmount: string
): TransactionBlock {
  const tx = new TransactionBlock();

  const [coin] = tx.splitCoins(tx.gas, [tx.pure(bidAmount)]);

  tx.moveCall({
    target: `${PACKAGE_ID}::${AUCTION_MODULE}::place_bid`,
    arguments: [
      tx.object(auctionId),
      coin,
      tx.object("0x6"), // Clock object
    ],
  });

  return tx;
}

export async function getAuction(
  auctionId: string
): Promise<AuctionData | null> {
  try {
    const object = await suiClient.getObject({
      id: auctionId,
      options: {
        showContent: true,
      },
    });

    if (!object.data || !("content" in object.data) || !object.data.content) {
      return null;
    }

    const content = object.data.content as any;
    const fields = content.fields;

    return {
      id: auctionId,
      nftId: fields.nft_id || "",
      currentBid: fields.current_bid || "0",
      highestBidder: fields.highest_bidder || null,
      endTime: parseInt(fields.end_time || "0"),
      ended: fields.ended || false,
    };
  } catch (error) {
    console.error("Error fetching auction:", error);
    return null;
  }
}

// NFT Functions
export function mintNFT(
  canvasId: string,
  adminCapId: string,
  name: string,
  description: string,
  imageUrl: string,
  creatorsCount: number
): TransactionBlock {
  const tx = new TransactionBlock();

  tx.moveCall({
    target: `${PACKAGE_ID}::${NFT_MODULE}::mint_from_canvas`,
    arguments: [
      tx.object(canvasId),
      tx.object(adminCapId),
      tx.pure(name),
      tx.pure(description),
      tx.pure(imageUrl),
      tx.pure(creatorsCount),
    ],
  });

  return tx;
}

// Distribution Functions
export function createDistributionPool(
  canvasId: string,
  totalAmount: number
): TransactionBlock {
  const tx = new TransactionBlock();

  const [coin] = tx.splitCoins(tx.gas, [tx.pure(totalAmount)]);

  tx.moveCall({
    target: `${PACKAGE_ID}::${DISTRIBUTION_MODULE}::create_distribution_pool`,
    arguments: [tx.object(canvasId), coin],
  });

  return tx;
}

export function claimRewards(
  poolId: string,
  canvasId: string
): TransactionBlock {
  const tx = new TransactionBlock();

  tx.moveCall({
    target: `${PACKAGE_ID}::${DISTRIBUTION_MODULE}::claim_rewards`,
    arguments: [tx.object(poolId), tx.object(canvasId)],
  });

  return tx;
}

// Helper function to execute transaction
export async function executeTransaction(
  tx: TransactionBlock,
  signAndExecuteTransactionBlock: any
): Promise<any> {
  try {
    const result = await signAndExecuteTransactionBlock({
      transactionBlock: tx,
      options: {
        showEffects: true,
        showObjectChanges: true,
      },
    });

    return result;
  } catch (error) {
    console.error("Transaction failed:", error);
    throw error;
  }
}

// Get user's SUI balance
export async function getUserBalance(address: string): Promise<string> {
  try {
    const balance = await suiClient.getBalance({
      owner: address,
      coinType: "0x2::sui::SUI",
    });

    return balance.totalBalance;
  } catch (error) {
    console.error("Error fetching balance:", error);
    return "0";
  }
}

// Get user's coins for payment
export async function getUserCoins(address: string) {
  try {
    const coins = await suiClient.getCoins({
      owner: address,
      coinType: "0x2::sui::SUI",
    });

    return coins.data;
  } catch (error) {
    console.error("Error fetching coins:", error);
    return [];
  }
}
