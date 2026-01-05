import { DexQuote, SwapParams, DexSwapResult } from "./dex.types";
import { executeMeteoraSwap, getMeteraQuote } from "./meteora";
import { executeRaydiumSwap, getRaydiumQuote } from "./raydium";



export async function getBestQuote(params: SwapParams) : Promise<DexQuote> {
  console.log(`Getting best quote for ${params.amountIn} ${params.tokenIn} -> ${params.tokenOut}`)

  try {
    const [raydiumQuote, meteoraQuote] = await Promise.all([
      getRaydiumQuote(params),
      getMeteraQuote(params),
    ]);

    const raydiumNet = raydiumQuote.estimatedOutput - raydiumQuote.estimatedFees;
    const meteoraNet = meteoraQuote.estimatedOutput - meteoraQuote.estimatedFees;

    const bestQuote = raydiumNet >= meteoraNet ? raydiumQuote : meteoraQuote;

    return bestQuote
  }
  catch(err) {
    console.log(`Error getting best quote: ${err}`)

    throw new Error(`Failed to get best quote: ${(err as Error).message}`);
  }
}

export async function executeBestSwap(params: SwapParams, quote: DexQuote) : Promise<DexSwapResult> {
  console.log(`Executing best swap for ${params.amountIn} ${params.tokenIn} -> ${params.tokenOut}`)

  try {
    if(quote.venue === "raydium") {
      return await executeRaydiumSwap(params, quote.price);
    }
    else if(quote.venue === "meteora") {
      return await executeMeteoraSwap(params);
    }
    else {
      throw new Error(`Unsupported execution venue: ${quote.venue}`);
    }
  }
  catch(err) {
    console.log(`Error executing best swap: ${err}`)

    throw new Error(`Failed to execute best swap: ${(err as Error).message}`);
  }
}