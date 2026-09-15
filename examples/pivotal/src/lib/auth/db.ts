import { PrismaClient } from '@prisma/client';

import { applyPortalDatabaseUrl } from '@/lib/auth/sqlite-url';

/** Bump when PrismaClient construction strategy changes so hot reload drops stale clients. */
const PRISMA_CLIENT_VERSION = 2;

type PrismaGlobal = {
  prisma?: PrismaClient;
  prismaDatabaseUrl?: string;
  prismaClientVersion?: number;
};

const globalForPrisma = globalThis as unknown as PrismaGlobal;

function createPrismaClient(databaseUrl: string): PrismaClient {
  // Pass url explicitly so Next.js webpack cannot inline process.env.DATABASE_URL as undefined
  // inside Prisma's generated client (which caused "Environment variable not found: DATABASE_URL").
  return new PrismaClient({
    datasources: {
      db: { url: databaseUrl },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

function getPrismaClient(): PrismaClient {
  const databaseUrl = applyPortalDatabaseUrl();

  const mustRecreate =
    !globalForPrisma.prisma ||
    globalForPrisma.prismaDatabaseUrl !== databaseUrl ||
    globalForPrisma.prismaClientVersion !== PRISMA_CLIENT_VERSION;

  if (!mustRecreate && globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  if (globalForPrisma.prisma) {
    void globalForPrisma.prisma.$disconnect().catch(() => undefined);
  }
  const prismaClient = createPrismaClient(databaseUrl);
  globalForPrisma.prisma = prismaClient;
  globalForPrisma.prismaDatabaseUrl = databaseUrl;
  globalForPrisma.prismaClientVersion = PRISMA_CLIENT_VERSION;
  return prismaClient;
}

export const prisma = getPrismaClient();
