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

@Resolver()
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
        if (!ctx.userId) {
            throw new Error("Not authenticated");
        }
        // Ensure user exists before creating an event
        const existingUser = await prisma.user.findUnique({
            where: { id: ctx.userId }
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




    // --------------

    @Mutation(() => Event)
    async updateEvent(
        @Arg("id") id: string,
        @Ctx() ctx: MyContext,
        @Arg("title", { nullable: true }) title?: string,
        @Arg("description", { nullable: true }) description?: string,
        @Arg("start", { nullable: true }) start?: Date,
        @Arg("end", { nullable: true }) end?: Date
    ) {
        if (!ctx.userId) {
            throw new Error("Not authenticated");
        }

        const existingEvent = await prisma.event.findUnique({
            where: {
                id,
            },
            include: {
                user: true,
            },
        });

        if (!existingEvent) {
            throw new Error("Event not found");
        }

        if (existingEvent.userId !== ctx.userId) {
            throw new Error("You do not have permission to edit this event");
        }

        if (start && end && start > end) {
            throw new Error("Start date cannot be later than end date.");
        }

        const updatedEventData = {
            title: title ?? existingEvent.title,
            description: description ?? existingEvent.description,
            start: start ?? existingEvent.start,
            end: end ?? existingEvent.end,
        };

        const updatedEvent = await prisma.event.update({
            where: { id },
            data: updatedEventData,
            include: { user: true },
        });

        return updatedEvent;
    }

    // ------------------

    @Mutation(() => String)
    async deleteEvent(
        @Arg("id") id: string,
        @Ctx() ctx: MyContext
    ) {
        if (!ctx.userId) {
            throw new Error("Not authenticated");
        }
        if (await prisma.event.delete({ where: { id: id } })) {
            return "Event deleted"
        }
        throw new Error("Unable to delete event")
    }

    @Query(() => [Event])
    async getEvents(
        @Ctx() ctx: MyContext
    ) {
        if (!ctx.userId) {
            throw new Error("Not authenticated");
        }
        const events = await prisma.event.findMany({ where: { userId: ctx.userId } });
        return events;
    }





}