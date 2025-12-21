import crypto from "crypto";
import { CreateOrderRequest, Order, OrderStatus } from "./order.types";


export async function createOrderService(orderReq : CreateOrderRequest) : Promise<Order> {

  const newOrder: Order = {
    id: crypto.randomUUID(),
    tokenIn: orderReq.tokenIn,
    tokenOut: orderReq.tokenOut,
    amount: orderReq.amount,
    status: OrderStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
  };


  return newOrder;
}