import "dotenv/config";

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT) : 3000,
}