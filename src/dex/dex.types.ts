export type ExecutionVenue = "raydium" | "meteora";

export interface DexQuote {
  venue: ExecutionVenue;
  price: number;
  estimatedOutput: number;
  estimatedFees: number;
  timestamp: string;
  walletAddress: string;
}

export interface SwapParams {
  tokenIn: string;
  tokenOut: string;
  amountIn: number;
  walletAddress: string;
}

export interface DexSwapResult {
  txHash: string;
  executedPrice: number;
  amountOut: number;
  venue: ExecutionVenue;
  timestamp: string;
  walletAddress: string;
}