export type OrderStatus = "pending" | "routing" | "building" | "submitted" | "confirmed" | "failed";

export interface CreateOrderRequest {
  tokenIn: string;
  tokenOut: string;
  amount: number;
}

export interface Order {
  id: string;
  tokenIn: string;
  tokenOut: string;
  amount: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}