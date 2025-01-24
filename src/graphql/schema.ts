import "reflect-metadata";
import { buildSchema } from "type-graphql";
import UserResolver from "./resolvers/user.resolver";
// import EventResolver from "./resolvers/event.resolver";

export const createSchema = async () => {
  return await buildSchema({
    resolvers: [UserResolver],
  });
};
