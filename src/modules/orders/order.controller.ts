import { FastifyRequest, FastifyReply } from "fastify";
import { createOrderService } from "./order.service";
import { CreateOrderRequest } from "./order.types";


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