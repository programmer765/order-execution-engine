import app from "./app";
import { ENV } from "./config/env";

const PORT = ENV.PORT;

const server = async () => {
  try {
    await app.listen({ port: PORT, host: "0.0.0.0" });
    console.log(`Server is running at http://localhost:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

server();