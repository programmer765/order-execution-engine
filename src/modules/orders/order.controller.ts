import { FastifyRequest, FastifyReply } from "fastify";
import { createOrderService } from "./order.service";
import { CreateOrderRequest } from "./order.types";
import { registerSocket, removeSocket } from "../../websocket/socket.registry";
import { OrderStatus } from "./order.types";


// HTTP handler to create a new order
export async function createOrder(
  req: FastifyRequest<{ Body: CreateOrderRequest}>,
  reply: FastifyReply,
) {
  const { tokenIn, tokenOut, amount } = req.body

  const order = await createOrderService({ tokenIn, tokenOut, amount })

  return reply.send({
    id: order.id,
    status: order.status,
  });
}


// WebSocket handler to manage order status updates
export async function orderWebSocketHandler(
  connection: any,
  req: FastifyRequest<{ Querystring: { orderId: string } }>,
) {
  const orderId = req.query.orderId;

  if (!orderId) {
    connection.socket.close();
    return;
  }

  registerSocket(orderId, connection);

  // send initial status
  connection.socket.send(JSON.stringify({ orderId, status: OrderStatus.PENDING }));

  // cleanup on close
  connection.socket.on("close", () => {
    // Remove socket from registry
    removeSocket(orderId);
  })

}