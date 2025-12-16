import fastify from "fastify";
import env from "@fastify/env";

const schema = {
  type: "object",
  required: ["PORT"],
  properties: {
    PORT: { type: "number", default: 3000 },
  },
}

const options = {

  schema: schema,
  dotenv: true,
}

fastify().register(env, options).ready((err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log("Environment variables loaded:", fastify());
})