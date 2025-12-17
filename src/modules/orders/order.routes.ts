import { FastifyInstance } from "fastify";
import { createOrder } from "./order.controller";


export async function orderRoutes(app: FastifyInstance) {
  app.post("/orders/execute", createOrder);
}