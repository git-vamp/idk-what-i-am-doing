import { Prisma, PrismaClient } from "@prisma/client";
import prisma from '@prisma/client';

export const getUser = async (prisma: PrismaClient, user: string) => {
    return await prisma.user.findFirst({
        where: {
            name: user,
        }
    })
}

export const getPass = async (prisma: PrismaClient, user: string) => {
    return await prisma.user.findFirst({
        where: {
            name: user
        }, select: {
            password: true
        }
    })
}
export const createUser = async (prisma: PrismaClient, user: string, password: string) => {
    return await prisma.user.create({
        data: {
            name: user,
            password: password
        }
    })
}