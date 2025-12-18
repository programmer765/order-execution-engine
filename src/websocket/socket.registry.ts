import { OrderStatusUpdate } from "../modules/orders/order.types";

type WSConnection = {
  socket: {
    send: (data: string) => void;
    close: () => void;
  };
};

const socketRegistry = new Map<string, Set<WSConnection>>();

export const registerSocket = (orderId: string, connection: WSConnection) => {
  const connections = socketRegistry.get(orderId) || new Set<WSConnection>();
  connections.add(connection);
  socketRegistry.set(orderId, connections);
};

export function removeSocket(orderId: string) {
  socketRegistry.delete(orderId);
}

export function sendStatusUpdate(orderId: string, status: OrderStatusUpdate) {
  const connection = socketRegistry.get(orderId);
  if(!connection || connection.size === 0) return
  
  const payload = JSON.stringify({ ...status, at: status.at ?? new Date().toISOString() });

  connection.forEach(conn => {
    try {
      conn.socket.send(payload);
    }
    catch (error) {
      console.error(`Failed to send status update to orderId ${orderId}:`, error);
      connection.delete(conn);
    }
  });

  if (connection.size === 0) {
    socketRegistry.delete(orderId);
  }
}

export function closeSocket(orderId: string) {
  const connection = socketRegistry.get(orderId);
  if(!connection || connection.size === 0) return
  
  connection.forEach(conn => {
    try {
      conn.socket.close();
    }
    catch (error) {
      console.error(`Failed to close socket for orderId ${orderId}:`, error);
    }
  });

  socketRegistry.delete(orderId);
}


