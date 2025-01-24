import { Resolver, Mutation, Arg, Query, Ctx } from "type-graphql";
import prisma from "../../config/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Token, User } from "../../models/User";
import { Request } from "express";
import { Event } from "../../models/Event";

interface MyContext {
    req: Request;
    userId: string;
}

@Resolver(() => Event)
export class EventResolver {
    @Mutation(() => Event)
    async createEvent(
        @Arg("title") title: string,
        @Arg("description") description: string,
        @Arg("start") start: Date,
        @Arg("end") end: Date,
        @Arg("userId") userId: string,
        @Ctx() ctx: MyContext
    ) {
        // Ensure user exists before creating an event
        const existingUser = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!existingUser) {
            throw new Error("User not found");
        }

        // Create the event and include user details
        const event = await prisma.event.create({
            data: {
                title,
                description,
                start,
                end,
                user: {
                    connect: { id: userId }
                }
            },
            include: { user: true } // Ensure user is fetched to avoid null error
        });

        return event;
    }
}