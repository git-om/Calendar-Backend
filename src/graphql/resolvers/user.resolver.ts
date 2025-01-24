import { Resolver, Mutation, Arg, Query, Ctx } from "type-graphql";
import prisma from "../../config/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Token, User } from "../../models/User";
import { Request } from "express";

interface MyContext {
    req: Request;
    userId: string;
}

@Resolver()
export default class UserResolver {
    @Mutation(() => Token)
    async signup(
        @Arg("firstName") firstName: string,
        @Arg("lastName") lastName: string,
        @Arg("email") email: string,
        @Arg("password") password: string
    ): Promise<Token> {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { firstName, lastName, email, password: hashedPassword },
        });
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: "7d" });
        return { token };
    }

    @Mutation(() => Token)
    async signin(
        @Arg("email") email: string,
        @Arg("password") password: string
    ): Promise<Token> {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) throw new Error("Invalid credentials");
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) throw new Error("Invalid credentials");
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: "7d" });
        return { token };
    }

    @Query(() => [User])
    async users() {
        return prisma.user.findMany({
            include: {
                events: true,  // Ensure related events are included
            },
        });
    }

    @Query(() => User, { nullable: true })
    async me(@Ctx() ctx: MyContext) {
        if (!ctx.userId) {
            throw new Error("Not authenticated");
        }
        const user = await prisma.user.findUnique({
            where: { id: ctx.userId },
            include: {
                events: true,  // Include events to match the expected return type
            },
        });
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }

}
