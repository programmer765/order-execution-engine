import { Queue, JobsOptions } from "bullmq";
import { ENV } from "../config/env.js";
import IORedis from "ioredis";
import { OrderJobData } from "./order.types";

const connection = new IORedis(ENV.REDIS_URL);

export const orderQueue = new Queue<OrderJobData>("order-execution", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 1000 },
    removeOnComplete: true,
    removeOnFail: false,
  } as JobsOptions,
})

export async function enqueueOrderJob (data: OrderJobData) {
  await orderQueue.add("execute-order", data);
}