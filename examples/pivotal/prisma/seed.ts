import { PrismaClient } from '@prisma/client';

import { applyPortalDatabaseUrl } from '../src/lib/auth/sqlite-url';
import { hashPassword } from '../src/lib/auth/password';

applyPortalDatabaseUrl();

const prisma = new PrismaClient();

const SEED_CUSTOMERS = [
  { slug: 'chipotle', name: 'Chipotle' },
  { slug: 'tacobell', name: 'Taco Bell' },
] as const;

const SEED_USERS = [
  { email: 'chipotle@example.com', password: 'password123', customerSlug: 'chipotle' },
  { email: 'tacobell@example.com', password: 'password123', customerSlug: 'tacobell' },
] as const;

async function main() {
  for (const customer of SEED_CUSTOMERS) {
    await prisma.customer.upsert({
      where: { slug: customer.slug },
      update: { name: customer.name },
      create: customer,
    });
  }

  for (const user of SEED_USERS) {
    const customer = await prisma.customer.findUnique({ where: { slug: user.customerSlug } });
    if (!customer) {
      throw new Error(`Missing customer: ${user.customerSlug}`);
    }

    const passwordHash = await hashPassword(user.password);
    await prisma.user.upsert({
      where: { email: user.email },
      update: { passwordHash, customerId: customer.id },
      create: {
        email: user.email,
        passwordHash,
        customerId: customer.id,
      },
    });
  }

  console.info('Seeded portal auth customers and users.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
