import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;

  if (!superAdminEmail || !superAdminPassword) {
    console.warn(
      "SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD are not set in .env. Skipping super admin creation."
    );
  } else {
    const hashedPassword = await bcrypt.hash(superAdminPassword, 10);

    const existingAdmin = await prisma.user.findUnique({
      where: { email: superAdminEmail },
    });

    if (!existingAdmin) {
      const admin = await prisma.user.create({
        data: {
          email: superAdminEmail,
          passwordHash: hashedPassword,
          role: UserRole.ADMIN,
          emailVerifiedAt: new Date(), // Pre-verify the admin's email
          firstName: "Super",
          surname: "Admin",
        },
      });
      console.log(`✅ Super admin user created with email: ${superAdminEmail}`);

      // Create an audit log entry for the super admin creation
      await prisma.activityLog.create({
        data: {
          action: "SEED_SUPER_ADMIN",
          entity: "User",
          entityId: admin.id,
          userId: "SYSTEM",
          metadata: { email: superAdminEmail },
          ipAddress: "127.0.0.1",
        },
      });
    } else {
      // Update the existing admin's password to match the .env file
      await prisma.user.update({
        where: { email: superAdminEmail },
        data: {
          passwordHash: hashedPassword,
          role: UserRole.ADMIN, // Ensure they haven't been demoted accidentally
        },
      });
      console.log(`cw Super admin user updated. Password synchronized from .env for: ${superAdminEmail}`);
    }
  }

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });