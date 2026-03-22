import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function makeAdmin() {
  const targetEmail = "boshanokutenda@gmail.com";
  console.log(`Attempting to promote ${targetEmail} to ADMIN...`);

  try {
    const user = await prisma.user.findUnique({
      where: { email: targetEmail },
    });

    if (!user) {
      console.error(
        `❌ Error: User with email "${targetEmail}" not found. Please ask them to register a normal account first, then run this script again.`
      );
      process.exit(1);
    }

    if (user.role === UserRole.ADMIN) {
      console.log(`✅ User "${targetEmail}" is already an ADMIN.`);
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { role: UserRole.ADMIN },
    });

    console.log(`✅ Successfully promoted "${targetEmail}" to ADMIN.`);
  } catch (error) {
    console.error("An error occurred during the promotion process:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

makeAdmin();