import { FastifyInstance } from "fastify";
import { createOrder, orderWebSocketHandler } from "./order.controller";


export async function orderRoutes(app: FastifyInstance) {
  
  app.post("/orders/execute", createOrder);
  

  app.get("/orders/execute", { websocket: true }, orderWebSocketHandler);

}