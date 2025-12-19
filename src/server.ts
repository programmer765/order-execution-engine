import app from "./app";
import { ENV } from "./config/env";
import { orderWorker } from "./queue/order.worker";

const PORT = ENV.PORT;

const server = async () => {
  try {
    console.log("Starting worker...");
    await orderWorker.waitUntilReady();
    console.log("Worker is ready.");

    await app.listen({ port: PORT, host: "0.0.0.0" });
    console.log(`Server is running at http://localhost:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

server();