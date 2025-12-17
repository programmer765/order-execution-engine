import crypto from "crypto";
import { CreateOrderRequest, Order } from "./order.types";


export async function createOrderService(orderReq : CreateOrderRequest) : Promise<Order> {

  const newOrder: Order = {
    id: crypto.randomUUID(),
    tokenIn: orderReq.tokenIn,
    tokenOut: orderReq.tokenOut,
    amount: orderReq.amount,
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Here you would normally have logic to save the order to a database

  return newOrder;
}