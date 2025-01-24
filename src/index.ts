import express from "express";
import { ApolloServer } from "apollo-server-express";
import { createSchema } from "./graphql/schema";
import dotenv from "dotenv";
import "reflect-metadata";

dotenv.config();

const startServer = async () => {
    const app: any = express();
    const schema = await createSchema();

    const server = new ApolloServer({
        schema,
        introspection: true,  // Enable introspection
        context: ({ req }) => ({ req }),
    });

    await server.start();
    server.applyMiddleware({ app });

    const port = process.env.PORT || 4000;
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });

};

startServer();
