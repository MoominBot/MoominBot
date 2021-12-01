import Prisma from "@prisma/client";

const { PrismaClient } = Prisma;

const prisma = new PrismaClient();

await prisma.$connect();

export default prisma;
