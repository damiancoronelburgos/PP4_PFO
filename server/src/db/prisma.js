// ESM
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default prisma;         // <-- default export
// opcional: named
export { prisma };

// cierre limpio
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});