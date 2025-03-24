import { json, type ActionFunctionArgs } from "@remix-run/node";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import validator from "validator"; // Email validation

const prisma = new PrismaClient();

export async function action({ request }: ActionFunctionArgs) {
    try {
        const formData = await request.json();
        const { name, email, phone, password, confirmPassword } = formData;

        // Input validation and sanitization
        if (!name || !email || !phone || !password || !confirmPassword) {
            return json({ error: "All fields are required" }, { status: 400 });
        }

        // Sanitize and trim inputs
        const sanitizedEmail = validator.normalizeEmail(email.trim());
        const sanitizedPhone = phone.trim();
        const sanitizedPassword = password.trim();

        if (!validator.isEmail(sanitizedEmail)) {
            return json({ error: "Invalid email format" }, { status: 400 });
        }

        if (sanitizedPassword !== confirmPassword.trim()) {
            return json({ error: "Passwords do not match" }, { status: 400 });
        }

        // Check if email or phone already exists in the database
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email: sanitizedEmail }, { phone: sanitizedPhone }],
            },
        });

        if (existingUser) {
            return json({ error: "Email or phone already in use" }, { status: 400 });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(sanitizedPassword, 10);

        // Create new user in the database
        const newUser = await prisma.user.create({
            data: {
                name: name.trim(),
                email: sanitizedEmail,
                phone: sanitizedPhone,
                password: hashedPassword,
            },
        });

        // Return success response
        return json({ message: "Registration successful", userId: newUser.id }, { status: 201 });
    } catch (error) {
        console.error("Error during registration:", error);
        return json({ error: "An error occurred during registration. Please try again later." }, { status: 500 });
    } finally {
        // Always disconnect Prisma to prevent database connection leaks
        await prisma.$disconnect();
    }
}
