import IORedis from 'ioredis';
import { Worker, Job } from 'bullmq';
import { ENV } from '../config/env.js';
import { sendStatusUpdate } from '../websocket/socket.registry.js';
import { OrderStatus } from '../modules/orders/order.types.js';
import { OrderJobData } from './order.types';


async function simulatePhase(delayMs: number) : Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}


const connection = new IORedis(ENV.REDIS_URL);

export const orderWorker = new Worker<OrderJobData>('order-execution', async (job: Job<OrderJobData>) => {
  const { orderId, tokenIn, tokenOut, amount, walletAddress } = job.data;
  try {
    console.log(`[Worker] Processing order ${orderId}`)
    console.log(`[Worker] ${orderId} - Starting ROUTING phase`)
    sendStatusUpdate({ status: OrderStatus.ROUTING, orderId: orderId });
    await simulatePhase(500);

    console.log(`[Worker] ${orderId} - Starting BUILDING phase`)
    sendStatusUpdate({ status: OrderStatus.BUILDING, orderId: orderId, venue: "raydium" });
    await simulatePhase(1000);

    console.log(`[Worker] ${orderId} - Starting SUBMITTED phase`)
    sendStatusUpdate({ status: OrderStatus.SUBMITTED, orderId: orderId, venue: "raydium" });
    await simulatePhase(500);

    console.log(`[Worker] ${orderId} - Starting CONFIRMED phase`)
    sendStatusUpdate({ 
      status: OrderStatus.CONFIRMED, 
      orderId: orderId, venue: "raydium", 
      executedPrice: 1.2345, 
      txHash: "0xabc123def456" 
    });
    
    console.log(`[Worker] Completed order ${orderId}`)
    return { success: true };
  } catch (error) {
    console.error(`[Worker] Error processing order ${orderId}:`, error);
    sendStatusUpdate({ status: OrderStatus.FAILED, orderId: orderId, });
    throw error;
  } 
}, 
{
  connection,
  concurrency: 10, // Process up to 10 jobs concurrently
})

orderWorker.on('completed', (job) => {
  console.log(`[Worker] Job for order ${job.data.orderId} has been completed.`);
});

orderWorker.on('failed', (job, err) => {
  console.error(`[Worker] Job for order ${job?.data.orderId} has failed with error:`, err);
});