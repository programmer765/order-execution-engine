import "dotenv/config";

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  NODE_ENV: process.env.NODE_ENV || "development",
  REDIS_URL: process.env.REDIS_URL || "redis://127.0.0.1:6379",
  SOLANA_RPC_URL: process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com",
  SLIPPAGE_TOLERANCE: process.env.SLIPPAGE_TOLERANCE ? parseFloat(process.env.SLIPPAGE_TOLERANCE) : 1.0,
}
