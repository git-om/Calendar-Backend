import express from "express";
import { ApolloServer } from "apollo-server-express";
import { createSchema } from "./graphql/schema";
import dotenv from "dotenv";
import "reflect-metadata";

dotenv.config();

const startServer = async () => {
  const app:any = express();
  const schema = await createSchema();

  const server = new ApolloServer({
    schema,
    context: ({ req }) => ({ req }),
  });

  await server.start();
  server.applyMiddleware({ app });

  app.listen(4000, () => {
    console.log("Server running at http://localhost:4000/graphql");
  });
};

startServer();
