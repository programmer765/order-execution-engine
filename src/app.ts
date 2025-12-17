import fastify from "fastify";
import websocket from "@fastify/websocket";
import { orderRoutes } from "./modules/orders/order.routes";

const app = fastify({
  logger: true,
});

app.register(websocket);

app.get("/", async (request, reply) => {
  return { hello: "world" };
});

// app.register(async (app) => {
//   app.get("/api/orders/execute", async (request, reply) => {
//     return { status: "api orders execute" };
//   });
// });

app.register( async (api) => {
  api.register(orderRoutes);
}, { prefix: "/api" });

export default app;