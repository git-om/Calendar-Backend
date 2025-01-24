import { Resolver, Mutation, Arg, Query } from "type-graphql";
import prisma from "../../config/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Token, User } from "../../models/User";

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
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!);
    return {token};

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
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!);
    return {token};
  }

  @Query(() => [User])
  async users() {
    return prisma.user.findMany();
  }
}
