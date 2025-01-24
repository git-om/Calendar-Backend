import { Resolver, Mutation, Arg, Query, Ctx } from "type-graphql";
import prisma from "../../config/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Token, User } from "../../models/User";
import { Request } from "express";

interface MyContext {
    req: Request;
    userId: string | null;
}