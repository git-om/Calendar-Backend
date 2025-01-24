import { Resolver, Mutation, Arg, Query } from "type-graphql";
import prisma from "../../config/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../../models/User";

@Resolver()
export default class UserResolver {
  @Mutation(() => String)
  async signup(
    @Arg("firstName") firstName: string,
    @Arg("lastName") lastName: string,
    @Arg("email") email: string,
    @Arg("password") password: string
  ): Promise<string> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { firstName, lastName, email, password: hashedPassword },
    });
    return jwt.sign({ userId: user.id }, process.env.JWT_SECRET!);
  }

  @Mutation(() => String)
  async signin(
    @Arg("email") email: string,
    @Arg("password") password: string
  ): Promise<string> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("Invalid credentials");
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error("Invalid credentials");
    return jwt.sign({ userId: user.id }, process.env.JWT_SECRET!);
  }

  @Query(() => [User])
  async users() {
    return prisma.user.findMany();
  }
}
