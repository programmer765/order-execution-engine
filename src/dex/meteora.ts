import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { ENV } from "../config/env";
import bs58 from "bs58";
import { AmmImpl } from "@meteora-ag/dynamic-amm-sdk";
import { DexQuote, DexSwapResult, SwapParams } from "./dex.types";


const DEVNET_RPC = ENV.SOLANA_RPC_URL;
const PRIVATE_KEY = ENV.PRIVATE_KEY;
const SLIPPAGE_TOLERANCE = ENV.SLIPPAGE_TOLERANCE;
const METEORA_API_URL = ENV.METEORA_API_URL;


const connection = new Connection(DEVNET_RPC, "confirmed");
const wallet = Keypair.fromSecretKey(
  bs58.decode(PRIVATE_KEY)
);


async function getPool(inputMint: string, outputMint: string) {
  const url = `${METEORA_API_URL}?token_a_mint=${inputMint}&token_b_mint=${outputMint}`;
  const res : Response = await fetch(url)
  if(!res.ok) throw new Error(`Failed to fetch pool data: ${res.statusText}`);

  const { data } = await res.json() as { data: any[] }
  const pool = data[0]
  const { pool_address } = pool
  console.log(pool)
  return pool_address 
}


async function getMeteraQuote(params: SwapParams) : Promise<DexQuote> {
  console.log(`Meteora getting quote for ${params.amountIn} ${params.tokenIn} -> ${params.tokenOut}`)

  try {
    const inputMint = new PublicKey(params.tokenIn);
    const outputMint = new PublicKey(params.tokenOut);

    const poolAddress = await getPool(inputMint.toString(), outputMint.toString());
    const poolState = new PublicKey(poolAddress);
    const pool = await AmmImpl.create(connection, poolState)

    const quote = pool.getSwapQuote(
      inputMint,
      BigInt(params.amountIn),
      SLIPPAGE_TOLERANCE / 100
    )
    const price = Number(quote.swapOutAmount) / Number(params.amountIn)
    const estimatedFees = 0.0025

    return {
      venue: "meteora",
      price,
      estimatedOutput: Number(quote.swapOutAmount),
      estimatedFees,
      timestamp: new Date().toISOString(),
    }

  }
  catch(err) {
    console.log(`Meteora Quote failed: ${err}`)

    throw new Error(`Failed to get Meteora quote: ${(err as Error).message}`);
  }
} 


async function executeMeteoraSwap(params: SwapParams) : Promise<DexSwapResult> {
  console.log(`Meteora executing swap for ${params.amountIn} ${params.tokenIn} -> ${params.tokenOut}`)

  try {
    const inputMint = new PublicKey(params.tokenIn);
    const outputMint = new PublicKey(params.tokenOut);
    
    const poolAddress = await getPool(inputMint.toString(), outputMint.toString());
    const poolState = new PublicKey(poolAddress);
    const pool = await AmmImpl.create(connection, poolState)

    const minAmountOut = Math.floor(params.amountIn * (1 - SLIPPAGE_TOLERANCE / 100));

    const swapTx = await pool.swap(
      wallet.publicKey,
      inputMint,
      BigInt(params.amountIn),
      BigInt(minAmountOut)
    )

    swapTx.sign(wallet);
    const txHash = await connection.sendRawTransaction(swapTx.serialize(), { 
      skipPreflight: false
    });
    
    const lastestBlockhash = await connection.getLatestBlockhash("confirmed");
    const confirmation = await connection.confirmTransaction({
      signature: txHash,
      blockhash: lastestBlockhash.blockhash,
      lastValidBlockHeight: lastestBlockhash.lastValidBlockHeight
    }, "confirmed");

    if(confirmation.value.err) {
      throw new Error(`Meteora swap transaction failed: ${JSON.stringify(confirmation.value.err)}`);
    }

    console.log(`[Meteora] Swap executed: ${txHash}`)

    return {
      txHash,
      executedPrice: Number(params.amountIn) / Number(minAmountOut),
      amountOut: Number(minAmountOut),
      venue: "meteora",
      timestamp: new Date().toISOString(),
    }
  }
  catch(err) {
    console.log(`Meteora Swap failed: ${err}`)

    throw new Error(`Failed to execute Meteora swap: ${(err as Error).message}`);
  }
}