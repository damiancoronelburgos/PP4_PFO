// ===== Prisma Client (singleton) =====
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Export default + named
export default prisma;
export { prisma };

// ===== Cierre limpio =====
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});