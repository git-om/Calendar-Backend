import { ObjectType, Field, ID, GraphQLISODateTime} from "type-graphql";
import { User } from "./User";

@ObjectType()
export class Event{
    @Field(() => ID)
    id!: string;

    @Field()
    title!: string;

    @Field()
    description?: string;

    @Field(() => GraphQLISODateTime)
    start!: string;

    @Field(() => GraphQLISODateTime)
    end!: string;

    @Field()
    user!: string;

    @Field()
    userId!: string;
}