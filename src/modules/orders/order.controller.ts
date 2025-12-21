import { FastifyRequest, FastifyReply } from "fastify";
import { createOrderService } from "./order.service";
import { CreateOrderRequest } from "./order.types";
import { registerSocket, removeSocket } from "../../websocket/socket.registry";
import { OrderStatus } from "./order.types";
import { enqueueOrderJob } from "../../queue/order.queue";


// HTTP handler to create a new order
export async function createOrder(
  req: FastifyRequest<{ Body: CreateOrderRequest}>,
  reply: FastifyReply,
) {
  const body = req.body;
  if(!body || typeof body !== 'object') {
    return reply.status(400).send({
      error: "Missing request body",
    });
  }

  const { tokenIn, tokenOut, amount } = req.body
  const missing: string[] = [];
  if (!tokenIn) missing.push("tokenIn");
  if (!tokenOut) missing.push("tokenOut");
  if (amount === undefined || amount === null) missing.push("amount");

  if (missing.length) {
    return reply.status(400).send({
      error: `Missing required field(s): ${missing.join(", ")}`,
    });
  }

  const order = await createOrderService({ tokenIn, tokenOut, amount })
  await enqueueOrderJob({ orderId: order.id, tokenIn, tokenOut, amount });

  return reply.send({
    id: order.id,
    status: order.status,
  });
}


// WebSocket handler to manage order status updates
export async function orderWebSocketHandler(
  connection: WebSocket,
  req: FastifyRequest<{ Querystring: { orderId: string } }>,
) {
  
  const { orderId } = req.query;

  if (!orderId) {
    connection.close();
    return;
  }

  const WSConnection = {
    socket: {
      send: (data: string) => connection.send(data),
      close: () => connection.close(),
    }
  }

  registerSocket(orderId, WSConnection);

  // send initial status
  connection.send(JSON.stringify({ orderId, status: OrderStatus.PENDING }));

  // cleanup on close
  connection.onclose = () => {
    // Remove socket from registry
    removeSocket(orderId);
  }

}