export const enum OrderStatus {
  PENDING = "pending",
  ROUTING = "routing",
  BUILDING = "building",
  SUBMITTED = "submitted",
  CONFIRMED = "confirmed",
  FAILED = "failed",
}

export type OrderStatusTypes = "pending" | "routing" | "building" | "submitted" | "confirmed" | "failed";

export type ExecutionVenue = "raydium" | "meteora";

export interface OrderStatusUpdate {
  orderId: string;
  status: OrderStatus;
  venue?: ExecutionVenue;
  quotedPrice?: number;
  executedPrice?: number;
  txHash?: string;
  at?: Date;
}

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
  status: OrderStatusTypes;
  createdAt: Date;
  updatedAt: Date;
}