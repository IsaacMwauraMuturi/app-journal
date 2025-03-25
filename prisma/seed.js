import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash("12345", 10);
    // Upsert roles
    const adminRole = await prisma.role.upsert({
        where: { name: "Admin" },
        update: {},
        create: { name: "Admin" }
    });

    const userRole = await prisma.role.upsert({
        where: { name: "User" },
        update: {},
        create: { name: "User" }
    });

    console.log("Seeded roles:", { adminRole, userRole });

    // Seed an Admin User
    await prisma.user.upsert({
        where: { email: "admin@example.com" },
        update: {},
        create: {
            name: "Super Admin",
            email: "admin@me.com",
            phone: "0715934415",
            password: hashedPassword,
            roleId: adminRole.id
        }
    });

    console.log("Admin user seeded!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
