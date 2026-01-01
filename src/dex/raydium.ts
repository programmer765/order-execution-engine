import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { ENV } from "../config/env";
import { Raydium, TxVersion } from "@raydium-io/raydium-sdk-v2";
import { DexQuote, DexSwapResult, SwapParams } from "./dex.types";
import bs58 from "bs58";


const DEVNET_RPC = ENV.SOLANA_RPC_URL
const PRIVATE_KEY = ENV.PRIVATE_KEY
const SLIPPAGE_TOLERANCE = ENV.SLIPPAGE_TOLERANCE

const connection = new Connection(DEVNET_RPC, "confirmed");

let raydiumInstance: Raydium | null = null;
const wallet = Keypair.fromSecretKey(
  bs58.decode(PRIVATE_KEY)
)

export async function getRaydiumInstance(): Promise<Raydium> {
  if(!raydiumInstance) {
    raydiumInstance = await Raydium.load({ 
      connection,
      cluster: "devnet",
      disableFeatureCheck: true,
      disableLoadToken: false,
     })
  }
  return raydiumInstance;
}

async function getPool(inputMint: PublicKey, outputMint: PublicKey) {
  const raydium = await getRaydiumInstance();
  const pools = await raydium.api.fetchPoolByMints({
    mint1: inputMint,
    mint2: outputMint,
  })

  if(!pools || pools.data.length === 0) {
    throw new Error(`No pool found for ${inputMint.toString()} and ${outputMint.toString()}`);
  }

  const poolId = new PublicKey(pools.data[0].id)

  return poolId;

}

export async function getRaydiumQuote(params: SwapParams) : Promise<DexQuote> {
  console.log(`[Raydium] Getting quote for ${params.amountIn} ${params.tokenIn} -> ${params.tokenOut}`);

  try {
    const raydium = await getRaydiumInstance();

    const inputMint = new PublicKey(params.tokenIn);
    const outputMint = new PublicKey(params.tokenOut);
    
    const poolId = await getPool(inputMint, outputMint);

    const { poolInfo } = await raydium.liquidity.getPoolInfoFromRpc({
      poolId: poolId.toString(),
    })

    const { amountOut } = raydium.liquidity.computeAmountOut({
      poolInfo,
      amountIn: BigInt(params.amountIn),
      mintIn: inputMint.toString(),
      mintOut: outputMint.toString(),
      slippage: SLIPPAGE_TOLERANCE / 100,
    })

    const price = Number(amountOut) / Number(params.amountIn);
    const estimatedFees = 0; // Raydium does not provide fee estimation in this SDK

    console.log(`[Raydium] Quote: price=${price.toFixed(6)}, estimatedOutput=${amountOut}, estimatedFees=${estimatedFees}`);

    return {
      venue: "raydium",
      price,
      estimatedOutput: Number(amountOut),
      estimatedFees,
      timestamp: new Date().toISOString(),
    }

  }
  catch (err) {
    console.error(`[Raydium] Error getting quote: ${(err as Error).message}`);
    throw new Error(`Raydium quote error: ${(err as Error).message}`);
  }
}


export async function executeRaydiumSwap(params: SwapParams, quotedPrice: number): Promise<DexSwapResult> {
  const amountIn = BigInt(params.amountIn);
  const inputMint = new PublicKey(params.tokenIn);
  const outputMint = new PublicKey(params.tokenOut);

  console.log(`[Raydium] Executing swap for ${params.amountIn} ${params.tokenIn} -> ${params.tokenOut}`);

  try {
    const raydium = await getRaydiumInstance();

    const poolId = await getPool(inputMint, outputMint);
    
    const { poolInfo, poolKeys } = await raydium.liquidity.getPoolInfoFromRpc({
      poolId: poolId.toString(),
    })

    const { minAmountOut } = raydium.liquidity.computeAmountOut({
      poolInfo, 
      amountIn,
      mintIn: inputMint.toString(),
      mintOut: outputMint.toString(),
      slippage: SLIPPAGE_TOLERANCE / 100,
    })

    const { transaction } = await raydium.liquidity.swap({
      poolInfo,
      poolKeys,
      amountIn,
      amountOut: minAmountOut,
      inputMint: inputMint.toString(),
      fixedSide: "in",
      txVersion: TxVersion.V0
    })
    
    // sign transaction
    transaction.sign([wallet]);

    // send and confirm transaction
    const txHash = await connection.sendTransaction(transaction, { skipPreflight: false, preflightCommitment: "confirmed" });
    const latestBlockhash = await connection.getLatestBlockhash("confirmed");

    await connection.confirmTransaction({
      signature: txHash,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    }, "confirmed");
    console.log(`[Raydium] Swap executed: txHash=${txHash}`);

    return {
      txHash,
      executedPrice: quotedPrice,
      amountOut: Number(minAmountOut),
      venue: "raydium",
      timestamp: new Date().toISOString(),
    }
  } catch (err) {
    console.error(`[Raydium] Error executing swap: ${(err as Error).message}`);
    throw new Error(`Raydium swap error: ${(err as Error).message}`);
  }
}