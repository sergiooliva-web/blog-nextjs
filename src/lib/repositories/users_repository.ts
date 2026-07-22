import { prisma } from "@/lib/db/db";
import { repositoryWithDatabaseErrors } from "./repositories_wrapper";
import { Prisma } from "@prisma/client";

const safeUserSelect = {
  id: true,
  email: true,
  name: true,
} satisfies Prisma.UserSelect;

const fullUserSelect = {
  id: true,
  email: true,
  name: true,
  passwordHash: true,
} satisfies Prisma.UserSelect;

export type SafeUserDTO = Prisma.UserGetPayload<{
  select: typeof safeUserSelect;
}>;

export type FullUserDTO = Prisma.UserGetPayload<{
  select: typeof fullUserSelect;
}>;

export const usersRepository = {
  getByEmail: repositoryWithDatabaseErrors(async (email: string) => {
    return await prisma.user.findUnique({
      where: { email },
      select: fullUserSelect,
    });
  }),

  createUser: repositoryWithDatabaseErrors(
    async (email: string, name: string, passwordHash: string) => {
      return await prisma.user.create({
        data: {
          email,
          name,
          passwordHash,
        },
        select: safeUserSelect,
      });
    },
  ),
};
